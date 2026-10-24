"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Crown, Skull, Shield, Swords, HeartPulse, RefreshCw,
    Lock, Zap, Sparkles, Atom, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import { FighterState, Log } from "../BattlePanel";
import { computeMatchScore } from "@/lib/compare";

// ── Power role → visual identity ──────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

type EnrichedFighter = FighterState & {
    id: number;
    image: string;
    imageFocus: string;
    overall: number;
    topPower?: Power;
};

type ActionEvent = {
    key: number;
    log: Log;
    attacker?: EnrichedFighter;
    defender?: EnrichedFighter;
    activePower?: Power;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getRealPowers(char: CharacterWithJoinTeamUniversePowerEnemies): Power[] {
    return (char.powers ?? []).filter(
        (p): p is Power =>
            p !== null && typeof p === "object" && !("isFallback" in p) && "combatRole" in p
    );
}

function isFighterAliveCurrently(fighterName: string, logs: Log[]): boolean {
    // Traverse visible logs backwards to find the latest KO or Revive event for this character
    for (let i = logs.length - 1; i >= 0; i--) {
        const log = logs[i];
        if (log.type === "revive" && (log.defenderName === fighterName || log.attackerName === fighterName)) {
            return true; // Revived!
        }
        if (log.type === "ko" && log.defenderName === fighterName) {
            return false; // Knocked out!
        }
    }
    return true; // Default alive
}

function enrich(
    roster: FighterState[],
    chars: CharacterWithJoinTeamUniversePowerEnemies[],
    visibleLogs: Log[] // 🚀 Pass visibleLogs
): EnrichedFighter[] {
    return chars.map((char) => {
        const currentlyAlive = isFighterAliveCurrently(char.name, visibleLogs);
        const fighter = roster.find((c) => c.name === char.name) ?? {
            name: char.name ?? "Unknown",
            overall: 50,
            isAlive: currentlyAlive,
        };
        const realPowers = getRealPowers(char);
        const topPower = realPowers.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
        return {
            ...fighter,
            isAlive: currentlyAlive,
            id: char.id ?? 0,
            image: char.images?.md ?? "",
            imageFocus: char.imageFocus ?? "50% 18%",
            overall: char.powerstats ? (computeMatchScore(char as any).overall ?? 50) : 50,
            topPower,
        };
    }).sort((a, b) => b.overall - a.overall);
}

function resolveActivePower(log: Log, attacker?: EnrichedFighter, chars?: CharacterWithJoinTeamUniversePowerEnemies[]): Power | undefined {
    if (!attacker || !chars) return attacker?.topPower;
    const char = chars.find((c) => c.name === attacker.name);
    if (!char) return attacker.topPower;
    const powers = getRealPowers(char);
    if (log.powerName) {
        const exact = powers.find((p) => p.name === log.powerName);
        if (exact) return exact;
    }
    return powers.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
    fighter,
    size,
    variant,
    isMvp,
    isAttacking,
    isBeingHit,
    isKO,
    isHealing,
    isReviving,
    isDefending,
}: {
    fighter: EnrichedFighter;
    size: number;
    variant: "primary" | "secondary";
    isMvp?: boolean;
    isAttacking?: boolean;
    isBeingHit?: boolean;
    isKO?: boolean;
    isHealing?: boolean;
    isReviving?: boolean;
    isDefending?: boolean;
}) {
    const dead = !fighter.isAlive;

    const ringColor = dead ? "border-muted-foreground/20"
        : isKO ? "border-orange-500"
            : isReviving ? "border-purple-400"
                : isHealing ? "border-emerald-400"
                    : isDefending ? "border-cyan-400"
                        : isAttacking ? (variant === "primary" ? "border-primary" : "border-secondary")
                            : isBeingHit ? (variant === "primary" ? "border-secondary/70" : "border-primary/70")
                                : isMvp ? (variant === "primary" ? "border-primary/70" : "border-secondary/70")
                                    : (variant === "primary" ? "border-primary/25" : "border-secondary/25");

    const glowClass = dead ? ""
        : isKO ? "shadow-[0_0_12px_2px] shadow-orange-500/50"
            : isReviving ? "shadow-[0_0_14px_3px] shadow-purple-400/60"
                : isHealing ? "shadow-[0_0_10px_2px] shadow-emerald-400/50"
                    : isDefending ? "shadow-[0_0_8px_2px]  shadow-cyan-400/40"
                        : isAttacking ? (variant === "primary" ? "shadow-[0_0_12px_3px] shadow-primary/55" : "shadow-[0_0_12px_3px] shadow-secondary/55")
                            : "";

    return (
        <motion.div
            className="flex flex-col items-center gap-1 shrink-0"
            /* animate={
                isAttacking ? { scale: 1.12, y: -2 }
                    : isBeingHit ? { scale: 0.88, x: variant === "primary" ? 4 : -4 }
                        : isKO ? { scale: 0.82, opacity: 0.55 }
                            : dead ? { scale: 0.88, opacity: 0.3 }
                                : { scale: 1, x: 0, y: 0, opacity: 1 }
            } */
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
        >
            <div
                className={cn(
                    "relative rounded-xl border-2 transition-colors duration-300 shrink-0",
                    ringColor, glowClass,
                    dead && "grayscale"
                )}
                style={{ width: size, height: size }}
            >
                <CharacterImage
                    src={fighter.image}
                    alt={fighter.name}
                    imageFocus={fighter.imageFocus}
                    fill
                    className="w-full h-full rounded-full"
                />

                {isAttacking && !dead && (
                    <div className={cn(
                        "absolute inset-0 rounded-xl ring-2 animate-ping pointer-events-none",
                        variant === "primary" ? "ring-primary/45" : "ring-secondary/45"
                    )} />
                )}

                {isBeingHit && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.35 }}
                    />
                )}

                {isHealing && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-xl"
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                )}

                {isReviving && (
                    <div className="absolute inset-0 bg-purple-400/30 animate-ping pointer-events-none rounded-xl" />
                )}

                {dead && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-xl">
                        <Skull className="size-3.5 text-orange-400" />
                    </div>
                )}

                {isAttacking && !dead && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="absolute -top-1.5 -left-1.5 bg-red-600 p-0.5 rounded-full border border-background z-20"
                    >
                        <Swords className="size-2.5 text-white" />
                    </motion.div>
                )}

                {isDefending && !dead && (
                    <div className="absolute -top-1.5 -left-1.5 bg-cyan-500 p-0.5 rounded-full border border-background z-20">
                        <Shield className="size-2.5 text-white" />
                    </div>
                )}

                {isMvp && !dead && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-300 p-0.5 rounded-full border border-background z-20">
                        <Crown className="size-2.5 fill-black text-black" />
                    </div>
                )}
            </div>

            <span
                className={cn(
                    "text-center leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
                    dead ? "text-muted-foreground/35 line-through" : "text-foreground/85"
                )}
            >
                {fighter.name}
            </span>
        </motion.div>
    );
}

