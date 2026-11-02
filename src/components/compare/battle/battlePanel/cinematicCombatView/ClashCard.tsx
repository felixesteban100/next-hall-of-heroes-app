"use client";

import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import {
    Crown, Skull, Shield, Swords,
    ChevronRight, ChevronLeft,
    Sparkles,
    Atom,
    Lock,
} from "lucide-react";
import { ActionEvent } from "../CinematicCombatView";
import { motion, AnimatePresence } from "framer-motion";
import { resolveActivePower } from "@/lib/compare/cinematicCombatView";
import { cn } from "@/lib/utils";
import { CharacterImage } from "@/components/shared/CharacterImage";
import PowerOverlay, { CombatActionType } from "./PowerOverlay";
import { useEffect, useState, useRef } from "react";
import { FighterState } from "../useCombatScript";
import { HEALTH_DROP_DELAY, KO_VISUAL_DELAY } from "./TeamColumn";



const ACTIVATION_VERB: Record<string, string> = {
    Instant: "Unleashes",
    Action: "Channels",
    Passive: "Triggers",
    Channeled: "Sustains",
};

const RANGE_SUFFIX: Record<string, string> = {
    Self: "on self",
    Touch: "up close",
    Melee: "in melee",
    Ranged: "from a distance",
    "Melee / Ranged": "across the field",
    Global: "across dimensions",
};

const ROLE_STYLE: Record<PowerRole, {
    Icon: React.ElementType;
    text: string;
    glow: string;
    bg: string;
    border: string;
    label: string;
}> = {
    "Offensive": { Icon: Swords, text: "text-red-400", glow: "shadow-red-500/50", bg: "bg-red-500/15", border: "border-red-500/40", label: "Offensive" },
    "Defensive": { Icon: Shield, text: "text-cyan-400", glow: "shadow-cyan-500/40", bg: "bg-cyan-500/15", border: "border-cyan-500/40", label: "Defensive" },
    "Control": { Icon: Lock, text: "text-violet-400", glow: "shadow-violet-500/40", bg: "bg-violet-500/15", border: "border-violet-500/40", label: "Control" },
    "Utility": { Icon: Sparkles, text: "text-emerald-400", glow: "shadow-emerald-500/40", bg: "bg-emerald-500/15", border: "border-emerald-500/40", label: "Utility" },
    "Hybrid / Versatile": { Icon: Atom, text: "text-amber-400", glow: "shadow-amber-500/40", bg: "bg-amber-500/15", border: "border-amber-500/40", label: "Hybrid" },
};

// ── Timeline phases ──────────────────────────────────────────────────────────
// Phase 0 → fighters slide in (mount); attacker charge overlay is visible
// Phase 1 → attacker's PowerOverlay becomes visible + sound plays; charge aura fades
// Phase 2 → damage flash + popup + health bar drop + impact burst on defender
// Phase 3 → KO skull appears (only when isKO)
type CombatPhase = 0 | 1 | 2 | 3;

const PHASE_1_DELAY = 600;   // ms after mount → impact
const PHASE_2_DELAY = HEALTH_DROP_DELAY;   // ms after mount → damage numbers
const PHASE_3_DELAY = KO_VISUAL_DELAY;  // ms after mount → KO skull

// ── Impact Overlay ───────────────────────────────────────────────────────────
// A lightweight shockwave burst shown on the defender at phase 2.
// No sound — the main PowerOverlay already handled audio at phase 1.
function ImpactOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <motion.div
            className="absolute inset-0 z-25 pointer-events-none rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 0] }}
            transition={{ duration: 0.55, times: [0, 0.12, 0.45, 1], ease: "easeOut" }}
        >
            {/* Radial white shockwave */}
            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,120,50,0.5)_35%,transparent_70%)]" />
            {/* Hard rim flash */}
            <div className="absolute inset-0 rounded-lg border-2 border-white/80" />
            {/* Scan line sweep */}
            <motion.div
                className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-lg"
                initial={{ y: "-100%" }}
                animate={{ y: "200%" }}
                transition={{ duration: 0.3, ease: "easeIn" }}
            />
        </motion.div>
    );
}

interface FighterSlotProps {
    fighter?: FighterState;
    roleLabel: string;
    isTeamA: boolean;
    isKO?: boolean;
    action: CombatActionType;
    // Whether this slot should show the main (attacker) PowerOverlay
    showOverlay?: boolean;
    // Whether this slot is the defender (shows impact burst at phase 2)
    isDefender?: boolean;
    badgeColorClass?: string;
    activePower: Power | undefined;
    damagePopup?: number | null;
    healPopup?: number | null;
    // Timeline-driven props
    phase: CombatPhase;
}

