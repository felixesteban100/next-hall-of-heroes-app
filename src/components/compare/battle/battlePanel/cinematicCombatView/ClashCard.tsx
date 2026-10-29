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
import { useEffect, useState } from "react";
import { FighterState } from "../useCombatScript";



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

interface FighterSlotProps {
    fighter?: FighterState;
    roleLabel: string;
    isTeamA: boolean;
    isKO?: boolean;
    action?: CombatActionType;
    showOverlay?: boolean;
    badgeColorClass?: string;
    activePower: Power | undefined;
    damagePopup?: number | null;
    healPopup?: number | null; // 🚀 Added dedicated heal popup prop
}

function FighterSlot({
    fighter,
    roleLabel,
    isTeamA,
    isKO = false,
    action,
    showOverlay = false,
    badgeColorClass,
    activePower,
    damagePopup,
    healPopup,
}: FighterSlotProps) {
    const FADE_MS = 800;
    const [show, setShow] = useState(true);
    const [renderOverlay, setRenderOverlay] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setRenderOverlay(true);
            setVisible(false);
            const id = requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
            return () => cancelAnimationFrame(id);
        }
        setVisible(false);
        const t = setTimeout(() => setRenderOverlay(false), FADE_MS);
        return () => clearTimeout(t);
    }, [show]);

    if (!fighter) return <div className="w-17" />;

    const teamTextClass = isTeamA ? "text-primary" : "text-secondary";
    const teamBorderClass = isTeamA ? "border-primary shadow-primary/40" : "border-secondary shadow-secondary/40";

    return (
        <div onClick={() => setShow((v) => !v)} className="flex flex-col items-center gap-1 min-w-18 relative">
            <span className={cn("text-[8px] font-black uppercase tracking-wider flex flex-col items-center justify-center", badgeColorClass ?? (isTeamA ? "text-primary" : "text-secondary"))}>
                <span>{roleLabel}</span>
                {damagePopup != null && damagePopup > 0 && (
                    <motion.span
                        key="damage"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute text-red-500 text-[6px]"
                    >
                        (-{damagePopup} HP)
                    </motion.span>
                )}
                {healPopup != null && healPopup > 0 && (
                    <motion.span
                        key="heal"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute text-emerald-400 text-[6px]"
                    >
                        (+{healPopup} HP) {/* this doesn't give me the right value */}
                        {/* +25% HP */}
                    </motion.span>
                )}
            </span>

            <div className="relative w-17 h-17 shrink-0 overflow-visible">
                {/* 1. Character Image Container */}
                <div className={cn(
                    "w-full h-full rounded-lg overflow-hidden border-2 shadow-md relative transition-colors duration-300 z-0",
                    isKO ? "border-white shadow-black/60" : teamBorderClass
                )}>
                    <motion.div
                        className="w-full h-full relative"
                        initial={{ filter: "grayscale(0%) contrast(100%)" }}
                        animate={isKO ? { filter: "grayscale(100%) contrast(125%)" } : { filter: "grayscale(0%) contrast(100%)" }}
                        transition={{ delay: isKO ? 1.5 : 0, duration: 0.35 }}
                    >
                        <CharacterImage
                            src={fighter.image}
                            alt={fighter.name}
                            imageFocus={fighter.imageFocus}
                            fill
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>

                {/* 2. Floating Damage / Heal / Block Popups Overlay */}


                {/* 3. Action-Specific Power Overlay */}
                {renderOverlay && showOverlay && action && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                        <PowerOverlay action={action} powerName={activePower?.name} side={isTeamA ? "left" : "right"} visible={visible} />
                    </div>
                )}

                {/* 4. Dramatic K.O. Overlay */}
                {isKO && (
                    <motion.div
                        initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                        animate={{ scale: 0.95, opacity: 1, rotate: 0 }}
                        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg z-30"
                    >
                        <Skull className="size-7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse text-white" />
                    </motion.div>
                )}
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

export default function ClashCard({
    event,
    allChars,
    teamAChars,
}: {
    event: ActionEvent | null;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
}) {
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

        // 🚀 Read the exact healing amount sent from the script log, with a safe fallback
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
                        healPopup={isHeal ? healVal : null} // 🚀 Pass the exact script-calculated heal value
                    />
                )}
                {log.powerName && <p className="text-[9px] text-muted-foreground font-medium">{log.powerName}</p>}
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

    // Attach damage popup specifically to the defender/target getting hit
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

                    <p className="text-[7.5px] font-semibold text-muted-foreground max-w-[120px] text-center">
                        {log.text}
                    </p>
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
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}