// ── HP Bar ────────────────────────────────────────────────────────────────────

function HPBar({ health, name, variant }: { health: number; name: string; variant: "primary" | "secondary" }) {
    const barColor = health > 60
        ? (variant === "primary" ? "bg-primary" : "bg-secondary")
        : health > 30 ? "bg-yellow-400" : "bg-red-500";

    return (
        <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 px-0.5">
                <span className={cn(
                    "text-[10px] sm:text-[11px] font-black uppercase tracking-wider truncate",
                    variant === "primary" ? "text-primary" : "text-secondary"
                )}>{name}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground/75 shrink-0">{Math.round(health)}%</span>
            </div>
            <div className="h-2 sm:h-2.5 rounded-full bg-muted/40 overflow-hidden p-0.5 border border-muted-foreground/15">
                <motion.div
                    className={cn("h-full rounded-full", barColor)}
                    animate={{ width: `${Math.max(0, health)}%` }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    style={{ width: `${Math.max(0, health)}%` }}
                />
            </div>
        </div>
    );
}

// ── Center Clash Card ──────────────────────────────────────────────────────────

function ClashCard({
    event,
    allChars,
    teamAChars, // 🚀 Add teamAChars prop
}: {
    event: ActionEvent | null;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
}) {
    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-muted-foreground/30 py-6 sm:py-10">
                <Swords className="size-8 sm:size-10 animate-pulse" />
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
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
                <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className={cn(
                        "p-4 sm:p-5 rounded-full border-2",
                        log.type === "finish" ? "bg-amber-400/15 border-amber-400/50" : "bg-red-500/15 border-red-500/50"
                    )}
                >
                    {log.type === "finish"
                        ? <Crown className="size-8 sm:size-10 text-amber-400" />
                        : <Skull className="size-8 sm:size-10 text-red-400" />}
                </motion.div>
                <p className="text-[11px] sm:text-[12px] font-bold text-center text-foreground/95 leading-relaxed">
                    {log.text}
                </p>
            </div>
        );
    }

    if (log.type === "heal" && attacker) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-5 px-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-400 overflow-hidden shadow-[0_0_16px_3px] shadow-emerald-400/50">
                    <CharacterImage src={attacker.image} alt={attacker.name} imageFocus={attacker.imageFocus} fill className="w-full h-full" />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Heal</p>
                    <p className="text-[11px] sm:text-[12px] font-bold text-foreground mt-0.5">{attacker.name}</p>
                    {log.powerName && <p className="text-[9px] text-muted-foreground mt-0.5">{log.powerName}</p>}
                </div>
            </div>
        );
    }

    if (log.type === "defend") {
        const defenderChar = defender ?? attacker;
        const attackerChar = attacker ?? defender;

        // 🚀 Directly check if the defender belongs to Team A (teamAChars)
        const isDefenderInTeamA = teamAChars.some((c) => c.name === defenderChar?.name);

        // Team A ALWAYS goes on the Left, Team B ALWAYS goes on the Right
        const leftFighter = isDefenderInTeamA ? defenderChar : attackerChar;
        const rightFighter = isDefenderInTeamA ? attackerChar : defenderChar;

        const leftIsDefender = isDefenderInTeamA;
        const rightIsDefender = !isDefenderInTeamA;

        return (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 py-4 px-3 sm:px-4 w-full">
                <div className="flex items-end justify-between gap-2 sm:gap-3 w-full">
                    {/* 👈 Left Side (Team A Fighter - Bishop) */}
                    {leftFighter && (
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className={cn(
                                "relative w-[56px] h-[56px] sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shadow-[0_0_12px_2px]",
                                leftIsDefender ? "border-cyan-400 shadow-cyan-400/45" : "border-primary shadow-primary/45"
                            )}>
                                <CharacterImage src={leftFighter.image} alt={leftFighter.name} imageFocus={leftFighter.imageFocus} fill className="w-full h-full" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold truncate text-center max-w-[56px] sm:max-w-[76px] text-primary">
                                {leftFighter.name}
                            </span>
                        </div>
                    )}

                    {/* 🛡️ Center Shield & Block Info */}
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 px-1">
                        <div className="p-2 sm:p-3 rounded-full border bg-cyan-500/15 border-cyan-500/40 shadow-md">
                            <Shield className="size-4 sm:size-5 text-cyan-400" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-center px-2 py-0.5 sm:py-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 text-cyan-400 truncate w-full shadow-xs">
                            {log.powerName || "Shield Block"}
                        </span>
                        <span className="text-[10px] sm:text-[12px] font-black text-cyan-400 tracking-widest uppercase">
                            Blocked
                        </span>
                    </div>

                    {/* 👉 Right Side (Team B Fighter - Deadpool) */}
                    {rightFighter && (
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className={cn(
                                "relative w-[56px] h-[56px] sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shadow-[0_0_12px_2px]",
                                rightIsDefender ? "border-cyan-400 shadow-cyan-400/45" : "border-secondary shadow-secondary/45"
                            )}>
                                <CharacterImage src={rightFighter.image} alt={rightFighter.name} imageFocus={rightFighter.imageFocus} fill className="w-full h-full" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold truncate text-center max-w-[56px] sm:max-w-[76px] text-secondary">
                                {rightFighter.name}
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-[8.5px] sm:text-[10px] text-muted-foreground text-center leading-relaxed px-1">
                    {log.text}
                </p>
            </div>
        );
    }

    if (log.type === "revive") {
        const reviver = defender ?? attacker; // 🚀 Fallback to whichever is defined!
        return (
            <div className="flex flex-col items-center justify-center gap-2.5 py-5 px-4 w-full">
                {reviver && (
                    <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 12 }}
                        className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-purple-400 overflow-hidden shadow-[0_0_18px_4px] shadow-purple-400/60"
                    >
                        <CharacterImage src={reviver.image} alt={reviver.name} imageFocus={reviver.imageFocus} fill className="w-full h-full" />
                        <div className="absolute inset-0 bg-purple-400/25 animate-ping pointer-events-none rounded-2xl" />
                    </motion.div>
                )}
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Revived</p>
                    {reviver && <p className="text-[11px] sm:text-[12px] font-bold text-foreground mt-0.5">{reviver.name}</p>}
                    {log.powerName && <p className="text-[9px] text-muted-foreground mt-1">{log.powerName}</p>}
                </div>
            </div>
        );
    }

    if ((log.type === "attack" || log.type === "ko") && attacker && defender) {
        const isKO = log.type === "ko";

        // 🚀 Determine team sides based on log.variant (primary = Team A / Left, secondary = Team B / Right)
        const isAttackerTeamA = log.variant === "primary";
        const leftFighter = isAttackerTeamA ? attacker : defender;
        const rightFighter = isAttackerTeamA ? defender : attacker;

        const leftIsKO = isKO && !isAttackerTeamA;
        const rightIsKO = isKO && isAttackerTeamA;

        const leftTextClass = "text-primary";
        const leftBorderClass = "border-primary";
        const leftGlowClass = "shadow-primary/45";
        const leftBgClass = "bg-primary/10";

        const rightTextClass = "text-secondary";
        const rightBorderClass = "border-secondary";
        const rightGlowClass = "shadow-secondary/45";
        const rightBgClass = "bg-secondary/10";

        return (
            <div className="flex flex-col gap-2.5 sm:gap-3.5 py-4 px-3 sm:px-4 w-full">
                <div className="flex items-end justify-between gap-2 sm:gap-3 w-full">
                    {/* 👈 Left Side (Team A Fighter) */}
                    <motion.div
                        initial={{ x: -14, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                        className="flex flex-col items-center gap-1 sm:gap-2"
                    >
                        <div className={cn(
                            "relative w-[56px] h-[56px] sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shadow-[0_0_12px_2px]",
                            leftIsKO ? "border-orange-500 shadow-orange-500/40 grayscale" : leftBorderClass,
                            !leftIsKO && leftGlowClass
                        )}>
                            <CharacterImage src={leftFighter.image} alt={leftFighter.name} imageFocus={leftFighter.imageFocus} fill className="w-full h-full" />
                            <div className={cn("absolute inset-0 opacity-15 pointer-events-none", leftBgClass)} />
                            {leftIsKO && (
                                <div className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-xl sm:rounded-2xl">
                                    <Skull className="size-5 sm:size-6 text-orange-400" />
                                </div>
                            )}
                        </div>
                        <span className={cn("text-[9px] sm:text-[10px] font-bold truncate text-center max-w-[56px] sm:max-w-[76px]", leftTextClass)}>
                            {leftFighter.name}
                        </span>
                    </motion.div>

                    {/* ⚔️ Center Icon + Action Info */}
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 px-1">
                        <motion.div
                            key={event.key}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.06 }}
                            className={cn(
                                "p-2 sm:p-3 rounded-full border shadow-md",
                                role ? `${role.bg} ${role.border}` : isKO ? "bg-orange-500/15 border-orange-500/40" : isAttackerTeamA ? `${leftBgClass} ${leftBorderClass}` : `${rightBgClass} ${rightBorderClass}`
                            )}
                        >
                            <RoleIcon className={cn(
                                "size-4 sm:size-5",
                                role?.text ?? (isKO ? "text-orange-400" : isAttackerTeamA ? leftTextClass : rightTextClass)
                            )} />
                        </motion.div>

                        {log.powerName && (
                            <motion.span
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={cn(
                                    "text-[8px] sm:text-[9px] font-bold text-center px-2 py-0.5 sm:py-1 rounded-full border truncate w-full shadow-xs",
                                    role ? `${role.bg} ${role.border} ${role.text}` : isKO ? "bg-orange-500/15 border-orange-500/40 text-orange-400" : isAttackerTeamA ? `${leftBgClass} ${leftBorderClass} ${leftTextClass}` : `${rightBgClass} ${rightBorderClass} ${rightTextClass}`
                                )}
                            >
                                {log.powerName}
                            </motion.span>
                        )}

                        {isKO && (
                            <motion.span
                                initial={{ scale: 1.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-[10px] sm:text-[12px] font-black text-orange-400 tracking-widest"
                            >
                                K.O.
                            </motion.span>
                        )}
                    </div>

                    {/* 👉 Right Side (Team B Fighter) */}
                    <motion.div
                        initial={{ x: 14, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                        className="flex flex-col items-center gap-1 sm:gap-2"
                    >
                        <div className={cn(
                            "relative w-[56px] h-[56px] sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shadow-[0_0_12px_2px]",
                            rightIsKO ? "border-orange-500 shadow-orange-500/40 grayscale" : rightBorderClass,
                            !rightIsKO && rightGlowClass
                        )}>
                            <CharacterImage src={rightFighter.image} alt={rightFighter.name} imageFocus={rightFighter.imageFocus} fill className="w-full h-full" />
                            <div className={cn("absolute inset-0 opacity-15 pointer-events-none", rightBgClass)} />
                            {rightIsKO && (
                                <div className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-xl sm:rounded-2xl">
                                    <Skull className="size-5 sm:size-6 text-orange-400" />
                                </div>
                            )}
                        </div>
                        <span className={cn("text-[9px] sm:text-[10px] font-bold truncate text-center max-w-[56px] sm:max-w-[76px]", rightTextClass)}>
                            {rightFighter.name}
                        </span>
                    </motion.div>
                </div>

                {flavorLine && !isKO && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.18 }}
                        className="text-[8.5px] sm:text-[10px] text-muted-foreground text-center leading-relaxed px-1"
                    >
                        {flavorLine}
                    </motion.p>
                )}

                {activePower && (
                    <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 }}
                        className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap"
                    >
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wide border",
                            role?.bg, role?.border, role?.text
                        )}>
                            <RoleIcon className="size-2.5 sm:size-3" />
                            {role?.label}
                        </span>

                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide border bg-muted/20 border-muted-foreground/20 text-muted-foreground">
                            {activePower.activationType}
                        </span>

                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide border bg-muted/20 border-muted-foreground/20 text-muted-foreground">
                            {activePower.range}
                        </span>
                    </motion.div>
                )}
            </div>
        );
    }

    return null;
}