function FighterSlot({
    fighter,
    roleLabel,
    isTeamA,
    isKO = false,
    action,
    showOverlay = false,
    isDefender = false,
    badgeColorClass,
    activePower,
    damagePopup,
    healPopup,
    phase,
}: FighterSlotProps) {
    if (!fighter) return <div className="w-17" />;

    const teamTextClass = isTeamA ? "text-primary" : "text-secondary";
    const teamBorderClass = isTeamA ? "border-primary shadow-primary/40" : "border-secondary shadow-secondary/40";

    // ── Dual overlay visibility ───────────────────────────────────────────────
    // Attacker charge aura: active at phase 0, fades once phase 1 fires
    // (PowerOverlay handles its own fade via po-fade CSS class)
    const chargeOverlayVisible = showOverlay && !isDefender && phase === 0;
    // Attacker main overlay: visible from phase 1 onward (plays sound)
    const mainOverlayVisible = showOverlay && !isDefender && phase >= 1;
    // Defender impact burst: fires exactly at phase 2
    const impactVisible = isDefender && phase === 2;
    // Damage flash: also fires at phase 2 on defender
    const showDamageFlash = isDefender && phase >= 2;
    // KO skull: only at phase 3
    const showKO = isKO && phase >= 3;
    // Damage/heal popup: at phase 2
    const showPopup = phase >= 2;

    return (
        <div className="flex flex-col items-center gap-1 min-w-18 relative">

            <AnimatePresence>
                {showPopup && damagePopup != null && damagePopup > 0 && (
                    <motion.span
                        key="damage"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute text-red-500 text-[6px] z-40 pointer-events-none"
                    >
                        (-{damagePopup} HP)
                    </motion.span>
                )}
                {showPopup && healPopup != null && healPopup > 0 && (
                    <motion.span
                        key="heal"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute text-emerald-400 text-[6px] z-40 pointer-events-none"
                    >
                        (+{healPopup} HP)
                    </motion.span>
                )}
            </AnimatePresence>

            <span className={cn("text-[8px] font-black uppercase tracking-wider flex flex-col items-center justify-center", badgeColorClass ?? (isTeamA ? "text-primary" : "text-secondary"))}>
                <span>{roleLabel}</span>
            </span>

            <div className="relative w-17 h-17 shrink-0 overflow-visible">
                {/* 1. Character Image Container */}
                <div className={cn(
                    "w-full h-full rounded-lg overflow-hidden border-2 shadow-md relative transition-colors duration-300 z-0",
                    showKO ? "border-white shadow-black/60" : teamBorderClass
                )}>
                    <motion.div
                        className="w-full h-full relative"
                        initial={{ filter: "grayscale(0%) contrast(100%)" }}
                        animate={showKO ? { filter: "grayscale(100%) contrast(125%)" } : { filter: "grayscale(0%) contrast(100%)" }}
                        transition={{ duration: 0.35 }}
                    >
                        <CharacterImage
                            src={fighter.image}
                            alt={fighter.name}
                            imageFocus={fighter.imageFocus}
                            fill
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Damage flash — fires at phase 2, only on defender */}
                    <AnimatePresence>
                        {showDamageFlash && (
                            <motion.div
                                key="damage-flash"
                                className="absolute inset-0 bg-red-400/50 pointer-events-none rounded-lg z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.6, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.55, times: [0, 0.15, 0.5, 1] }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* 2a. Attacker charge aura — shows at phase 0 before the main overlay fires.
                        Uses PowerOverlay with visible=false so it renders the themed backdrop
                        at low opacity as a "winding up" effect, no sound. */}
                {/* {showOverlay && !isDefender && action && (
                    <div className={cn(
                        "absolute inset-0 z-15 pointer-events-none overflow-visible transition-opacity duration-300",
                        chargeOverlayVisible ? "opacity-40" : "opacity-0"
                    )}>
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={true}
                        />
                    </div>
                )} */}

                {/* 2b. Attacker main overlay — fires at phase 1, plays sound */}
                {/* showOverlay &&  */!isDefender /* && action */ && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={/* mainOverlayVisible */true}
                        />
                    </div>
                )}

                {/* 2c. Defender impact burst — fires at phase 2 */}
                <ImpactOverlay visible={impactVisible} />

                {/* 3. Dramatic K.O. Overlay — fires at phase 3 */}
                <AnimatePresence>
                    {showKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                            animate={{ scale: 0.95, opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg z-30"
                        >
                            <Skull className="size-7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span className={cn("font-bold text-[9.5px] truncate text-center max-w-[72px]", teamTextClass)}>
                {fighter.name}
            </span>
        </div>
    );
}

function getFighterMotionProfile(
    role?: PowerRole,
    isAttacker?: boolean,
    isTeamA: boolean = true,
    isDefending: boolean = false
) {
    const dir = isTeamA ? 1 : -1;
    if (!isAttacker) {
        if (isDefending) {
            return { x: [0, -3 * dir, 0], scale: [1, 1.05, 1], rotate: 0 };
        }
        return { x: [0, 0, -18 * dir, 0], scale: [1, 1, 0.92, 1], rotate: [0, 0, -6 * dir, 0] };
    }
    switch (role) {
        case "Offensive":
            return { x: [0, 0, 48 * dir, 0], scale: [1, 1.05, 1.15, 1], rotate: [0, 0, 5 * dir, 0] };
        case "Control":
            return { x: [0, 0, 42 * dir, 0], y: [0, -20, -20, 0], scale: [1, 1.08, 1.15, 1], rotate: [0, -8 * dir, 8 * dir, 0] };
        case "Utility":
            return { x: [0, 0, 38 * dir, 0], y: [0, -12, 0], scale: [1, 1.05, 1.1, 1], rotate: 0 };
        case "Defensive":
            return { x: [0, 0, 36 * dir, 0], scale: [1, 1.08, 1.12, 1], rotate: 0 };
        case "Hybrid / Versatile":
        default:
            return { x: [0, 0, 45 * dir, 0], scale: [1, 1.05, 1.12, 1], rotate: 0 };
    }
}

// ── Health bar that drops when phase hits 2 ──────────────────────────────────
function SyncedHealthBar({
    currentHp,
    maxHp,
    isTeamA,
    phase,
    isAlive,
}: {
    currentHp: number;
    maxHp: number;
    isTeamA: boolean;
    phase: CombatPhase;
    isAlive: boolean;
}) {
    const hpPercent = Math.max(0, Math.min(100, (isAlive ? currentHp : 0) / maxHp * 100));
    // Hold the visual at 100% until phase 2, then animate to real value
    const [displayPercent, setDisplayPercent] = useState(hpPercent);

    useEffect(() => {
        if (phase >= 2) {
            setDisplayPercent(hpPercent);
        }
    }, [phase, hpPercent]);

    return (
        <div className="w-[68px] flex flex-col gap-0.5 mt-0.5">
            <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                {/* <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        displayPercent > 50
                            ? (isTeamA ? "bg-primary" : "bg-secondary")
                            : displayPercent > 20
                                ? "bg-yellow-400"
                                : "bg-red-500"
                    )}
                    style={{ width: `${displayPercent}%` }}
                /> */}
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700",
                        hpPercent > 50
                            ? (isTeamA ? "bg-primary" : "bg-secondary")
                            : hpPercent > 20
                                ? "bg-yellow-400"
                                : "bg-red-500"
                    )}
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
            <span className="text-[7px] font-mono text-center text-muted-foreground/80 leading-none">
                {phase >= 2 ? `${Math.max(0, currentHp)}/${maxHp}` : `${maxHp}/${maxHp}`}
            </span>
        </div>
    );
}

