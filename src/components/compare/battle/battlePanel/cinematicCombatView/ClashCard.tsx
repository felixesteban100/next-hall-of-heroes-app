"use client"

import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import {
    Crown, Skull, Shield, Swords,
    ChevronRight, ChevronLeft,
    Sparkles,
    Atom,
    Lock,
} from "lucide-react";
import { ActionEvent } from "../CinematicCombatView";
import { motion } from "framer-motion";
import { resolveActivePower } from "@/lib/compare/cinematicCombatView";
import { cn } from "@/lib/utils";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { FighterState } from "../../BattlePanel";
import PowerOverlay, { CombatActionType } from "./PowerOverlay";
import { useEffect, useState } from "react";

// ── 1. Reusable Fighter Slot Component ───────────────────────────────────────

interface FighterSlotProps {
    fighter?: FighterState;
    roleLabel: string;
    isTeamA: boolean;
    isKO?: boolean;
    action?: CombatActionType;
    showOverlay?: boolean;
    badgeColorClass?: string;
    activePower: Power | undefined
}

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

function FighterSlot({
    fighter,
    roleLabel,
    isTeamA,
    isKO = false,
    action,
    showOverlay = false,
    badgeColorClass,
    activePower
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
        <div onClick={() => setShow((v) => !v)} className="flex flex-col items-center gap-1 min-w-18">
            {/* Header Tag */}
            <span className={cn("text-[8px] font-black uppercase tracking-wider", badgeColorClass ?? (isTeamA ? "text-primary" : "text-muted-foreground/70"))}>
                {roleLabel}
            </span>

            {/* Standardized Portrait Frame (Fixed 68x68) */}
            <div
                className={cn(
                    "relative w-17 h-17 rounded-xl overflow-hidden border-2 shrink-0 shadow-md transition-colors duration-300",
                    isKO ? "border-white shadow-black/60" : teamBorderClass
                )}
            >
                {/* 🚀 Portrait Image with Timed Grayscale Animation */}
                <motion.div
                    className="w-full h-full relative"
                    initial={{ filter: "grayscale(0%) contrast(100%)" }}
                    animate={
                        isKO
                            ? { filter: "grayscale(100%) contrast(125%)" }
                            : { filter: "grayscale(0%) contrast(100%)" }
                    }
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

                {/* Action-Specific Power Overlay Integration */}
                {renderOverlay && showOverlay && action && (
                    <PowerOverlay action={action} powerName={activePower?.name} side={isTeamA ? "left" : "right"} visible={visible} />
                )}

                {/* 💥 Dramatic Animated K.O. Overlay */}
                {isKO && (
                    <motion.div
                        initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{
                            delay: 1, // Waits for the strike impact before slamming down
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md z-20"
                    >
                        <Skull className="size-7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse" />
                        {/* <span className="text-[7px] font-black tracking-widest uppercase mt-0.5">K.O.</span> */}
                    </motion.div>
                )}
            </div>

            {/* Fighter Name */}
            <span className={cn("font-bold text-[9.5px] truncate text-center max-w-[72px]", isTeamA ? teamTextClass : "text-muted-foreground")}>
                {fighter.name}
            </span>
        </div>
    );
}

// ── 2. Main ClashCard Component ─────────────────────────────────────────────

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

    // ── FINISH / ROUT ──────────────────────────────────────────────────────────
    if (log.type === "finish" || log.type === "rout") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
                <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                        "p-4 rounded-full border-2",
                        log.type === "finish" ? "bg-amber-400/15 border-amber-400/50" : "bg-red-500/15 border-red-500/50"
                    )}
                >
                    {log.type === "finish" ? <Crown className="size-8 text-amber-400" /> : <Skull className="size-8 text-red-400" />}
                </motion.div>
                <p className="text-[11px] font-bold text-center text-foreground/95 leading-relaxed">{log.text}</p>
            </div>
        );
    }

    if (log.type === "heal" || log.type === "revive") {
        const isHeal = log.type === "heal";
        const char = isHeal ? attacker : (defender ?? attacker);
        const accentColor = isHeal ? "emerald-400" : "purple-400";

        return (
            <div className="flex flex-col items-center justify-center gap-2 py-4 px-4 w-full h-full">
                {char && (
                    <FighterSlot
                        fighter={char}
                        roleLabel={isHeal ? "HEALING" : "REVIVED"}
                        isTeamA={teamAChars.some((c) => c.name === char.name)}
                        action={isHeal ? "heal" : "revive"} // 🚀 Passes action type
                        showOverlay={true}
                        badgeColorClass={accentColor}
                        activePower={activePower}
                    />
                )}
                {log.powerName && <p className="text-[9px] text-muted-foreground font-medium">{log.powerName}</p>}
            </div>
        );
    }

    const isKO = log.type === "ko";
    const isDefend = log.type === "defend";

    // Side determination
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

    const ArrowIcon = leftIsAttacker ? ChevronRight : ChevronLeft;

    return (
        <div className="flex flex-col items-center justify-between gap-2.5 py-3 px-3 w-full h-full">
            {/* Top Banner */}
            <div className="flex flex-col items-center gap-0.5">
                <span className={cn(
                    "text-[10px] font-black tracking-wider uppercase",
                    isKO ? "text-orange-400" : isDefend ? "text-cyan-400" : "text-muted-foreground"
                )}>
                    {isKO ? "💥 K.O. ELIMINATION" : isDefend ? "🛡 SHIELD BLOCK" : "STRIKE ENGAGEMENT"}
                </span>
                {flavorLine && <p className="text-[9px] text-muted-foreground/80 text-center truncate max-w-[260px]">{flavorLine}</p>}
            </div>

            {/* Standardized 3-Column Arena Layout with Cinematic Collision */}
            <div className="flex items-center justify-between gap-2 w-full px-1 overflow-hidden">
                {/* Left Fighter (Team A) - Lunges right if attacking */}
                <motion.div
                    initial={{ x: -40, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }} // Appears instantly together
                >
                    <motion.div
                        animate={leftIsAttacker ? { x: [0, 0, 200, 0] } : { x: 0 }}
                        transition={{
                            duration: 1,
                            times: [0, 0.4, 0.75, 1], // Waits 40% of the time, then lunges forward
                            ease: [0.175, 0.885, 0.32, 1.275]
                        }}
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
                        />
                    </motion.div>
                </motion.div>

                {/* Center Stage Action Hub */}
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
                            isDefend ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" : role ? `${role.bg} ${role.border} ${role.text}` : "bg-primary/10 border-primary/30 text-primary"
                        )}>
                            {log.powerName}
                        </span>
                    )}

                    {log.actionName && (
                        <span className="text-[8px] font-light border-1 border-muted-foreground/10 rounded-lg px-2">
                            {log.actionName}
                        </span>
                    )}
                </motion.div>

                {/* Right Fighter (Team B) - Lunges left if attacking */}
                <motion.div
                    initial={{ x: 40, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }} // Appears instantly together
                >
                    <motion.div
                        animate={rightIsAttacker ? { x: [0, 0, -200, 0] } : { x: 0 }}
                        transition={{
                            duration: 1,
                            times: [0, 0.4, 0.75, 1], // Waits 40% of the time, then lunges forward
                            ease: [0.175, 0.885, 0.32, 1.275]
                        }}
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
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Footer Tags */}
            {activePower && !isDefend && (
                <div className="flex items-center gap-1.5 justify-center flex-wrap pt-0.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border", role?.bg, role?.border, role?.text)}>
                        {role?.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase border bg-muted/20 border-muted-foreground/20 text-muted-foreground">
                        {activePower.activationType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase border bg-muted/20 border-muted-foreground/20 text-muted-foreground">
                        {activePower.range}
                    </span>
                </div>
            )}
        </div>
    );
}