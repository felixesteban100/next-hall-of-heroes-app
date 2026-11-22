import {
    Crown,
    Skull,
    Zap,
    HeartPulse,
    Activity,
    Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CombatEvent, BattleMetadata } from "@/lib/matchup/combat/types/types";

type BattleEndSummaryProps = {
    isVictory: boolean;
    event: CombatEvent;
    meta: BattleMetadata | undefined;
};

export function BattleEndSummary({
    isVictory,
    event,
    meta,
}: BattleEndSummaryProps) {
    return (
        <>
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
                            {event.text}
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
        </>
    );
}
