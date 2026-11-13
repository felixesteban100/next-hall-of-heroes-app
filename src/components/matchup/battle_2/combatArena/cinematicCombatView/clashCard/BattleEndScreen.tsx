
import {
    Crown, Skull,
    ChevronRight,
    Zap, HeartPulse, RefreshCw, TrendingUp,
    Star, Flame, Activity, Trophy, ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BattleMetadata, FighterTelemetry } from "@/lib/matchup/combat/adapters";

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
export function BattleEndScreen({ isVictory, log, meta }: {
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