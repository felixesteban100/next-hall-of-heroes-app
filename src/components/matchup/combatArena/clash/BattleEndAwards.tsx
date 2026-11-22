import {
    Trophy,
    Skull,
    ShieldCheck,
    RefreshCw,
    HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BattleMetadata } from "@/lib/matchup/combat/types/types";

export function BattleEndAwards({ meta }: { meta: BattleMetadata }) {
    return (
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
    );
}