export default function ClashCard({
    event,
    allChars,
    teamAChars,
}: {
    event: ActionEvent | null;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
}) {
    // ── Combat phase timeline ─────────────────────────────────────────────────
    const [phase, setPhase] = useState<CombatPhase>(0);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        // Clear any running timers from a previous event
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        // Reset to phase 0 on every new event
        setPhase(0);

        if (!event) return;

        const isHealRevive = event.log.type === "heal" || event.log.type === "revive";
        const isFinish = event.log.type === "finish" || event.log.type === "rout";

        if (isHealRevive || isFinish) {
            // For heal/revive/finish, jump straight to phase 1 then 2 quickly
            timersRef.current.push(setTimeout(() => setPhase(1), 200));
            timersRef.current.push(setTimeout(() => setPhase(2), 400));
            return;
        }

        // Normal attack / KO / defend timeline
        // Phase 0 → attacker charge aura glows (no timeout needed, it's the default state)
        // Phase 1 → main overlay fires + sound
        timersRef.current.push(setTimeout(() => setPhase(1), PHASE_1_DELAY));
        // Phase 2 → damage flash + impact burst + health bar drop
        timersRef.current.push(setTimeout(() => setPhase(2), PHASE_2_DELAY));
        // Phase 3 → KO skull (only for KO events)
        if (event.log.type === "ko" || event.log.isKO) {
            timersRef.current.push(setTimeout(() => setPhase(3), PHASE_3_DELAY));
        }

        return () => timersRef.current.forEach(clearTimeout);
    }, [event?.key]);

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-muted-foreground/30 py-8">
                <Swords className="size-8 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">Awaiting Combat</span>
            </div>
        );
    }

    const { log, attacker, defender } = event;
    const activePower = resolveActivePower(log, attacker, allChars);
    const role = activePower ? ROLE_STYLE[activePower.combatRole] : null;
    const RoleIcon = role?.Icon ?? Swords;

    const flavorLine = activePower
        ? `${ACTIVATION_VERB[activePower.activationType] ?? "Uses"} ${activePower.name} ${RANGE_SUFFIX[activePower.range] ?? ""}`
        : null;

    if (log.type === "finish" || log.type === "rout") {
        const isVictory = log.type === "finish";
        const meta = (log as any).metadata;

        return (
            <div className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 w-full h-full overflow-y-auto max-h-[240px] [scrollbar-width:none]">
                <motion.div
                    initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                        "p-1.5 rounded-full border-2 shadow-lg",
                        isVictory ? "bg-amber-400/20 border-amber-400/60 shadow-amber-500/30" : "bg-red-500/20 border-red-500/60 shadow-red-500/30"
                    )}
                >
                    {isVictory ? <Crown className="size-4 text-amber-400 animate-bounce" /> : <Skull className="size-4 text-red-400 animate-pulse" />}
                </motion.div>

                <div className="flex flex-col items-center gap-0 text-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">
                        {meta?.winType ?? "Engagement Concluded"}
                    </span>
                    <p className="text-[7.5px] font-semibold text-foreground/90 max-w-[270px]">
                        {log.text}
                    </p>
                </div>

                {meta && (
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] mt-1">
                        {/* Team A Telemetry */}
                        <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-primary/10 border border-primary/30">
                            <span className="text-[7px] font-black uppercase tracking-wider text-primary border-b border-primary/20 pb-0.5">Team A Honors</span>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Top Striker:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.mvpA?.name ?? "N/A"} ({meta.mvpA?.damageDealt ?? 0} DMG)</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Iron Wall:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.wallA?.name ?? "N/A"} ({meta.wallA?.damageBlocked ?? 0})</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Aggressor:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.strikerA?.name ?? "N/A"} ({meta.strikerA?.attacksLanded ?? 0} Hits)</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Resurrector:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.reviveA?.name ?? "N/A"} ({meta.reviveA?.revivals ?? 0})</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Medic:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.healerA?.name ?? "N/A"} ({meta.healerA?.healingDone ?? 0} HP)</span>
                            </div>
                        </div>

                        {/* Team B Telemetry */}
                        <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-secondary/10 border border-secondary/30">
                            <span className="text-[7px] font-black uppercase tracking-wider text-secondary border-b border-secondary/20 pb-0.5">Team B Honors</span>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Top Striker:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.mvpB?.name ?? "N/A"} ({meta.mvpB?.damageDealt ?? 0} DMG)</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Iron Wall:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.wallB?.name ?? "N/A"} ({meta.wallB?.damageBlocked ?? 0})</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Aggressor:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.strikerB?.name ?? "N/A"} ({meta.strikerB?.attacksLanded ?? 0} Hits)</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Resurrector:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.reviveB?.name ?? "N/A"} ({meta.reviveB?.revivals ?? 0})</span>
                            </div>
                            <div className="flex justify-between items-center text-[7.5px]">
                                <span className="text-muted-foreground font-semibold">Medic:</span>
                                <span className="font-bold text-foreground truncate max-w-[80px]">{meta.healerB?.name ?? "N/A"} ({meta.healerB?.healingDone ?? 0} HP)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (log.type === "heal" || log.type === "revive") {
        const isHeal = log.type === "heal";
        const char = isHeal ? attacker : (defender ?? attacker);
        const accentColor = isHeal ? "emerald-400" : "purple-400";
        const healVal = log.healing;

        return (
            <div className="flex flex-col items-center justify-center gap-2 py-4 px-4 w-full h-full">
                {char && (
                    <FighterSlot
                        fighter={char}
                        roleLabel={isHeal ? "HEALING" : "REVIVED"}
                        isTeamA={teamAChars.some((c) => c.name === char.name)}
                        action={isHeal ? "heal" : "revive"}
                        showOverlay={true}
                        badgeColorClass={accentColor}
                        activePower={activePower}
                        healPopup={isHeal ? healVal : null}
                        phase={phase}
                        isDefender={false}
                    />
                )}
                {log.powerName && <p className="text-[9px] text-muted-foreground font-medium">{log.powerName}</p>}
                {/* <SyncedHealthBar
                    currentHp={char?.currentHp ?? 0}
                    isAlive={char?.isAlive ?? true}
                    maxHp={char?.maxHp ?? 1}
                    isTeamA={teamAChars.some((c) => c.name === char?.name)}
                    phase={phase}
                /> */}
                <p className="text-[7.5px] font-semibold text-muted-foreground text-center">{log.text}</p>
            </div>
        );
    }

    const isKO = log.type === "ko" || log.isKO;
    const isDefend = log.type === "defend";
    const damageValue = log.damage ?? (isKO ? 15 : null);

    const defenderChar = defender ?? attacker;
    const attackerChar = attacker ?? defender;

    const isDefenderInTeamA = teamAChars.some((c) => c.name === defenderChar?.name);
    const isAttackerInTeamA = log.variant === "primary";

    const leftFighter = isDefend
        ? (isDefenderInTeamA ? defenderChar : attackerChar)
        : (isAttackerInTeamA ? attacker : defender);

    const rightFighter = isDefend
        ? (isDefenderInTeamA ? attackerChar : defenderChar)
        : (isAttackerInTeamA ? defender : attacker);

    const leftIsAttacker = isDefend ? !isDefenderInTeamA : isAttackerInTeamA;
    const rightIsAttacker = !leftIsAttacker;

    const leftIsKO = isKO && !isAttackerInTeamA;
    const rightIsKO = isKO && isAttackerInTeamA;

    const leftDamagePopup = !leftIsAttacker ? damageValue : null;
    const rightDamagePopup = !rightIsAttacker ? damageValue : null;

    const ArrowIcon = leftIsAttacker ? ChevronRight : ChevronLeft;

    return (
        <div className="flex flex-col items-center justify-between gap-2.5 py-3 px-3 w-full h-full">
            <div className="flex flex-col items-center gap-0.5">
                <span className={cn(
                    "text-[10px] font-black tracking-wider uppercase",
                    isKO ? "text-orange-400" : isDefend ? "text-cyan-400" : "text-muted-foreground"
                )}>
                    {isKO ? "💥 K.O. ELIMINATION" : isDefend ? "🛡 SHIELD BLOCK" : "STRIKE ENGAGEMENT"}
                </span>
                {flavorLine && <p className="text-[9px] text-muted-foreground/80 text-center truncate max-w-[260px]">{flavorLine}</p>}
            </div>

            <div className="flex items-center justify-between gap-2 w-full px-1 overflow-visible">
                {/* Left Fighter */}
                <motion.div
                    initial={{ x: -40, opacity: 1, scale: 0.2 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <motion.div
                        animate={getFighterMotionProfile(activePower?.combatRole, leftIsAttacker, true, isDefend)}
                        transition={{ duration: 1, times: [0, 0.4, 0.75, 1], ease: [0.175, 0.885, 0.32, 1.275] }}
                    >
                        <FighterSlot
                            fighter={leftFighter}
                            roleLabel={isDefend ? (isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER") : (leftIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")}
                            isTeamA={true}
                            isKO={leftIsKO}
                            action={isDefend ? (isDefenderInTeamA ? "defend" : "attack") : (leftIsAttacker ? "attack" : "defend")}
                            showOverlay={leftIsAttacker || isDefend}
                            badgeColorClass={isDefend && isDefenderInTeamA ? "text-cyan-400" : undefined}
                            activePower={activePower}
                            damagePopup={leftDamagePopup}
                            phase={phase}
                            isDefender={!leftIsAttacker && !isDefend}
                        />
                        {/* <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700",
                                hpPercent > 50
                                    ? (isTeamA ? "bg-primary" : "bg-secondary")
                                    : hpPercent > 20
                                        ? "bg-yellow-400"
                                        : "bg-red-500"
                            )}
                            style={{ width: `${hpPercent}%` }}
                        /> */}
                        {/* <SyncedHealthBar
                            currentHp={leftFighter?.currentHp ?? 0}
                            isAlive={leftFighter?.isAlive ?? true}
                            maxHp={leftFighter?.maxHp ?? 1}
                            isTeamA={true}
                            phase={phase}
                        /> */}
                    </motion.div>
                </motion.div>

                {/* Center Hub */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 400, damping: 20 }}
                    className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
                >
                    <div className={cn(
                        "p-2 rounded-full border shadow-sm shrink-0",
                        isDefend ? "bg-cyan-500/15 border-cyan-500/40" : role ? `${role.bg} ${role.border}` : "bg-muted/20 border-muted-foreground/20"
                    )}>
                        {isDefend ? <Shield className="size-4 text-cyan-400" /> : <RoleIcon className={cn("size-4", role?.text ?? "text-muted-foreground")} />}
                    </div>

                    {!isDefend && (
                        <motion.div animate={{ x: leftIsAttacker ? [0, 4, 0] : [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
                            <ArrowIcon className={cn("size-4", leftIsAttacker ? "text-primary" : "text-secondary")} />
                        </motion.div>
                    )}

                    {log.powerName && (
                        <span className={cn(
                            "text-[8px] font-bold text-center px-2 py-0.5 rounded-full border truncate max-w-[110px]",
                            isDefend ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" : role ? `${role.bg} ${role.border} ${role.text}` : "bg-primary/10 border-primary/30 text-primary"
                        )}>
                            {log.powerName}
                        </span>
                    )}

                    <div className="bg-background/40 backdrop-blur-sm border border-muted-foreground/15 rounded-md px-2 py-1 max-w-[145px] shadow-inner">
                        <p className="text-[7.5px] font-medium text-foreground/90 text-center leading-tight tracking-tight whitespace-normal break-words">
                            {log.text}
                        </p>
                    </div>
                </motion.div>

                {/* Right Fighter */}
                <motion.div
                    initial={{ x: 40, opacity: 1, scale: 0.2 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <motion.div
                        animate={getFighterMotionProfile(activePower?.combatRole, rightIsAttacker, false, isDefend)}
                        transition={{ duration: 1, times: [0, 0.4, 0.75, 1], ease: [0.175, 0.885, 0.32, 1.275] }}
                    >
                        <FighterSlot
                            fighter={rightFighter}
                            roleLabel={isDefend ? (!isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER") : (rightIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")}
                            isTeamA={false}
                            isKO={rightIsKO}
                            action={isDefend ? (!isDefenderInTeamA ? "defend" : "attack") : (rightIsAttacker ? "attack" : "defend")}
                            showOverlay={rightIsAttacker || isDefend}
                            badgeColorClass={isDefend && !isDefenderInTeamA ? "text-cyan-400" : undefined}
                            activePower={activePower}
                            damagePopup={rightDamagePopup}
                            phase={phase}
                            isDefender={!rightIsAttacker && !isDefend}
                        />
                        {/* <SyncedHealthBar
                            currentHp={rightFighter?.currentHp ?? 0}
                            isAlive={rightFighter?.isAlive ?? true}
                            maxHp={rightFighter?.maxHp ?? 1}
                            isTeamA={false}
                            phase={phase}
                        /> */}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}






// "use client";

// import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
// import {
//     Crown, Skull, Shield, Swords,
//     ChevronRight, ChevronLeft,
//     Sparkles,
//     Atom,
//     Lock,
// } from "lucide-react";
// import { ActionEvent } from "../CinematicCombatView";
// import { motion, AnimatePresence } from "framer-motion";
// import { resolveActivePower } from "@/lib/compare/cinematicCombatView";
// import { cn } from "@/lib/utils";
// import { CharacterImage } from "@/components/shared/CharacterImage";
// import PowerOverlay, { CombatActionType } from "./PowerOverlay";
// import { useEffect, useState } from "react";
// import { FighterState } from "../useCombatScript";



// const ACTIVATION_VERB: Record<string, string> = {
//     Instant: "Unleashes",
//     Action: "Channels",
//     Passive: "Triggers",
//     Channeled: "Sustains",
// };

// const RANGE_SUFFIX: Record<string, string> = {
//     Self: "on self",
//     Touch: "up close",
//     Melee: "in melee",
//     Ranged: "from a distance",
//     "Melee / Ranged": "across the field",
//     Global: "across dimensions",
// };

// const ROLE_STYLE: Record<PowerRole, {
//     Icon: React.ElementType;
//     text: string;
//     glow: string;
//     bg: string;
//     border: string;
//     label: string;
// }> = {
//     "Offensive": { Icon: Swords, text: "text-red-400", glow: "shadow-red-500/50", bg: "bg-red-500/15", border: "border-red-500/40", label: "Offensive" },
//     "Defensive": { Icon: Shield, text: "text-cyan-400", glow: "shadow-cyan-500/40", bg: "bg-cyan-500/15", border: "border-cyan-500/40", label: "Defensive" },
//     "Control": { Icon: Lock, text: "text-violet-400", glow: "shadow-violet-500/40", bg: "bg-violet-500/15", border: "border-violet-500/40", label: "Control" },
//     "Utility": { Icon: Sparkles, text: "text-emerald-400", glow: "shadow-emerald-500/40", bg: "bg-emerald-500/15", border: "border-emerald-500/40", label: "Utility" },
//     "Hybrid / Versatile": { Icon: Atom, text: "text-amber-400", glow: "shadow-amber-500/40", bg: "bg-amber-500/15", border: "border-amber-500/40", label: "Hybrid" },
// };

// interface FighterSlotProps {
//     fighter?: FighterState;
//     roleLabel: string;
//     isTeamA: boolean;
//     isKO?: boolean;
//     action?: CombatActionType;
//     showOverlay?: boolean;
//     badgeColorClass?: string;
//     activePower: Power | undefined;
//     damagePopup?: number | null;
//     healPopup?: number | null; // 🚀 Added dedicated heal popup prop
// }

// function FighterSlot({
//     fighter,
//     roleLabel,
//     isTeamA,
//     isKO = false,
//     action,
//     showOverlay = false,
//     badgeColorClass,
//     activePower,
//     damagePopup,
//     healPopup,
// }: FighterSlotProps) {
//     const FADE_MS = 800;
//     const [show, setShow] = useState(true);
//     const [renderOverlay, setRenderOverlay] = useState(false);
//     const [visible, setVisible] = useState(false);

//     useEffect(() => {
//         if (show) {
//             setRenderOverlay(true);
//             setVisible(false);
//             const id = requestAnimationFrame(() => {
//                 requestAnimationFrame(() => setVisible(true));
//             });
//             return () => cancelAnimationFrame(id);
//         }
//         setVisible(false);
//         const t = setTimeout(() => setRenderOverlay(false), FADE_MS);
//         return () => clearTimeout(t);
//     }, [show]);

//     if (!fighter) return <div className="w-17" />;

//     const teamTextClass = isTeamA ? "text-primary" : "text-secondary";
//     const teamBorderClass = isTeamA ? "border-primary shadow-primary/40" : "border-secondary shadow-secondary/40";

//     return (
//         <div onClick={() => setShow((v) => !v)} className="flex flex-col items-center gap-1 min-w-18 relative">

//             {damagePopup != null && damagePopup > 0 && (
//                 <motion.span
//                     key="damage"
//                     initial={{ opacity: 0, y: 10, scale: 0.5 }}
//                     animate={{ opacity: 1, y: -10, scale: 1 }}
//                     exit={{ opacity: 0, y: -35, scale: 0.8 }}
//                     transition={{ duration: 1 }}
//                     className="absolute text-red-500 text-[6px]"
//                 >
//                     (-{damagePopup} HP)
//                 </motion.span>
//             )}
//             {healPopup != null && healPopup > 0 && (
//                 <motion.span
//                     key="heal"
//                     initial={{ opacity: 0, y: 10, scale: 0.5 }}
//                     animate={{ opacity: 1, y: -10, scale: 1 }}
//                     exit={{ opacity: 0, y: -35, scale: 0.8 }}
//                     transition={{ duration: 1 }}
//                     className="absolute text-emerald-400 text-[6px]"
//                 >
//                     (+{healPopup} HP) {/* this doesn't give me the right value */}
//                     {/* +25% HP */}
//                 </motion.span>
//             )}
//             <span className={cn("text-[8px] font-black uppercase tracking-wider flex flex-col items-center justify-center", badgeColorClass ?? (isTeamA ? "text-primary" : "text-secondary"))}>
//                 <span>{roleLabel}</span>
//             </span>

//             <div className="relative w-17 h-17 shrink-0 overflow-visible">
//                 {/* 1. Character Image Container */}
//                 <div className={cn(
//                     "w-full h-full rounded-lg overflow-hidden border-2 shadow-md relative transition-colors duration-300 z-0",
//                     isKO ? "border-white shadow-black/60" : teamBorderClass
//                 )}>
//                     <motion.div
//                         className="w-full h-full relative"
//                         initial={{ filter: "grayscale(0%) contrast(100%)" }}
//                         animate={isKO ? { filter: "grayscale(100%) contrast(125%)" } : { filter: "grayscale(0%) contrast(100%)" }}
//                         transition={{ delay: isKO ? 1.5 : 0, duration: 0.35 }}
//                     >
//                         <CharacterImage
//                             src={fighter.image}
//                             alt={fighter.name}
//                             imageFocus={fighter.imageFocus}
//                             fill
//                             className="w-full h-full object-cover"
//                         />
//                     </motion.div>
//                 </div>

//                 {/* 2. Floating Damage / Heal / Block Popups Overlay */}


//                 {/* 3. Action-Specific Power Overlay */}
//                 {renderOverlay && showOverlay && action && (
//                     <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
//                         <PowerOverlay action={action} powerName={activePower?.name} side={isTeamA ? "left" : "right"} visible={visible} />
//                     </div>
//                 )}

//                 {/* 4. Dramatic K.O. Overlay */}
//                 {isKO && (
//                     <motion.div
//                         initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
//                         animate={{ scale: 0.95, opacity: 1, rotate: 0 }}
//                         transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
//                         className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg z-30"
//                     >
//                         <Skull className="size-7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse text-white" />
//                     </motion.div>
//                 )}
//             </div>

//             <span className={cn("font-bold text-[9.5px] truncate text-center max-w-[72px]", teamTextClass)}>
//                 {fighter.name}
//             </span>
//         </div>
//     );
// }

// function getFighterMotionProfile(
//     role?: PowerRole,
//     isAttacker?: boolean,
//     isTeamA: boolean = true,
//     isDefending: boolean = false
// ) {
//     const dir = isTeamA ? 1 : -1;
//     if (!isAttacker) {
//         if (isDefending) {
//             return { x: [0, -3 * dir, 0], scale: [1, 1.05, 1], rotate: 0 };
//         }
//         return { x: [0, 0, -18 * dir, 0], scale: [1, 1, 0.92, 1], rotate: [0, 0, -6 * dir, 0] };
//     }
//     switch (role) {
//         case "Offensive":
//             return { x: [0, 0, 48 * dir, 0], scale: [1, 1.05, 1.15, 1], rotate: [0, 0, 5 * dir, 0] };
//         case "Control":
//             return { x: [0, 0, 42 * dir, 0], y: [0, -20, -20, 0], scale: [1, 1.08, 1.15, 1], rotate: [0, -8 * dir, 8 * dir, 0] };
//         case "Utility":
//             return { x: [0, 0, 38 * dir, 0], y: [0, -12, 0], scale: [1, 1.05, 1.1, 1], rotate: 0 };
//         case "Defensive":
//             return { x: [0, 0, 36 * dir, 0], scale: [1, 1.08, 1.12, 1], rotate: 0 };
//         case "Hybrid / Versatile":
//         default:
//             return { x: [0, 0, 45 * dir, 0], scale: [1, 1.05, 1.12, 1], rotate: 0 };
//     }
// }

// export default function ClashCard({
//     event,
//     allChars,
//     teamAChars,
// }: {
//     event: ActionEvent | null;
//     allChars: CharacterWithJoinTeamUniversePowerEnemies[];
//     teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
// }) {
//     if (!event) {
//         return (
//             <div className="flex flex-col items-center justify-center gap-2 h-full text-muted-foreground/30 py-8">
//                 <Swords className="size-8 animate-pulse" />
//                 <span className="text-[10px] uppercase tracking-widest font-semibold">Awaiting Combat</span>
//             </div>
//         );
//     }

//     const { log, attacker, defender } = event;
//     const activePower = resolveActivePower(log, attacker, allChars);
//     const role = activePower ? ROLE_STYLE[activePower.combatRole] : null;
//     const RoleIcon = role?.Icon ?? Swords;

//     const flavorLine = activePower
//         ? `${ACTIVATION_VERB[activePower.activationType] ?? "Uses"} ${activePower.name} ${RANGE_SUFFIX[activePower.range] ?? ""}`
//         : null;

//     if (log.type === "finish" || log.type === "rout") {
//         const isVictory = log.type === "finish";
//         const meta = (log as any).metadata;

//         return (
//             <div className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 w-full h-full overflow-y-auto max-h-[240px] [scrollbar-width:none]">
//                 <motion.div
//                     initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
//                     animate={{ scale: 1, opacity: 1, rotate: 0 }}
//                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                     className={cn(
//                         "p-1.5 rounded-full border-2 shadow-lg",
//                         isVictory ? "bg-amber-400/20 border-amber-400/60 shadow-amber-500/30" : "bg-red-500/20 border-red-500/60 shadow-red-500/30"
//                     )}
//                 >
//                     {isVictory ? <Crown className="size-4 text-amber-400 animate-bounce" /> : <Skull className="size-4 text-red-400 animate-pulse" />}
//                 </motion.div>

//                 <div className="flex flex-col items-center gap-0 text-center">
//                     <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">
//                         {meta?.winType ?? "Engagement Concluded"}
//                     </span>
//                     <p className="text-[7.5px] font-semibold text-foreground/90 max-w-[270px]">
//                         {log.text}
//                     </p>
//                 </div>

//                 {meta && (
//                     <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] mt-1">
//                         {/* Team A Telemetry */}
//                         <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-primary/10 border border-primary/30">
//                             <span className="text-[7px] font-black uppercase tracking-wider text-primary border-b border-primary/20 pb-0.5">Team A Honors</span>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Top Striker:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.mvpA?.name ?? "N/A"} ({meta.mvpA?.damageDealt ?? 0} DMG)</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Iron Wall:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.wallA?.name ?? "N/A"} ({meta.wallA?.damageBlocked ?? 0})</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Aggressor:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.strikerA?.name ?? "N/A"} ({meta.strikerA?.attacksLanded ?? 0} Hits)</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Resurrector:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.reviveA?.name ?? "N/A"} ({meta.reviveA?.revivals ?? 0})</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Medic:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.healerA?.name ?? "N/A"} ({meta.healerA?.healingDone ?? 0} HP)</span>
//                             </div>
//                         </div>

//                         {/* Team B Telemetry */}
//                         <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-secondary/10 border border-secondary/30">
//                             <span className="text-[7px] font-black uppercase tracking-wider text-secondary border-b border-secondary/20 pb-0.5">Team B Honors</span>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Top Striker:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.mvpB?.name ?? "N/A"} ({meta.mvpB?.damageDealt ?? 0} DMG)</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Iron Wall:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.wallB?.name ?? "N/A"} ({meta.wallB?.damageBlocked ?? 0})</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Aggressor:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.strikerB?.name ?? "N/A"} ({meta.strikerB?.attacksLanded ?? 0} Hits)</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Resurrector:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.reviveB?.name ?? "N/A"} ({meta.reviveB?.revivals ?? 0})</span>
//                             </div>
//                             <div className="flex justify-between items-center text-[7.5px]">
//                                 <span className="text-muted-foreground font-semibold">Medic:</span>
//                                 <span className="font-bold text-foreground truncate max-w-[80px]">{meta.healerB?.name ?? "N/A"} ({meta.healerB?.healingDone ?? 0} HP)</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         );
//     }

//     if (log.type === "heal" || log.type === "revive") {
//         const isHeal = log.type === "heal";
//         const char = isHeal ? attacker : (defender ?? attacker);
//         const accentColor = isHeal ? "emerald-400" : "purple-400";

//         // 🚀 Read the exact healing amount sent from the script log, with a safe fallback
//         const healVal = log.healing;

//         return (
//             <div className="flex flex-col items-center justify-center gap-2 py-4 px-4 w-full h-full">
//                 {char && (
//                     <FighterSlot
//                         fighter={char}
//                         roleLabel={isHeal ? "HEALING" : "REVIVED"}
//                         isTeamA={teamAChars.some((c) => c.name === char.name)}
//                         action={isHeal ? "heal" : "revive"}
//                         showOverlay={true}
//                         badgeColorClass={accentColor}
//                         activePower={activePower}
//                         healPopup={isHeal ? healVal : null} // 🚀 Pass the exact script-calculated heal value
//                     />
//                 )}
//                 {log.powerName && <p className="text-[9px] text-muted-foreground font-medium">{log.powerName}</p>}
//                 <p className="text-[7.5px] font-semibold text-muted-foreground text-center">{log.text}</p>
//             </div>
//         );
//     }

//     const isKO = log.type === "ko" || log.isKO;
//     const isDefend = log.type === "defend";
//     const damageValue = log.damage ?? (isKO ? 15 : null);

//     const defenderChar = defender ?? attacker;
//     const attackerChar = attacker ?? defender;

//     const isDefenderInTeamA = teamAChars.some((c) => c.name === defenderChar?.name);
//     const isAttackerInTeamA = log.variant === "primary";

//     const leftFighter = isDefend
//         ? (isDefenderInTeamA ? defenderChar : attackerChar)
//         : (isAttackerInTeamA ? attacker : defender);

//     const rightFighter = isDefend
//         ? (isDefenderInTeamA ? attackerChar : defenderChar)
//         : (isAttackerInTeamA ? defender : attacker);

//     const leftIsAttacker = isDefend ? !isDefenderInTeamA : isAttackerInTeamA;
//     const rightIsAttacker = !leftIsAttacker;

//     const leftIsKO = isKO && !isAttackerInTeamA;
//     const rightIsKO = isKO && isAttackerInTeamA;

//     // Attach damage popup specifically to the defender/target getting hit
//     const leftDamagePopup = !leftIsAttacker ? damageValue : null;
//     const rightDamagePopup = !rightIsAttacker ? damageValue : null;

//     const ArrowIcon = leftIsAttacker ? ChevronRight : ChevronLeft;

//     return (
//         <div className="flex flex-col items-center justify-between gap-2.5 py-3 px-3 w-full h-full">
//             <div className="flex flex-col items-center gap-0.5">
//                 <span className={cn(
//                     "text-[10px] font-black tracking-wider uppercase",
//                     isKO ? "text-orange-400" : isDefend ? "text-cyan-400" : "text-muted-foreground"
//                 )}>
//                     {isKO ? "💥 K.O. ELIMINATION" : isDefend ? "🛡 SHIELD BLOCK" : "STRIKE ENGAGEMENT"}
//                 </span>
//                 {flavorLine && <p className="text-[9px] text-muted-foreground/80 text-center truncate max-w-[260px]">{flavorLine}</p>}
//             </div>

//             <div className="flex items-center justify-between gap-2 w-full px-1 overflow-visible">
//                 {/* Left Fighter */}
//                 <motion.div
//                     initial={{ x: -40, opacity: 1, scale: 0.2 }}
//                     animate={{ x: 0, opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.25, ease: "easeOut" }}
//                 >
//                     <motion.div
//                         animate={getFighterMotionProfile(activePower?.combatRole, leftIsAttacker, true, isDefend)}
//                         transition={{ duration: 1, times: [0, 0.4, 0.75, 1], ease: [0.175, 0.885, 0.32, 1.275] }}
//                     >
//                         <FighterSlot
//                             fighter={leftFighter}
//                             roleLabel={isDefend ? (isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER") : (leftIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")}
//                             isTeamA={true}
//                             isKO={leftIsKO}
//                             action={isDefend ? (isDefenderInTeamA ? "defend" : "attack") : (leftIsAttacker ? "attack" : "defend")}
//                             showOverlay={leftIsAttacker || isDefend}
//                             badgeColorClass={isDefend && isDefenderInTeamA ? "text-cyan-400" : undefined}
//                             activePower={activePower}
//                             damagePopup={leftDamagePopup}
//                         />
//                     </motion.div>
//                 </motion.div>

//                 {/* Center Hub */}
//                 <motion.div
//                     initial={{ scale: 0.5, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     transition={{ delay: 0.08, type: "spring", stiffness: 400, damping: 20 }}
//                     className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
//                 >
//                     <div className={cn(
//                         "p-2 rounded-full border shadow-sm shrink-0",
//                         isDefend ? "bg-cyan-500/15 border-cyan-500/40" : role ? `${role.bg} ${role.border}` : "bg-muted/20 border-muted-foreground/20"
//                     )}>
//                         {isDefend ? <Shield className="size-4 text-cyan-400" /> : <RoleIcon className={cn("size-4", role?.text ?? "text-muted-foreground")} />}
//                     </div>

//                     {!isDefend && (
//                         <motion.div animate={{ x: leftIsAttacker ? [0, 4, 0] : [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
//                             <ArrowIcon className={cn("size-4", leftIsAttacker ? "text-primary" : "text-secondary")} />
//                         </motion.div>
//                     )}

//                     {log.powerName && (
//                         <span className={cn(
//                             "text-[8px] font-bold text-center px-2 py-0.5 rounded-full border truncate max-w-[110px]",
//                             isDefend ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" : role ? `${role.bg} ${role.border} ${role.text}` : "bg-primary/10 border-primary/30 text-primary"
//                         )}>
//                             {log.powerName}
//                         </span>
//                     )}

//                     <div className="bg-background/40 backdrop-blur-sm border border-muted-foreground/15 rounded-md px-2 py-1 max-w-[145px] shadow-inner">
//                         <p className="text-[7.5px] font-medium text-foreground/90 text-center leading-tight tracking-tight whitespace-normal break-words">
//                             {log.text}
//                         </p>
//                     </div>
//                 </motion.div>

//                 {/* Right Fighter */}
//                 <motion.div
//                     initial={{ x: 40, opacity: 1, scale: 0.2 }}
//                     animate={{ x: 0, opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.25, ease: "easeOut" }}
//                 >
//                     <motion.div
//                         animate={getFighterMotionProfile(activePower?.combatRole, rightIsAttacker, false, isDefend)}
//                         transition={{ duration: 1, times: [0, 0.4, 0.75, 1], ease: [0.175, 0.885, 0.32, 1.275] }}
//                     >
//                         <FighterSlot
//                             fighter={rightFighter}
//                             roleLabel={isDefend ? (!isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER") : (rightIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")}
//                             isTeamA={false}
//                             isKO={rightIsKO}
//                             action={isDefend ? (!isDefenderInTeamA ? "defend" : "attack") : (rightIsAttacker ? "attack" : "defend")}
//                             showOverlay={rightIsAttacker || isDefend}
//                             badgeColorClass={isDefend && !isDefenderInTeamA ? "text-cyan-400" : undefined}
//                             activePower={activePower}
//                             damagePopup={rightDamagePopup}
//                         />
//                     </motion.div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// }