// ── Log row ────────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: Log }) {
    const { Icon, leftBorder, labelColor, label } = (() => {
        switch (log.type) {
            case "heal": return { Icon: HeartPulse, leftBorder: "border-l-emerald-400", labelColor: "text-emerald-400", label: "HEAL" };
            case "defend": return { Icon: Shield, leftBorder: "border-l-cyan-400", labelColor: "text-cyan-400", label: "BLOCK" };
            case "revive": return { Icon: RefreshCw, leftBorder: "border-l-purple-400", labelColor: "text-purple-400", label: "REVIVE" };
            case "ko": return { Icon: Skull, leftBorder: "border-l-orange-500", labelColor: "text-orange-400", label: "K.O." };
            case "finish": return { Icon: Crown, leftBorder: "border-l-amber-400", labelColor: "text-amber-400", label: "FINISH" };
            case "rout": return { Icon: Skull, leftBorder: "border-l-red-500", labelColor: "text-red-400", label: "ROUT" };
            default:
                return {
                    Icon: log.icon ?? Swords,
                    leftBorder: log.variant === "primary" ? "border-l-primary" : "border-l-secondary",
                    labelColor: log.variant === "primary" ? "text-primary" : "text-secondary",
                    label: "HIT",
                };
        }
    })();

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-r-lg border-l-2 bg-muted/15 text-[10px] sm:text-[11px]",
                leftBorder
            )}
        >
            <Icon className={cn("size-3 sm:size-3.5 shrink-0", labelColor)} />
            <span className={cn("font-black text-[9px] sm:text-[10px] tracking-wide shrink-0", labelColor)}>{label}</span>
            {log.attackerName && (
                <span className="font-semibold text-foreground/90 truncate">
                    {log.attackerName}
                    {log.defenderName && log.defenderName !== log.attackerName && (
                        <span className="text-muted-foreground font-normal"> → {log.defenderName}</span>
                    )}
                </span>
            )}
            {!log.attackerName && log.defenderName && (
                <span className="text-foreground/80 truncate">{log.defenderName}</span>
            )}
            {log.powerName && (
                <span className="ml-auto text-muted-foreground/60 text-[8.5px] sm:text-[9.5px] shrink-0 hidden sm:block truncate max-w-[90px]">
                    {log.powerName}
                </span>
            )}
        </motion.div>
    );
}

