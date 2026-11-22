import {
    Skull,
    HeartPulse,
    TrendingUp,
    Star,
    Flame,
    ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FighterTelemetry } from "@/lib/matchup/combat/types/types";
import type { ElementType } from "react";

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

export function TeamSection({
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

