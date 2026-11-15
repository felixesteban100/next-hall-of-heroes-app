
import {
    Crown, Skull, ChevronRight,
    Zap, HeartPulse, RefreshCw, TrendingUp,
    Star, Flame, Activity, Trophy, ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type {
    ActionEvent,
    BattleMetadata,
    FighterTelemetry,
} from "@/lib/matchup/combat/adapters";
import type { ElementType, ReactNode } from "react";

// ── Battle-end helpers ────────────────────────────────────────────────────────

function StatBar({
    value,
    max = 100,
    colorClass,
}: {
    value: number;
    max?: number;
    colorClass: string;
}) {
    const safeMax = Math.max(1, max);
    const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));

    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
                className={cn("h-full rounded-full", colorClass)}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            />
        </div>
    );
}

function MiniStat({
    label,
    value,
    Icon,
    color,
}: {
    label: string;
    value: string | number;
    Icon: ElementType;
    color: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-1">
            <Icon className={cn("size-3 shrink-0", color)} />
            <span className="min-w-0 truncate text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                {label}
            </span>
            <span className={cn("ml-auto shrink-0 text-[9px] font-bold tabular-nums sm:text-[10px]", color)}>
                {value}
            </span>
        </div>
    );
}

function FighterCard({
    fighter,
    isWinner,
}: {
    fighter: FighterTelemetry;
    isWinner: boolean;
}) {
    const maxDmg = Math.max(fighter.damageDealt, 1);

    return (
        <div
            className={cn(
                "flex min-w-0 flex-col gap-2 rounded-lg border p-2",
                isWinner
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-muted-foreground/15 bg-muted/10"
            )}
        >
            <div className="flex min-w-0 items-center justify-between gap-1">
                <span
                    title={fighter.name}
                    className={cn(
                        "min-w-0 truncate text-[10px] font-bold sm:text-xs",
                        isWinner ? "text-amber-300" : "text-foreground/80"
                    )}
                >
                    {fighter.name}
                </span>

                {isWinner && (
                    <Star className="size-3 shrink-0 text-amber-400" />
                )}
            </div>

            <div className="flex flex-col gap-1">
                <MiniStat label="DMG" value={fighter.damageDealt} Icon={Flame} color="text-red-400" />
                <MiniStat label="KOs" value={fighter.kos} Icon={Skull} color="text-orange-400" />
                <MiniStat label="Blocked" value={fighter.damageBlocked} Icon={ShieldCheck} color="text-cyan-400" />
                <MiniStat label="Healed" value={fighter.healingDone} Icon={HeartPulse} color="text-emerald-400" />
                <MiniStat label="Efficiency" value={`${fighter.efficiency}%`} Icon={TrendingUp} color="text-violet-400" />
            </div>

            <div className="mt-1 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between gap-2 text-[8px] text-muted-foreground/70 sm:text-[9px]">
                        <span>Damage</span>
                        <span className="tabular-nums">{fighter.damageDealt}</span>
                    </div>
                    <StatBar
                        value={fighter.damageDealt}
                        max={maxDmg * 1.2}
                        colorClass="bg-red-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex justify-between gap-2 text-[8px] text-muted-foreground/70 sm:text-[9px]">
                        <span>Survival rate</span>
                        <span className="tabular-nums">{fighter.survivalRate}%</span>
                    </div>
                    <StatBar
                        value={fighter.survivalRate}
                        colorClass="bg-emerald-500"
                    />
                </div>
            </div>
        </div>
    );
}

