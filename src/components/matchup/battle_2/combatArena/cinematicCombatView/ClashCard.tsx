"use client";

import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole } from "@/types";
import {
    Shield, Swords,
    ChevronRight, ChevronLeft,
    Sparkles, Atom, Lock, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { HEALTH_DROP_DELAY, KO_VISUAL_DELAY } from "./TeamColumn";
import { ActionEvent, BattleMetadata } from "@/lib/matchup/combat/adapters";
import { BattleEndScreen } from "./clashCard/BattleEndScreen";
import FighterSlot from "./clashCard/FighterSlot";
import { Side } from "@/lib/matchup/combat/types";

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
export type CombatPhase = 0 | 1 | 2 | 3;

const PHASE_1_DELAY = 600;
const PHASE_2_DELAY = HEALTH_DROP_DELAY;
const PHASE_3_DELAY = KO_VISUAL_DELAY;

function getFighterMotionProfile(
    role?: PowerRole,
    isAttacker?: boolean,
    isTeamA: boolean = true,
    isDefending: boolean = false
) {
    const dir = isTeamA ? 1 : -1;
    if (!isAttacker) {
        if (isDefending) return { x: [0, -3 * dir, 0], scale: [1, 1.05, 1], rotate: 0 };
        return { x: [0, 0, -18 * dir, 0], scale: [1, 1, 0.92, 1], rotate: [0, 0, -6 * dir, 0] };
    }
    switch (role) {
        case "Offensive": return { x: [0, 0, 48 * dir, 0], scale: [1, 1.05, 1.15, 1], rotate: [0, 0, 5 * dir, 0] };
        case "Control": return { x: [0, 0, 42 * dir, 0], y: [0, -20, -20, 0], scale: [1, 1.08, 1.15, 1], rotate: [0, -8 * dir, 8 * dir, 0] };
        case "Utility": return { x: [0, 0, 38 * dir, 0], y: [0, -12, 0], scale: [1, 1.05, 1.1, 1], rotate: 0 };
        case "Defensive": return { x: [0, 0, 36 * dir, 0], scale: [1, 1.08, 1.12, 1], rotate: 0 };
        case "Hybrid / Versatile":
        default: return { x: [0, 0, 45 * dir, 0], scale: [1, 1.05, 1.12, 1], rotate: 0 };
    }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClashCard({
    event,
    allChars,
    teamAChars,
    playerSide,
}: {
    event: ActionEvent | null;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: Side;
}) {
    const [phase, setPhase] = useState<CombatPhase>(0);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setPhase(0);

        if (!event) return;

        const eventType = event.log.type as unknown as string;
        const isHealRevive = eventType === "heal" || eventType === "revive";
        const isFinish = event.log.type === "battle_end";

        if (isHealRevive || isFinish) {
            timersRef.current.push(setTimeout(() => setPhase(1), 200));
            timersRef.current.push(setTimeout(() => setPhase(2), 400));
            return;
        }

        timersRef.current.push(setTimeout(() => setPhase(1), PHASE_1_DELAY));
        timersRef.current.push(setTimeout(() => setPhase(2), PHASE_2_DELAY));
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

    // ── Finish / Rout / Battle End screen ──────────────────────────────────────
    if (log.type === "battle_end") {
        const isVictory = log.side === playerSide;

        return (
            <BattleEndScreen
                isVictory={isVictory}
                log={log}
                meta={log.metadata}
            />
        );
    }

    // ── Turn Start / Round Start Info Card ─────────────────────────────────────
    if (log.type === "round_start" || log.type === "turn_start") {
        const isRound = log.type === "round_start";
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center gap-3 py-8 px-6 w-full h-full text-center bg-background/60 backdrop-blur-md rounded-xl border border-primary/30 shadow-2xl"
            >
                <div className="p-3.5 rounded-full bg-primary/20 border border-primary/50 text-primary">
                    <Zap className="size-7 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                        {isRound ? "Tactical Phase Transition" : "Turn Initiative"}
                    </span>
                    <h3 className="text-base font-bold tracking-wide text-foreground">
                        {log.text}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                        Preparing next engagements...
                    </p>
                </div>
            </motion.div>
        );
    }

    // ── Row Swap / Tactical Movement Card ──────────────────────────────────────
    if (log.type === "swap_row") {
        const char = attacker;
        const isTeamA = char ? teamAChars.some((c) => c.name === char.name) : true;

        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 w-full h-full text-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="p-3 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400"
                >
                    <Swords className="size-6" />
                </motion.div>
                {char && (
                    <div className="flex flex-col items-center gap-1">
                        <span className={cn("text-sm font-bold", isTeamA ? "text-primary" : "text-secondary")}>
                            {char.name}
                        </span>
                        <p className="text-xs text-muted-foreground max-w-[220px]">
                            {log.text}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // ── Status Tick Card ───────────────────────────────────────────────────────
    if (log.type === "status_tick") {
        const char = attacker ?? defender;
        const isTeamA = char ? teamAChars.some((c) => c.name === char.name) : true;

        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 w-full h-full text-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="p-3 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-400"
                >
                    <Atom className="size-6 animate-pulse" />
                </motion.div>
                {char && (
                    <div className="flex flex-col items-center gap-1">
                        <span className={cn("text-sm font-bold", isTeamA ? "text-primary" : "text-secondary")}>
                            {char.name}
                        </span>
                        <p className="text-xs text-muted-foreground max-w-[220px]">
                            {log.text}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // ── Team Order Card ────────────────────────────────────────────────────────
    if (log.type === "team_order") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 w-full h-full text-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="p-3 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-indigo-400"
                >
                    <Shield className="size-6" />
                </motion.div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Tactical Team Order
                    </span>
                    <p className="text-xs text-muted-foreground max-w-[240px] font-medium">
                        {log.text}
                    </p>
                </div>
            </div>
        );
    }

    // ── Heal / Revive ─────────────────────────────────────────────────────────
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
                        prevHp={isHeal ? char.prevHp : 0}
                        phase={phase}
                        isDefender={false}
                    />
                )}
                {log.powerName && <p className="text-[9px] text-muted-foreground font-medium">{log.powerName}</p>}
                <p className="text-[7.5px] font-semibold text-muted-foreground text-center">{log.text}</p>
            </div>
        );
    }

    // ── Shield Activation / Guard ──────────────────────────────────────────────
    const isShieldActivation =
        log.type === "status_applied" ||
        (log.type === "defend" && !log.defenderName);

    if (isShieldActivation) {
        const char = attacker ?? defender;
        const isTeamA = char ? teamAChars.some((c) => c.name === char.name) : true;

        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 w-full h-full text-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="p-3 rounded-full bg-cyan-500/15 border border-cyan-500/40"
                >
                    <Shield className="size-7 text-cyan-400" />
                </motion.div>

                {char && (
                    <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                            "text-sm font-bold",
                            isTeamA ? "text-primary" : "text-secondary"
                        )}>
                            {char.name}
                        </span>
                        <p className="text-xs text-muted-foreground max-w-[220px]">
                            {log.text}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // ── Real Shield Absorb (Block Cinematic) ───────────────────────────────────
    const isShieldAbsorb = log.type === "defend" && !!log.defenderName;

    // ── Standard attack / power / defend / KO ──────────────────────────────────
    const isKO = log.type === "ko" || log.isKO;
    const isPower = log.type === "power";
    const isDefend = isShieldAbsorb;
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
                    isKO ? "text-orange-400" : isDefend ? "text-cyan-400" : isPower ? "text-amber-400" : "text-muted-foreground"
                )}>
                    {isKO ? "💥 K.O. ELIMINATION" : isDefend ? "🛡 SHIELD BLOCK" : isPower ? "⚡ POWER UNLEASHED" : "STRIKE ENGAGEMENT"}
                </span>
                {flavorLine && (
                    <p className="text-[9px] text-muted-foreground/80 text-center truncate max-w-[260px]">
                        {flavorLine}
                    </p>
                )}
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
                            roleLabel={
                                isDefend
                                    ? (isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER")
                                    : (leftIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")
                            }
                            isTeamA={true}
                            isKO={leftIsKO}
                            action={isDefend ? (isDefenderInTeamA ? "defend" : "attack") : (leftIsAttacker ? "attack" : "defend")}
                            showOverlay={leftIsAttacker || isDefend}
                            badgeColorClass={isDefend && isDefenderInTeamA ? "text-cyan-400" : undefined}
                            activePower={activePower}
                            damagePopup={leftDamagePopup}
                            prevHp={leftFighter?.prevHp}
                            phase={phase}
                            isDefender={!leftIsAttacker && !isDefend}
                        />
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
                        isDefend
                            ? "bg-cyan-500/15 border-cyan-500/40"
                            : role
                                ? `${role.bg} ${role.border}`
                                : "bg-muted/20 border-muted-foreground/20"
                    )}>
                        {isDefend
                            ? <Shield className="size-4 text-cyan-400" />
                            : <RoleIcon className={cn("size-4", role?.text ?? "text-muted-foreground")} />}
                    </div>

                    {!isDefend && (
                        <motion.div
                            animate={{ x: leftIsAttacker ? [0, 4, 0] : [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ArrowIcon className={cn("size-4", leftIsAttacker ? "text-primary" : "text-secondary")} />
                        </motion.div>
                    )}

                    {log.powerName && (
                        <span className={cn(
                            "text-[8px] font-bold text-center px-2 py-0.5 rounded-full border truncate max-w-[110px]",
                            isDefend
                                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                                : role
                                    ? `${role.bg} ${role.border} ${role.text}`
                                    : "bg-primary/10 border-primary/30 text-primary"
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
                            roleLabel={
                                isDefend
                                    ? (!isDefenderInTeamA ? "🛡 BLOCKS" : "⚔ ATTACKER")
                                    : (rightIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET")
                            }
                            isTeamA={false}
                            isKO={rightIsKO}
                            action={isDefend ? (!isDefenderInTeamA ? "defend" : "attack") : (rightIsAttacker ? "attack" : "defend")}
                            showOverlay={rightIsAttacker || isDefend}
                            badgeColorClass={isDefend && !isDefenderInTeamA ? "text-cyan-400" : undefined}
                            activePower={activePower}
                            damagePopup={rightDamagePopup}
                            prevHp={rightFighter?.prevHp}
                            phase={phase}
                            isDefender={!rightIsAttacker && !isDefend}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}