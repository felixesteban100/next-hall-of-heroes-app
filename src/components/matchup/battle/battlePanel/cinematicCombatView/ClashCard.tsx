"use client";

import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole } from "@/types";
import {
    Crown, Skull, Shield, Swords,
    ChevronRight, ChevronLeft,
    Sparkles, Atom, Lock,
    Zap, HeartPulse, RefreshCw, Target, TrendingUp,
    Star, Flame, Activity, Trophy, ShieldCheck,
} from "lucide-react";
import { ActionEvent } from "../CinematicCombatView";
import { motion } from "framer-motion";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { HEALTH_DROP_DELAY, KO_VISUAL_DELAY } from "./TeamColumn";
import FighterSlot from "./clashCard/FighterSlot";
import { BattleMetadata, FighterTelemetry } from "../useCombatScript";
import { AnimatePresence } from "framer-motion";

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

// ── Battle-end helpers ────────────────────────────────────────────────────────

function StatBar({ value, max = 100, colorClass }: { value: number; max?: number; colorClass: string }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
            <motion.div
                className={cn("h-full rounded-full", colorClass)}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            />
        </div>
    );
}

function MiniStat({ label, value, Icon, color }: { label: string; value: string | number; Icon: React.ElementType; color: string }) {
    return (
        <div className="flex items-center gap-1">
            <Icon className={cn("size-2.5 shrink-0", color)} />
            <span className="text-[7px] text-muted-foreground font-medium">{label}:</span>
            <span className={cn("text-[7px] font-bold ml-auto", color)}>{value}</span>
        </div>
    );
}

function FighterCard({ fighter, isWinner }: { fighter: FighterTelemetry; isWinner: boolean }) {
    const maxDmg = Math.max(fighter.damageDealt, 1);
    return (
        <div className={cn(
            "flex flex-col gap-1 p-1.5 rounded-lg border",
            isWinner ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/10 border-muted-foreground/15"
        )}>
            <div className="flex items-center justify-between gap-1">
                <span className={cn("text-[7.5px] font-bold truncate max-w-[70px]", isWinner ? "text-amber-300" : "text-foreground/80")}>
                    {fighter.name}
                </span>
                {isWinner && <Star className="size-2.5 text-amber-400 shrink-0" />}
            </div>
            <div className="space-y-0.5">
                <MiniStat label="DMG" value={fighter.damageDealt} Icon={Flame} color="text-red-400" />
                <MiniStat label="KOs" value={fighter.kos} Icon={Skull} color="text-orange-400" />
                <MiniStat label="Blk" value={fighter.damageBlocked} Icon={ShieldCheck} color="text-cyan-400" />
                <MiniStat label="Heal" value={fighter.healingDone} Icon={HeartPulse} color="text-emerald-400" />
                <MiniStat label="Eff" value={`${fighter.efficiency}%`} Icon={TrendingUp} color="text-violet-400" />
            </div>
            <div className="space-y-0.5 mt-0.5">
                <div className="flex justify-between text-[6px] text-muted-foreground/60">
                    <span>Damage</span><span>{fighter.damageDealt}</span>
                </div>
                <StatBar value={fighter.damageDealt} max={maxDmg * 1.2} colorClass="bg-red-500" />
                <div className="flex justify-between text-[6px] text-muted-foreground/60 mt-0.5">
                    <span>Survival rate</span><span>{fighter.survivalRate}%</span>
                </div>
                <StatBar value={fighter.survivalRate} colorClass="bg-emerald-500" />
            </div>
        </div>
    );
}