function TeamSection({
    label,
    fighters,
    mvp,
    variant,
}: {
    label: string;
    fighters: FighterTelemetry[];
    mvp: FighterTelemetry;
    variant: "primary" | "secondary";
}) {
    const accent =
        variant === "primary" ? "text-primary" : "text-secondary";

    const totalDmg = fighters.reduce((s, f) => s + f.damageDealt, 0);
    const totalBlk = fighters.reduce((s, f) => s + f.damageBlocked, 0);
    const totalHeal = fighters.reduce((s, f) => s + f.healingDone, 0);
    const totalKOs = fighters.reduce((s, f) => s + f.kos, 0);

    const avgEff = Math.round(
        fighters.reduce((s, f) => s + f.efficiency, 0) /
        (fighters.length || 1)
    );

    const avgSurv = Math.round(
        fighters.reduce((s, f) => s + f.survivalRate, 0) /
        (fighters.length || 1)
    );

    return (
        <div className="flex min-w-0 flex-col gap-3 p-1 sm:p-2">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className={cn("text-[10px] font-black uppercase tracking-widest sm:text-xs", accent)}>
                    {label}
                </span>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                        EFF <span className={cn("font-bold", accent)}>{avgEff}%</span>
                    </span>
                    <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                        SURV <span className={cn("font-bold", accent)}>{avgSurv}%</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                    { label: "DMG", value: totalDmg, Icon: Flame, color: "text-red-400" },
                    { label: "KOs", value: totalKOs, Icon: Skull, color: "text-orange-400" },
                    { label: "Blocked", value: totalBlk, Icon: ShieldCheck, color: "text-cyan-400" },
                    { label: "Healed", value: totalHeal, Icon: HeartPulse, color: "text-emerald-400" },
                ].map(({ label, value, Icon, color }) => (
                    <div
                        key={label}
                        className="flex min-w-0 flex-col items-center gap-1 rounded-md bg-background/30 p-2"
                    >
                        <Icon className={cn("size-3 sm:size-3.5", color)} />
                        <span className={cn("max-w-full truncate text-[10px] font-bold tabular-nums sm:text-xs", color)}>
                            {value.toLocaleString()}
                        </span>
                        <span className="text-center text-[8px] leading-tight text-muted-foreground/70 sm:text-[9px]">
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <div
                className={cn(
                    "grid min-w-0 gap-2",
                    fighters.length === 1
                        ? "grid-cols-1"
                        : fighters.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-2 sm:grid-cols-3"
                )}
            >
                {fighters.map((fighter) => (
                    <FighterCard
                        key={fighter.name}
                        fighter={fighter}
                        isWinner={fighter.name === mvp.name}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Accordion ─────────────────────────────────────────────────────────────────

type SectionKey = "overview" | "teamA" | "teamB" | "awards";

function Accordion({
    sectionKey,
    label,
    icon: Icon,
    iconColor,
    open,
    onToggle,
    children,
}: {
    sectionKey: SectionKey;
    label: string;
    icon: ElementType;
    iconColor: string;
    open: boolean;
    onToggle: (k: SectionKey) => void;
    children: ReactNode;
}) {
    return (
        <div className="relative min-w-0">
            <div className="overflow-hidden rounded-lg border border-muted-foreground/15 bg-background">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => onToggle(sectionKey)}
                    className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/10 px-3 py-2 text-left transition-colors hover:bg-muted/20"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <Icon className={cn("size-3.5 shrink-0 sm:size-4", iconColor)} />
                        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-foreground/80 sm:text-xs">
                            {label}
                        </span>
                    </div>

                    <ChevronRight
                        className={cn(
                            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                            open && "rotate-90"
                        )}
                    />
                </button>
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-20 mt-1 min-w-0 overflow-hidden rounded-lg border border-muted-foreground/20 bg-background shadow-xl"
                    >
                        <div
                            className="max-h-[min(45vh,320px)] min-w-0 overflow-x-hidden overflow-y-auto p-2 sm:p-3"
                            style={{
                                WebkitOverflowScrolling: "touch",
                                scrollbarWidth: "thin",
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Battle End Screen ─────────────────────────────────────────────────────────

export function BattleEndScreen({
    isVictory,
    log,
    meta,
}: {
    isVictory: boolean;
    log: ActionEvent["log"];
    meta: BattleMetadata | undefined;
}) {
    const [open, setOpen] = useState<SectionKey | null>(null);

    const toggle = (key: SectionKey) => {
        setOpen((prev) => (prev === key ? null : key));
    };

    return (
        <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-xl flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 pb-2 pt-16 [scrollbar-width:none] sm:gap-3 sm:px-3">
            {/* ── Always-visible banner ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "flex min-w-0 shrink-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5",
                    isVictory
                        ? "border-amber-500/40 bg-amber-500/10 shadow-amber-500/20"
                        : "border-red-500/40 bg-red-500/10 shadow-red-500/20"
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <div
                        className={cn(
                            "shrink-0 rounded-full border-2 p-1.5 sm:p-2",
                            isVictory
                                ? "border-amber-400/60 bg-amber-400/20"
                                : "border-red-500/60 bg-red-500/20"
                        )}
                    >
                        {isVictory ? (
                            <Crown className="size-4 text-amber-400 sm:size-5" />
                        ) : (
                            <Skull className="size-4 animate-pulse text-red-400 sm:size-5" />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest sm:text-xs",
                            isVictory ? "text-amber-400" : "text-red-400"
                        )}>
                            {meta?.winType ?? "Engagement Concluded"}
                        </span>
                        <p className="line-clamp-2 break-words text-[9px] font-medium leading-snug text-foreground/60 sm:text-[10px]">
                            {log.text}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-[8px] uppercase tracking-wide text-muted-foreground sm:text-[9px]">
                        Rounds
                    </span>
                    <span className="text-sm font-black leading-none text-foreground sm:text-base">
                        {meta?.totalRounds ?? "—"}
                    </span>
                    <span className="text-[8px] text-muted-foreground sm:text-[9px]">
                        KOs <span className="font-bold text-orange-400">{meta?.totalKoCount ?? 0}</span>
                    </span>
                </div>
            </motion.div>

            {/* ── Quick-glance stat chips ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4"
                >
                    {[
                        { Icon: Activity, color: "text-violet-400", label: "Total DMG", value: meta.totalDamageDealt.toLocaleString() },
                        { Icon: HeartPulse, color: "text-emerald-400", label: "Healed", value: meta.totalHealingDone.toLocaleString() },
                        { Icon: Flame, color: "text-orange-400", label: "Best Hit", value: String(meta.mostDamageSingleHit.damage) },
                        { Icon: Zap, color: "text-yellow-400", label: "Win Edge", value: `${meta.dominance}%` },
                    ].map(({ Icon, color, label, value }) => (
                        <div
                            key={label}
                            className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-muted-foreground/10 bg-muted/10 p-2"
                        >
                            <Icon className={cn("size-3.5 sm:size-4", color)} />
                            <span className={cn("max-w-full truncate text-[10px] font-bold leading-none tabular-nums sm:text-xs", color)}>
                                {value}
                            </span>
                            <span className="text-center text-[8px] leading-tight text-muted-foreground/70 sm:text-[9px]">
                                {label}
                            </span>
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
                    className="flex shrink-0 flex-col gap-1 px-0.5"
                >
                    <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px]">
                        <span className="min-w-0 truncate font-bold text-primary">
                            A <span className="text-foreground">{meta.teamAPowerAvg}</span>
                        </span>
                        <span className="shrink-0 text-center text-[8px] uppercase tracking-widest text-muted-foreground/60 sm:text-[9px]">
                            Power Avg
                        </span>
                        <span className="min-w-0 truncate text-right font-bold text-secondary">
                            <span className="text-foreground">{meta.teamBPowerAvg}</span> B
                        </span>
                    </div>

                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
                        <motion.div
                            className="min-w-0 bg-primary"
                            initial={{ flex: 0 }}
                            animate={{ flex: Math.max(0, meta.teamAPowerAvg) }}
                            transition={{ duration: 0.7 }}
                        />
                        <motion.div
                            className="min-w-0 bg-secondary"
                            initial={{ flex: 0 }}
                            animate={{ flex: Math.max(0, meta.teamBPowerAvg) }}
                            transition={{ duration: 0.7 }}
                        />
                    </div>
                </motion.div>
            )}

            {/* ── Collapsible sections ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="relative z-10 flex min-w-0 flex-col gap-2"
                >
                    {/* Overview */}
                    <Accordion
                        sectionKey="overview"
                        label="Overview"
                        icon={Activity}
                        iconColor="text-violet-400"
                        open={open === "overview"}
                        onToggle={toggle}
                    >
                        <div className="flex min-w-0 flex-col gap-2">
                            {meta.longestStreak.streak > 1 && (
                                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-2 py-2">
                                    <Flame className="size-3.5 shrink-0 text-green-400" />
                                    <span className="min-w-0 truncate text-[10px] font-bold text-yellow-300 sm:text-xs">
                                        {meta.longestStreak.name}
                                    </span>
                                    <span className="shrink-0 text-[9px] text-muted-foreground sm:text-[10px]">
                                        · {meta.longestStreak.streak}-hit streak
                                    </span>
                                </div>
                            )}

                            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-500/10 px-2 py-2">
                                <Zap className="size-3.5 shrink-0 text-blue-400" />
                                <span className="shrink-0 text-[9px] text-muted-foreground sm:text-[10px]">
                                    Hardest hit:
                                </span>
                                <span className="min-w-0 truncate text-right text-[10px] font-bold text-red-300 sm:text-xs">
                                    {meta.mostDamageSingleHit.damage} by {meta.mostDamageSingleHit.name.split(" ")[0]}
                                </span>
                            </div>
                        </div>
                    </Accordion>

                    {/* Team A */}
                    <Accordion
                        sectionKey="teamA"
                        label="Team A Breakdown"
                        icon={Trophy}
                        iconColor="text-primary"
                        open={open === "teamA"}
                        onToggle={toggle}
                    >
                        <TeamSection
                            label="Team A"
                            fighters={meta.teamAStats}
                            mvp={meta.mvpA}
                            variant="primary"
                        />
                    </Accordion>

                    {/* Team B */}
                    <Accordion
                        sectionKey="teamB"
                        label="Team B Breakdown"
                        icon={Trophy}
                        iconColor="text-secondary"
                        open={open === "teamB"}
                        onToggle={toggle}
                    >
                        <TeamSection
                            label="Team B"
                            fighters={meta.teamBStats}
                            mvp={meta.mvpB}
                            variant="secondary"
                        />
                    </Accordion>

                    {/* Awards */}
                    <Accordion
                        sectionKey="awards"
                        label="Awards"
                        icon={Star}
                        iconColor="text-amber-400"
                        open={open === "awards"}
                        onToggle={toggle}
                    >
                        <div className="grid min-w-0 grid-cols-1 gap-2">
                            {[
                                {
                                    Icon: Trophy,
                                    color: "text-amber-400",
                                    label: "Top MVP (Damage Dealt)",
                                    nameA: meta.mvpA.name,
                                    valA: meta.mvpA.damageDealt,
                                    nameB: meta.mvpB.name,
                                    valB: meta.mvpB.damageDealt,
                                    unit: "DMG",
                                },
                                {
                                    Icon: Skull,
                                    color: "text-red-400",
                                    label: "Most Eliminations (KO's)",
                                    nameA: meta.mostKOA.name,
                                    valA: meta.mostKOA.kos,
                                    nameB: meta.mostKOB.name,
                                    valB: meta.mostKOB.kos,
                                    unit: "KO'S",
                                },
                                {
                                    Icon: ShieldCheck,
                                    color: "text-blue-400",
                                    label: "Iron Wall (Damage Blocked)",
                                    nameA: meta.wallA.name,
                                    valA: meta.wallA.damageBlocked,
                                    nameB: meta.wallB.name,
                                    valB: meta.wallB.damageBlocked,
                                    unit: "BLK",
                                },
                                {
                                    Icon: RefreshCw,
                                    color: "text-purple-400",
                                    label: "Resurrector (Revivals)",
                                    nameA: meta.reviveA.name,
                                    valA: meta.reviveA.revivals,
                                    nameB: meta.reviveB.name,
                                    valB: meta.reviveB.revivals,
                                    unit: "REV",
                                },
                                {
                                    Icon: HeartPulse,
                                    color: "text-emerald-400",
                                    label: "Field Medic (Healing Done)",
                                    nameA: meta.healerA.name,
                                    valA: meta.healerA.healingDone,
                                    nameB: meta.healerB.name,
                                    valB: meta.healerB.healingDone,
                                    unit: "HP",
                                },
                            ].map(({ Icon, color, label, nameA, valA, nameB, valB, unit }) => {
                                const aWon = valA >= valB;
                                const bWon = valB >= valA;

                                return (
                                    <div
                                        key={label}
                                        className="flex min-w-0 flex-col gap-2 rounded-lg p-2"
                                    >
                                        <div className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                                            <Icon className={cn("size-3.5 shrink-0 sm:size-4", color)} />
                                            <span className="min-w-0">{label}</span>
                                        </div>

                                        <div className="grid min-w-0 grid-cols-2 gap-2">
                                            {/* Team A */}
                                            <div
                                                className={cn(
                                                    "flex min-w-0 flex-col rounded-md border p-2 transition-all",
                                                    aWon
                                                        ? "border-primary/40 bg-primary/10 font-bold"
                                                        : "border-border/50 bg-muted/20 opacity-75"
                                                )}
                                            >
                                                <span title={nameA} className="truncate text-[9px] text-muted-foreground sm:text-[10px]">
                                                    {nameA}
                                                </span>

                                                <div className="mt-1 flex min-w-0 flex-wrap items-baseline justify-between gap-1">
                                                    <span className={cn("text-sm font-black tabular-nums sm:text-base", aWon ? "text-primary" : "text-foreground")}>
                                                        {valA} <span className="text-[9px] font-normal opacity-70">{unit}</span>
                                                    </span>

                                                    {aWon && (
                                                        <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] text-primary-foreground">
                                                            WIN
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Team B */}
                                            <div
                                                className={cn(
                                                    "flex min-w-0 flex-col rounded-md border p-2 transition-all",
                                                    bWon
                                                        ? "border-secondary/40 bg-secondary/10 font-bold"
                                                        : "border-border/50 bg-muted/20 opacity-75"
                                                )}
                                            >
                                                <span title={nameB} className="truncate text-[9px] text-muted-foreground sm:text-[10px]">
                                                    {nameB}
                                                </span>

                                                <div className="mt-1 flex min-w-0 flex-wrap items-baseline justify-between gap-1">
                                                    <span className={cn("text-sm font-black tabular-nums sm:text-base", bWon ? "text-secondary" : "text-foreground")}>
                                                        {valB} <span className="text-[9px] font-normal opacity-70">{unit}</span>
                                                    </span>

                                                    {bWon && (
                                                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[8px] text-secondary-foreground">
                                                            WIN
                                                        </span>
                                                    )}
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




// import {
//     Crown, Skull,
//     ChevronRight,
//     Zap, HeartPulse, RefreshCw, TrendingUp,
//     Star, Flame, Activity, Trophy, ShieldCheck,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { useState } from "react";
// import { AnimatePresence } from "framer-motion";
// import type {
//     ActionEvent,
//     BattleMetadata,
//     FighterTelemetry,
// } from "@/lib/matchup/combat/adapters";

// import type { ElementType, ReactNode } from "react";

// // ── Battle-end helpers ────────────────────────────────────────────────────────

// function StatBar({ value, max = 100, colorClass }: { value: number; max?: number; colorClass: string }) {
//     const safeMax = Math.max(1, max);
//     const pct = Math.max(
//         0,
//         Math.min(100, Math.round((value / safeMax) * 100))
//     );
//     return (
//         <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
//             <motion.div
//                 className={cn("h-full rounded-full", colorClass)}
//                 initial={{ width: 0 }}
//                 animate={{ width: `${pct}%` }}
//                 transition={{ duration: 0.7, ease: "easeOut" }}
//             />
//         </div>
//     );
// }

// function MiniStat({ label, value, Icon, color }: { label: string; value: string | number; Icon: ElementType; color: string }) {
//     return (
//         <div className="flex items-center gap-1">
//             <Icon className={cn("size-2.5 shrink-0", color)} />
//             <span className="text-[7px] text-muted-foreground font-medium">{label}:</span>
//             <span className={cn("text-[7px] font-bold ml-auto", color)}>{value}</span>
//         </div>
//     );
// }

// function FighterCard({ fighter, isWinner }: { fighter: FighterTelemetry; isWinner: boolean }) {
//     const maxDmg = Math.max(fighter.damageDealt, 1);
//     return (
//         <div className={cn(
//             "flex flex-col gap-1 p-1.5 rounded-lg border",
//             isWinner ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/10 border-muted-foreground/15"
//         )}>
//             <div className="flex items-center justify-between gap-1">
//                 <span className={cn("text-[7.5px] font-bold truncate max-w-[70px]", isWinner ? "text-amber-300" : "text-foreground/80")}>
//                     {fighter.name}
//                 </span>
//                 {isWinner && <Star className="size-2.5 text-amber-400 shrink-0" />}
//             </div>
//             <div className="space-y-0.5">
//                 <MiniStat label="DMG" value={fighter.damageDealt} Icon={Flame} color="text-red-400" />
//                 <MiniStat label="KOs" value={fighter.kos} Icon={Skull} color="text-orange-400" />
//                 <MiniStat label="Blk" value={fighter.damageBlocked} Icon={ShieldCheck} color="text-cyan-400" />
//                 <MiniStat label="Heal" value={fighter.healingDone} Icon={HeartPulse} color="text-emerald-400" />
//                 <MiniStat label="Eff" value={`${fighter.efficiency}%`} Icon={TrendingUp} color="text-violet-400" />
//             </div>
//             <div className="space-y-0.5 mt-0.5">
//                 <div className="flex justify-between text-[6px] text-muted-foreground/60">
//                     <span>Damage</span><span>{fighter.damageDealt}</span>
//                 </div>
//                 <StatBar value={fighter.damageDealt} max={maxDmg * 1.2} colorClass="bg-red-500" />
//                 <div className="flex justify-between text-[6px] text-muted-foreground/60 mt-0.5">
//                     <span>Survival rate</span><span>{fighter.survivalRate}%</span>
//                 </div>
//                 <StatBar value={fighter.survivalRate} colorClass="bg-emerald-500" />
//             </div>
//         </div>
//     );
// }

// function TeamSection({
//     label, fighters, mvp, variant,
// }: {
//     label: string;
//     fighters: FighterTelemetry[];
//     mvp: FighterTelemetry;
//     variant: "primary" | "secondary";
// }) {
//     const accent = variant === "primary" ? "text-primary" : "text-secondary";
//     const totalDmg = fighters.reduce((s, f) => s + f.damageDealt, 0);
//     const totalBlk = fighters.reduce((s, f) => s + f.damageBlocked, 0);
//     const totalHeal = fighters.reduce((s, f) => s + f.healingDone, 0);
//     const totalKOs = fighters.reduce((s, f) => s + f.kos, 0);
//     const avgEff = Math.round(fighters.reduce((s, f) => s + f.efficiency, 0) / (fighters.length || 1));
//     const avgSurv = Math.round(fighters.reduce((s, f) => s + f.survivalRate, 0) / (fighters.length || 1));

//     return (
//         /* rounded-xl border bg, border */
//         <div className="flex flex-col gap-1.5 p-2">
//             <div className="flex items-center justify-between">
//                 <span className={cn("text-[8px] font-black uppercase tracking-widest", accent)}>{label}</span>
//                 <div className="flex gap-2">
//                     <span className="text-[6.5px] text-muted-foreground">EFF <span className={cn("font-bold", accent)}>{avgEff}%</span></span>
//                     <span className="text-[6.5px] text-muted-foreground">SURV <span className={cn("font-bold", accent)}>{avgSurv}%</span></span>
//                 </div>
//             </div>
//             <div className="grid grid-cols-4 gap-1">
//                 {[
//                     { label: "DMG", value: totalDmg, Icon: Flame, color: "text-red-400" },
//                     { label: "KOs", value: totalKOs, Icon: Skull, color: "text-orange-400" },
//                     { label: "Blocked", value: totalBlk, Icon: ShieldCheck, color: "text-cyan-400" },
//                     { label: "Healed", value: totalHeal, Icon: HeartPulse, color: "text-emerald-400" },
//                 ].map(({ label, value, Icon, color }) => (
//                     <div key={label} className="flex flex-col items-center gap-0.5 bg-background/30 rounded-md p-1">
//                         <Icon className={cn("size-2.5", color)} />
//                         <span className={cn("text-[8px] font-bold", color)}>{value}</span>
//                         <span className="text-[6px] text-muted-foreground/70 text-center leading-tight">{label}</span>
//                     </div>
//                 ))}
//             </div>
//             <div className={cn(
//                 "grid gap-1",
//                 fighters.length === 1 ? "grid-cols-1" : fighters.length === 2 ? "grid-cols-2" : "grid-cols-3"
//             )}>
//                 {fighters.map(f => (
//                     <FighterCard key={f.name} fighter={f} isWinner={f.name === mvp.name} />
//                 ))}
//             </div>
//         </div>
//     );
// }

// // Collapsible section wrapper
// type SectionKey = "overview" | "teamA" | "teamB" | "awards";




// function Accordion({
//     sectionKey, label, icon: Icon, iconColor, open, onToggle, children,
// }: {
//     sectionKey: SectionKey;
//     label: string;
//     icon: ElementType;
//     iconColor: string;
//     open: boolean;
//     onToggle: (k: SectionKey) => void;
//     children: ReactNode;
// }) {
//     return (
//         <div className={cn("relative", open ? "z-50" : "z-0")}>
//             <div className="rounded-lg border border-muted-foreground/15 bg-background">
//                 <button
//                     type="button"
//                     onClick={() => onToggle(sectionKey)}
//                     className="w-full flex items-center justify-between px-2.5 py-1.5 bg-muted/10 hover:bg-muted/20 transition-colors rounded-lg"
//                 >
//                     <div className="flex items-center gap-1.5">
//                         <Icon className={cn("size-3 shrink-0", iconColor)} />
//                         <span className="text-[8px] font-bold uppercase tracking-wider text-foreground/80">
//                             {label}
//                         </span>
//                     </div>

//                     <ChevronRight
//                         className={cn(
//                             "size-3 text-muted-foreground transition-transform duration-200",
//                             open && "rotate-90"
//                         )}
//                     />
//                 </button>
//             </div>

//             <AnimatePresence>
//                 {open && (
//                     <motion.div
//                         key="content"
//                         initial={{ opacity: 0, y: -4 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -4 }}
//                         transition={{ duration: 0.18 }}
//                         className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-muted-foreground/20 bg-background shadow-xl"
//                     >
//                         <div
//                             className="h-[190px] overflow-y-auto overflow-x-hidden p-2"
//                             style={{
//                                 WebkitOverflowScrolling: "touch",
//                                 scrollbarWidth: "none",
//                             }}
//                         >
//                             {children}
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }




// // ── Battle End Screen (finish / rout) ────────────────────────────────────────
// export function BattleEndScreen({
//     isVictory,
//     log,
//     meta,
// }: {
//     isVictory: boolean;
//     log: ActionEvent["log"];
//     meta: BattleMetadata | undefined;
// }) {
//     const [open, setOpen] = useState<SectionKey | null>(null);
//     const toggle = (k: SectionKey) => setOpen(prev => prev === k ? null : k);

//     return (
//         <div className="flex flex-col gap-1.5 py-2 px-2 mx-auto max-w-xl h-full overflow-y-auto [scrollbar-width:none]">
//             {/* ── Always-visible banner ── */}
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.85 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className={cn(
//                     "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border  shrink-0",
//                     isVictory
//                         ? "bg-amber-500/10 border-amber-500/40 shadow-amber-500/20"
//                         : "bg-red-500/10 border-red-500/40 shadow-red-500/20"
//                 )}
//             >
//                 <div className="flex items-center gap-2 min-w-0">
//                     <div className={cn(
//                         "p-1.5 rounded-full border-2 shrink-0",
//                         isVictory ? "bg-amber-400/20 border-amber-400/60" : "bg-red-500/20 border-red-500/60"
//                     )}>
//                         {isVictory
//                             ? <Crown className="size-4 text-amber-400" />
//                             : <Skull className="size-4 text-red-400 animate-pulse" />}
//                     </div>
//                     <div className="flex flex-col min-w-0">
//                         <span className={cn("text-[9px] font-black uppercase tracking-widest", isVictory ? "text-amber-400" : "text-red-400")}>
//                             {meta?.winType ?? "Engagement Concluded"}
//                         </span>
//                         <p className="text-[7px] font-medium text-foreground/60 leading-tight max-w-[180px]">
//                             {log.text}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="flex flex-col items-end gap-0 shrink-0">
//                     <span className="text-[6px] text-muted-foreground uppercase tracking-wide">Rounds</span>
//                     <span className="text-[13px] font-black text-foreground leading-none">{meta?.totalRounds ?? "—"}</span>
//                     <span className="text-[6.5px] text-muted-foreground">
//                         KOs <span className="text-orange-400 font-bold">{meta?.totalKoCount ?? 0}</span>
//                     </span>
//                 </div>
//             </motion.div>

//             {/* ── Quick-glance stat chips ── */}
//             {meta && (
//                 <motion.div
//                     initial={{ opacity: 0, y: 3 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.08 }}
//                     className="grid grid-cols-4 gap-1 shrink-0"
//                 >
//                     {[
//                         { Icon: Activity, color: "text-violet-400", label: "Total DMG", value: meta.totalDamageDealt.toLocaleString() },
//                         { Icon: HeartPulse, color: "text-emerald-400", label: "Healed", value: meta.totalHealingDone.toLocaleString() },
//                         { Icon: Flame, color: "text-orange-400", label: "Best Hit", value: String(meta.mostDamageSingleHit.damage) },
//                         { Icon: Zap, color: "text-yellow-400", label: "Win Edge", value: `${meta.dominance}%` },
//                     ].map(({ Icon, color, label, value }) => (
//                         <div key={label} className="flex flex-col items-center gap-0.5 bg-muted/10 border border-muted-foreground/10 rounded-lg p-1">
//                             <Icon className={cn("size-2.5", color)} />
//                             <span className={cn("text-[7.5px] font-bold leading-none", color)}>{value}</span>
//                             <span className="text-[5.5px] text-muted-foreground/60 text-center leading-tight">{label}</span>
//                         </div>
//                     ))}
//                 </motion.div>
//             )}

//             {/* ── Power balance bar ── */}
//             {meta && (
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.12 }}
//                     className="flex flex-col gap-0.5 px-0.5 shrink-0"
//                 >
//                     <div className="flex justify-between text-[6.5px]">
//                         <span className="text-primary font-bold">A <span className="text-foreground">{meta.teamAPowerAvg}</span></span>
//                         <span className="text-muted-foreground/60 uppercase tracking-widest text-[5.5px] self-center">Power Avg</span>
//                         <span className="text-secondary font-bold"><span className="text-foreground">{meta.teamBPowerAvg}</span> B</span>
//                     </div>
//                     <div className="flex h-1 w-full rounded-full overflow-hidden">
//                         <motion.div className="bg-primary" initial={{ flex: 0 }} animate={{ flex: meta.teamAPowerAvg }} transition={{ duration: 0.7 }} />
//                         <motion.div className="bg-secondary" initial={{ flex: 0 }} animate={{ flex: meta.teamBPowerAvg }} transition={{ duration: 0.7 }} />
//                     </div>
//                 </motion.div>
//             )}

//             {/* ── Collapsible sections ── */}
//             {meta && (
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.16 }}
//                     className="flex flex-col gap-1 relative z-10"
//                 >
//                     {/* Overview */}
//                     <Accordion sectionKey="overview" label="Overview" icon={Activity} iconColor="text-violet-400" open={open === "overview"} onToggle={toggle}>
//                         <div className="flex flex-col gap-1.5">
//                             {meta.longestStreak.streak > 1 && (
//                                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
//                                     <Flame className="size-3 text-green-400 shrink-0" />
//                                     <span className="text-[7.5px] font-bold text-yellow-300">{meta.longestStreak.name}</span>
//                                     <span className="text-[7px] text-muted-foreground">· {meta.longestStreak.streak}-hit streak</span>
//                                 </div>
//                             )}
//                             <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25">
//                                 <Zap className="size-3 text-blue-400 shrink-0" />
//                                 <span className="text-[7px] text-muted-foreground">Hardest hit:</span>
//                                 <span className="text-[7.5px] font-bold text-red-300 ml-auto">{meta.mostDamageSingleHit.damage} by {meta.mostDamageSingleHit.name.split(" ")[0]}</span>
//                             </div>
//                         </div>
//                     </Accordion>

//                     {/* Team A */}
//                     <Accordion sectionKey="teamA" label="Team A Breakdown" icon={Trophy} iconColor="text-primary" open={open === "teamA"} onToggle={toggle}>
//                         <TeamSection label="Team A" fighters={meta.teamAStats} mvp={meta.mvpA} variant="primary" />
//                     </Accordion>

//                     {/* Team B */}
//                     <Accordion sectionKey="teamB" label="Team B Breakdown" icon={Trophy} iconColor="text-secondary" open={open === "teamB"} onToggle={toggle}>
//                         <TeamSection label="Team B" fighters={meta.teamBStats} mvp={meta.mvpB} variant="secondary" />
//                     </Accordion>

//                     {/* Awards */}
//                     <Accordion sectionKey="awards" label="Awards" icon={Star} iconColor="text-amber-400" open={open === "awards"} onToggle={toggle}>
//                         <div className="grid grid-cols-1 gap-1.5">
//                             {[
//                                 {
//                                     Icon: Trophy,
//                                     color: "text-amber-400",
//                                     label: "Top MVP (Damage Dealt)",
//                                     nameA: meta.mvpA.name, valA: meta.mvpA.damageDealt,
//                                     nameB: meta.mvpB.name, valB: meta.mvpB.damageDealt,
//                                     unit: "DMG",
//                                 },
//                                 {
//                                     Icon: Skull,
//                                     color: "text-red-400",
//                                     label: "Most Eliminations (KO's)",
//                                     nameA: meta.mostKOA.name, valA: meta.mostKOA.kos,
//                                     nameB: meta.mostKOB.name, valB: meta.mostKOB.kos,
//                                     unit: "KO'S",
//                                 },
//                                 {
//                                     Icon: ShieldCheck,
//                                     color: "text-blue-400",
//                                     label: "Iron Wall (Damage Blocked)",
//                                     nameA: meta.wallA.name, valA: meta.wallA.damageBlocked,
//                                     nameB: meta.wallB.name, valB: meta.wallB.damageBlocked,
//                                     unit: "BLK",
//                                 },
//                                 {
//                                     Icon: RefreshCw,
//                                     color: "text-purple-400",
//                                     label: "Resurrector (Revivals)",
//                                     nameA: meta.reviveA.name, valA: meta.reviveA.revivals,
//                                     nameB: meta.reviveB.name, valB: meta.reviveB.revivals,
//                                     unit: "REV",
//                                 },
//                                 {
//                                     Icon: HeartPulse,
//                                     color: "text-emerald-400",
//                                     label: "Field Medic (Healing Done)",
//                                     nameA: meta.healerA.name, valA: meta.healerA.healingDone,
//                                     nameB: meta.healerB.name, valB: meta.healerB.healingDone,
//                                     unit: "HP",
//                                 },
//                             ].map(({ Icon, color, label, nameA, valA, nameB, valB, unit }) => {
//                                 // Independent win checks — both win if values are equal!
//                                 const aWon = valA >= valB;
//                                 const bWon = valB >= valA;

//                                 return (
//                                     <div key={label} className="flex flex-col p-2 gap-1.5">
//                                         {/* Category Header */}
//                                         <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
//                                             <Icon className={cn("size-3.5", color)} />
//                                             <span>{label}</span>
//                                         </div>

//                                         {/* Head-to-Head Split Box */}
//                                         <div className="grid grid-cols-2 gap-2">
//                                             {/* Team A Side */}
//                                             <div className={cn(
//                                                 "flex flex-col p-1.5 rounded border transition-all",
//                                                 aWon ? "bg-primary/10 border-primary/40 font-bold" : "bg-muted/20 border-border/50 opacity-75"
//                                             )}>
//                                                 <span className="text-[7px] text-muted-foreground truncate">{nameA}</span>
//                                                 <div className="flex items-baseline justify-between mt-0.5">
//                                                     <span className={cn("text-xs font-black", aWon ? "text-primary" : "text-foreground")}>
//                                                         {valA} <span className="text-[9px] font-normal opacity-70">{unit}</span>
//                                                     </span>
//                                                     {aWon && <span className="text-[9px] bg-primary text-primary-foreground px-1 rounded">WIN</span>}
//                                                 </div>
//                                             </div>

//                                             {/* Team B Side */}
//                                             <div className={cn(
//                                                 "flex flex-col p-1.5 rounded border transition-all",
//                                                 bWon ? "bg-secondary/10 border-secondary/40 font-bold" : "bg-muted/20 border-border/50 opacity-75"
//                                             )}>
//                                                 <span className="text-[7px] text-muted-foreground truncate">{nameB}</span>
//                                                 <div className="flex items-baseline justify-between mt-0.5">
//                                                     <span className={cn("text-xs font-black", bWon ? "text-secondary" : "text-foreground")}>
//                                                         {valB} <span className="text-[9px] font-normal opacity-70">{unit}</span>
//                                                     </span>
//                                                     {bWon && <span className="text-[9px] bg-secondary text-secondary-foreground px-1 rounded">WIN</span>}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </Accordion>
//                 </motion.div>
//             )}
//         </div>
//     );
// }