// ── Team column ────────────────────────────────────────────────────────────────

function TeamColumn({
    fighters, label, variant, mvp,
    activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
    isDialog,
}: {
    fighters: EnrichedFighter[];
    label: string;
    variant: "primary" | "secondary";
    mvp?: string;
    activeAttacker?: string;
    activeDefender?: string;
    latestKO?: string;
    latestHeal?: string;
    latestRevive?: string;
    latestDefend?: string;
    isDialog?: boolean;
}) {
    const count = fighters.length;
    // Larger avatars on mobile when in stacked view
    const avatarPx = isDialog
        ? count <= 4 ? 48 : count <= 8 ? 40 : count <= 12 ? 34 : 28
        : count <= 4 ? 44 : count <= 8 ? 38 : count <= 12 ? 32 : 28;

    return (
        <div className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0">
            {/* <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] truncate w-full text-center",
                variant === "primary" ? "text-primary" : "text-secondary"
            )}>
                {label}
            </span> */}
            <div className="flex flex-wrap gap-2 justify-center max-h-[120px] md:max-h-none overflow-y-auto no-scrollbar w-full p-1">
                {fighters.map((f) => (
                    <Avatar
                        key={f.id}
                        fighter={f}
                        size={avatarPx}
                        variant={variant}
                        isMvp={f.name === mvp}
                        isAttacking={activeAttacker === f.name}
                        isBeingHit={activeDefender === f.name}
                        isKO={latestKO === f.name}
                        isHealing={latestHeal === f.name}
                        isReviving={latestRevive === f.name}
                        isDefending={latestDefend === f.name}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────

type Props = {
    rosterA: FighterState[];
    rosterB: FighterState[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA: string;
    nameB: string;
    healthA: number;
    healthB: number;
    visibleLogs: Log[];
    isDialog?: boolean;
};

export default function CinematicCombatView({
    rosterA, rosterB,
    teamAChars, teamBChars,
    nameA, nameB,
    healthA, healthB,
    visibleLogs,
    isDialog = false,
}: Props) {
    const enrichedA = enrich(rosterA, teamAChars, visibleLogs);
    const enrichedB = enrich(rosterB, teamBChars, visibleLogs);
    const allChars = [...teamAChars, ...teamBChars];
    const logRef = useRef<HTMLDivElement>(null);

    const latestLog = visibleLogs[visibleLogs.length - 1];
    const [currentEvent, setCurrentEvent] = useState<ActionEvent | null>(null);

    useEffect(() => {
        if (!latestLog || visibleLogs.length === 0) {
            setCurrentEvent(null); // 🚀 Reset clash card immediately when logs clear or reset
            return;
        }

        const all = [...enrichedA, ...enrichedB];
        const find = (name?: string) => name ? all.find((f) => f.name === name) : undefined;
        const attackerFighter = find(latestLog.attackerName);

        setCurrentEvent({
            key: latestLog.id,
            log: latestLog,
            attacker: attackerFighter,
            defender: find(latestLog.defenderName),
            activePower: resolveActivePower(latestLog, attackerFighter, allChars),
        });
    }, [latestLog?.id, visibleLogs.length]); // 🚀 Watch visibleLogs length to catch resets

    useEffect(() => {
        if (logRef.current)
            logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, [visibleLogs.length]);

    const mvpA = enrichedA.find((f) => f.isAlive)?.name;
    const mvpB = enrichedB.find((f) => f.isAlive)?.name;

    const activeAttacker = (latestLog?.type === "attack" || latestLog?.type === "ko") ? latestLog.attackerName : undefined;
    const activeDefender = latestLog?.type === "attack" ? latestLog.defenderName : undefined;
    const latestKO = latestLog?.type === "ko" ? latestLog.defenderName : undefined;
    const latestHeal = latestLog?.type === "heal" ? latestLog.attackerName : undefined;
    const latestRevive = latestLog?.type === "revive" ? latestLog.defenderName : undefined;
    const latestDefend = latestLog?.type === "defend" ? latestLog.defenderName : undefined;

    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4 w-full max-w-full overflow-hidden">
            {/* HP bars */}
            <div className="flex items-center gap-3 sm:gap-5 px-1">
                <HPBar health={healthA} name={nameA} variant="primary" />
                <div className="shrink-0 p-1.5 sm:p-2 rounded-full border border-muted-foreground/20 bg-muted/30 ">
                    <Zap className="size-3 sm:size-3.5 animate-pulse-gold text-green-400 " />
                </div>
                <HPBar health={healthB} name={nameB} variant="secondary" />
            </div>

            {/* 🚀 RESPONSIVE ARENA LAYOUT:
                On Mobile (< md): Vertical flex-col with Center Stage prominent at top.
                On Desktop (>= md): Horizontal 3-column row (Team A | Stage | Team B).
            */}
            {/* 📱 MOBILE VIEW (< md): Vertical Stacked View */}
            <div className="flex flex-col gap-4 w-full md:hidden">
                {/* Full-width Center Clash Card */}
                {/* shadow-xl */}
                <div className="w-full rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-hidden min-h-[180px] flex items-center justify-center ">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <ClashCard event={currentEvent} allChars={allChars} teamAChars={teamAChars} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Team Rosters Side-by-Side underneath */}
                <div className="grid grid-cols-2 w-full gap-3 items-start">
                    <TeamColumn
                        fighters={enrichedA} label={nameA} variant="primary" mvp={mvpA}
                        activeAttacker={activeAttacker} activeDefender={activeDefender}
                        latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                        isDialog={isDialog}
                    />

                    <TeamColumn
                        fighters={enrichedB} label={nameB} variant="secondary" mvp={mvpB}
                        activeAttacker={activeAttacker} activeDefender={activeDefender}
                        latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                        isDialog={isDialog}
                    />
                </div>
            </div>

            {/* 🖥️ DESKTOP VIEW (≥ md): Symmetrical 3-Column Arena (Team A | Stage | Team B) */}
            <div className="hidden md:flex items-center justify-between gap-4 w-full">
                {/* Team A Roster Column */}
                <TeamColumn
                    fighters={enrichedA} label={nameA} variant="primary" mvp={mvpA}
                    activeAttacker={activeAttacker} activeDefender={activeDefender}
                    latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                    isDialog={isDialog}
                />

                {/* Center Stage Card */}
                {/* shadow-xl */}
                <div className={cn(
                    "shrink-0 rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-hidden min-h-[200px] flex items-center justify-center ",
                    isDialog ? "w-[300px]" : "w-[340px] lg:w-[380px]"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <ClashCard event={currentEvent} allChars={allChars} teamAChars={teamAChars} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Team B Roster Column */}
                <TeamColumn
                    fighters={enrichedB} label={nameB} variant="secondary" mvp={mvpB}
                    activeAttacker={activeAttacker} activeDefender={activeDefender}
                    latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                    isDialog={isDialog}
                />
            </div>

            {/* Combat feed */}
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    <span className="flex items-center gap-1.5">
                        <Activity className="size-3.5 animate-pulse text-amber-500" />
                        Combat Feed
                    </span>
                    <span className="text-muted-foreground/60 font-mono">{visibleLogs.length} events</span>
                </div>
                <div
                    ref={logRef}
                    className={cn(
                        "flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth",
                        isDialog ? "h-[160px]" : "h-[140px]"
                    )}
                >
                    {visibleLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/50 italic">
                            Waiting for combat to start…
                        </div>
                    ) : (
                        visibleLogs.map((log) => <LogRow key={log.id} log={log} />)
                    )}
                </div>
            </div>
        </div>
    );
}