function TeamSection({
    label, fighters, mvp, variant,
}: {
    label: string;
    fighters: FighterTelemetry[];
    mvp: FighterTelemetry;
    variant: "primary" | "secondary";
}) {
    const accent = variant === "primary" ? "text-primary" : "text-secondary";
    // const border = variant === "primary" ? "border-primary/30" : "border-secondary/30";
    // const bg = variant === "primary" ? "bg-primary/5" : "bg-secondary/5";

    const totalDmg = fighters.reduce((s, f) => s + f.damageDealt, 0);
    const totalBlk = fighters.reduce((s, f) => s + f.damageBlocked, 0);
    const totalHeal = fighters.reduce((s, f) => s + f.healingDone, 0);
    const totalKOs = fighters.reduce((s, f) => s + f.kos, 0);
    const avgEff = Math.round(fighters.reduce((s, f) => s + f.efficiency, 0) / (fighters.length || 1));
    const avgSurv = Math.round(fighters.reduce((s, f) => s + f.survivalRate, 0) / (fighters.length || 1));

    return (
        /* rounded-xl border bg, border */
        <div className={cn("flex flex-col gap-1.5 p-2 ",)}>
            <div className="flex items-center justify-between">
                <span className={cn("text-[8px] font-black uppercase tracking-widest", accent)}>{label}</span>
                <div className="flex gap-2">
                    <span className="text-[6.5px] text-muted-foreground">EFF <span className={cn("font-bold", accent)}>{avgEff}%</span></span>
                    <span className="text-[6.5px] text-muted-foreground">SURV <span className={cn("font-bold", accent)}>{avgSurv}%</span></span>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
                {[
                    { label: "DMG", value: totalDmg, Icon: Flame, color: "text-red-400" },
                    { label: "KOs", value: totalKOs, Icon: Skull, color: "text-orange-400" },
                    { label: "Blocked", value: totalBlk, Icon: ShieldCheck, color: "text-cyan-400" },
                    { label: "Healed", value: totalHeal, Icon: HeartPulse, color: "text-emerald-400" },
                ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5 bg-background/30 rounded-md p-1">
                        <Icon className={cn("size-2.5", color)} />
                        <span className={cn("text-[8px] font-bold", color)}>{value}</span>
                        <span className="text-[6px] text-muted-foreground/70 text-center leading-tight">{label}</span>
                    </div>
                ))}
            </div>
            <div className={cn(
                "grid gap-1",
                fighters.length === 1 ? "grid-cols-1" : fighters.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
                {fighters.map(f => (
                    <FighterCard key={f.name} fighter={f} isWinner={f.name === mvp.name} />
                ))}
            </div>
        </div>
    );
}

// Collapsible section wrapper
type SectionKey = "overview" | "teamA" | "teamB" | "awards";

function Accordion({
    sectionKey, label, icon: Icon, iconColor, open, onToggle, children,
}: {
    sectionKey: SectionKey;
    label: string;
    icon: React.ElementType;
    iconColor: string;
    open: boolean;
    onToggle: (k: SectionKey) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-muted-foreground/15 overflow-hidden">
            <button
                onClick={() => onToggle(sectionKey)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-muted/10 hover:bg-muted/20 transition-colors"
            >
                <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-3 shrink-0", iconColor)} />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-foreground/80">{label}</span>
                </div>
                <ChevronRight className={cn("size-3 text-muted-foreground transition-transform duration-200", open && "rotate-90")} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Battle End Screen (finish / rout) ────────────────────────────────────────

function BattleEndScreen({ isVictory, log, meta }: {
    isVictory: boolean;
    log: any;
    meta: BattleMetadata | undefined;
}) {
    const [open, setOpen] = useState<SectionKey | null>(null);
    const toggle = (k: SectionKey) => setOpen(prev => prev === k ? null : k);

    return (
        <div className="flex flex-col gap-1.5 py-2 px-2 w-full h-full overflow-y-auto [scrollbar-width:none]">

            {/* ── Always-visible banner ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border  shrink-0",
                    isVictory
                        ? "bg-amber-500/10 border-amber-500/40 shadow-amber-500/20"
                        : "bg-red-500/10 border-red-500/40 shadow-red-500/20"
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                        "p-1.5 rounded-full border-2 shrink-0",
                        isVictory ? "bg-amber-400/20 border-amber-400/60" : "bg-red-500/20 border-red-500/60"
                    )}>
                        {isVictory
                            ? <Crown className="size-4 text-amber-400" />
                            : <Skull className="size-4 text-red-400 animate-pulse" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isVictory ? "text-amber-400" : "text-red-400")}>
                            {meta?.winType ?? "Engagement Concluded"}
                        </span>
                        <p className="text-[7px] font-medium text-foreground/60 leading-tight max-w-[180px]">
                            {log.text}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-0 shrink-0">
                    <span className="text-[6px] text-muted-foreground uppercase tracking-wide">Rounds</span>
                    <span className="text-[13px] font-black text-foreground leading-none">{meta?.totalRounds ?? "—"}</span>
                    <span className="text-[6.5px] text-muted-foreground">
                        KOs <span className="text-orange-400 font-bold">{meta?.totalKoCount ?? 0}</span>
                    </span>
                </div>
            </motion.div>

            {/* ── Quick-glance stat chips ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid grid-cols-4 gap-1 shrink-0"
                >
                    {[
                        { Icon: Activity, color: "text-violet-400", label: "Total DMG", value: meta.totalDamageDealt.toLocaleString() },
                        { Icon: HeartPulse, color: "text-emerald-400", label: "Healed", value: meta.totalHealingDone.toLocaleString() },
                        { Icon: Flame, color: "text-orange-400", label: "Best Hit", value: String(meta.mostDamageSingleHit.damage) },
                        { Icon: Zap, color: "text-yellow-400", label: "Win Edge", value: `${meta.dominance}%` },
                    ].map(({ Icon, color, label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-0.5 bg-muted/10 border border-muted-foreground/10 rounded-lg p-1">
                            <Icon className={cn("size-2.5", color)} />
                            <span className={cn("text-[7.5px] font-bold leading-none", color)}>{value}</span>
                            <span className="text-[5.5px] text-muted-foreground/60 text-center leading-tight">{label}</span>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* ── Power balance bar ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="flex flex-col gap-0.5 px-0.5 shrink-0"
                >
                    <div className="flex justify-between text-[6.5px]">
                        <span className="text-primary font-bold">A <span className="text-foreground">{meta.teamAPowerAvg}</span></span>
                        <span className="text-muted-foreground/60 uppercase tracking-widest text-[5.5px] self-center">Power Avg</span>
                        <span className="text-secondary font-bold"><span className="text-foreground">{meta.teamBPowerAvg}</span> B</span>
                    </div>
                    <div className="flex h-1 w-full rounded-full overflow-hidden">
                        <motion.div className="bg-primary" initial={{ flex: 0 }} animate={{ flex: meta.teamAPowerAvg }} transition={{ duration: 0.7 }} />
                        <motion.div className="bg-secondary" initial={{ flex: 0 }} animate={{ flex: meta.teamBPowerAvg }} transition={{ duration: 0.7 }} />
                    </div>
                </motion.div>
            )}

            {/* ── Collapsible sections ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="flex flex-col gap-1"
                >
                    {/* Overview */}
                    <Accordion sectionKey="overview" label="Overview" icon={Activity} iconColor="text-violet-400" open={open === "overview"} onToggle={toggle}>
                        <div className="flex flex-col gap-1.5">
                            {meta.longestStreak.streak > 1 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
                                    <Flame className="size-3 text-green-400 shrink-0" />
                                    <span className="text-[7.5px] font-bold text-yellow-300">{meta.longestStreak.name}</span>
                                    <span className="text-[7px] text-muted-foreground">· {meta.longestStreak.streak}-hit streak</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25">
                                <Zap className="size-3 text-blue-400 shrink-0" />
                                <span className="text-[7px] text-muted-foreground">Hardest hit:</span>
                                <span className="text-[7.5px] font-bold text-red-300 ml-auto">{meta.mostDamageSingleHit.damage} by {meta.mostDamageSingleHit.name.split(" ")[0]}</span>
                            </div>
                        </div>
                    </Accordion>

                    {/* Team A */}
                    <Accordion sectionKey="teamA" label="Team A Breakdown" icon={Trophy} iconColor="text-primary" open={open === "teamA"} onToggle={toggle}>
                        <TeamSection label="Team A" fighters={meta.teamAStats} mvp={meta.mvpA} variant="primary" />
                    </Accordion>

                    {/* Team B */}
                    <Accordion sectionKey="teamB" label="Team B Breakdown" icon={Trophy} iconColor="text-secondary" open={open === "teamB"} onToggle={toggle}>
                        <TeamSection label="Team B" fighters={meta.teamBStats} mvp={meta.mvpB} variant="secondary" />
                    </Accordion>

                    {/* Awards */}
                    <Accordion sectionKey="awards" label="Awards" icon={Star} iconColor="text-amber-400" open={open === "awards"} onToggle={toggle}>
                        <div className="grid grid-cols-1 gap-1.5">
                            {[
                                {
                                    Icon: Trophy,
                                    color: "text-amber-400",
                                    label: "Top MVP (Damage Dealt)",
                                    nameA: meta.mvpA.name, valA: meta.mvpA.damageDealt,
                                    nameB: meta.mvpB.name, valB: meta.mvpB.damageDealt,
                                    unit: "DMG",
                                },
                                {
                                    Icon: Skull,
                                    color: "text-red-400",
                                    label: "Most Eliminations (KO's)",
                                    nameA: meta.mostKOA.name, valA: meta.mostKOA.kos,
                                    nameB: meta.mostKOB.name, valB: meta.mostKOB.kos,
                                    unit: "KO'S",
                                },
                                {
                                    Icon: ShieldCheck,
                                    color: "text-blue-400",
                                    label: "Iron Wall (Damage Blocked)",
                                    nameA: meta.wallA.name, valA: meta.wallA.damageBlocked,
                                    nameB: meta.wallB.name, valB: meta.wallB.damageBlocked,
                                    unit: "BLK",
                                },
                                {
                                    Icon: RefreshCw,
                                    color: "text-purple-400",
                                    label: "Resurrector (Revivals)",
                                    nameA: meta.reviveA.name, valA: meta.reviveA.revivals,
                                    nameB: meta.reviveB.name, valB: meta.reviveB.revivals,
                                    unit: "REV",
                                },
                                {
                                    Icon: HeartPulse,
                                    color: "text-emerald-400",
                                    label: "Field Medic (Healing Done)",
                                    nameA: meta.healerA.name, valA: meta.healerA.healingDone,
                                    nameB: meta.healerB.name, valB: meta.healerB.healingDone,
                                    unit: "HP",
                                },
                            ].map(({ Icon, color, label, nameA, valA, nameB, valB, unit }) => {
                                // Independent win checks — both win if values are equal!
                                const aWon = valA >= valB;
                                const bWon = valB >= valA;

                                return (
                                    <div key={label} className="flex flex-col p-2 gap-1.5">
                                        {/* Category Header */}
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Icon className={cn("size-3.5", color)} />
                                            <span>{label}</span>
                                        </div>

                                        {/* Head-to-Head Split Box */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Team A Side */}
                                            <div className={cn(
                                                "flex flex-col p-1.5 rounded border transition-all",
                                                aWon ? "bg-primary/10 border-primary/40 font-bold" : "bg-muted/20 border-border/50 opacity-75"
                                            )}>
                                                <span className="text-[7px] text-muted-foreground truncate">{nameA}</span>
                                                <div className="flex items-baseline justify-between mt-0.5">
                                                    <span className={cn("text-xs font-black", aWon ? "text-primary" : "text-foreground")}>
                                                        {valA} <span className="text-[9px] font-normal opacity-70">{unit}</span>
                                                    </span>
                                                    {aWon && <span className="text-[9px] bg-primary text-primary-foreground px-1 rounded">WIN</span>}
                                                </div>
                                            </div>

                                            {/* Team B Side */}
                                            <div className={cn(
                                                "flex flex-col p-1.5 rounded border transition-all",
                                                bWon ? "bg-secondary/10 border-secondary/40 font-bold" : "bg-muted/20 border-border/50 opacity-75"
                                            )}>
                                                <span className="text-[7px] text-muted-foreground truncate">{nameB}</span>
                                                <div className="flex items-baseline justify-between mt-0.5">
                                                    <span className={cn("text-xs font-black", bWon ? "text-secondary" : "text-foreground")}>
                                                        {valB} <span className="text-[9px] font-normal opacity-70">{unit}</span>
                                                    </span>
                                                    {bWon && <span className="text-[9px] bg-secondary text-secondary-foreground px-1 rounded">WIN</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Accordion>
                </motion.div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClashCard({
    event,
    allChars,
    teamAChars,
}: {
    event: ActionEvent | null;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
}) {
    const [phase, setPhase] = useState<CombatPhase>(0);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setPhase(0);

        if (!event) return;

        const isHealRevive = event.log.type === "heal" || event.log.type === "revive";
        const isFinish = event.log.type === "finish" || event.log.type === "rout";

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
            <div className="flex flex-col items-center justify-center gap-2 h-full text-muted-foreground/30 py-8s">
                <Swords className="size-8 animate-pulse-gold" />
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

    // ── Finish / Rout screen ──────────────────────────────────────────────────
    if (log.type === "finish" || log.type === "rout") {
        const isVictory = log.type === "finish";
        const meta = (log as any).metadata as BattleMetadata | undefined;
        return <BattleEndScreen isVictory={isVictory} log={log} meta={meta} />;
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

    // ── Standard attack / defend / KO ─────────────────────────────────────────
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