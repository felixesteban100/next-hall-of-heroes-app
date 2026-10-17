// components/compare/RoundDistributionChart.tsx
"use client";

import { Trophy } from "lucide-react";

type Props = {
    aWins?: number;
    bWins?: number;
    draws?: number;
    nameA?: string;
    nameB?: string;
};

export function RoundDistributionChart({
    aWins = 0,
    bWins = 0,
    draws = 0,
    nameA = "Team A",
    nameB = "Team B",
}: Props) {
    // Calculate simulated victory conditions
    const decisiveA = Math.round(aWins * 0.65);
    const clutchA = aWins - decisiveA;

    const decisiveB = Math.round(bWins * 0.65);
    const clutchB = bWins - decisiveB;

    return (
        <div className="pt-3 border-t border-muted-foreground/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Trophy className="size-3 text-amber-400" /> Round Breakdown (100 Matches)
                </span>
            </div>

            {/* Mini Visual Cards Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-primary/5 border border-primary/20 p-2 rounded-lg text-center">
                    <div className="text-[10px] font-semibold text-primary truncate">{nameA} Stomps</div>
                    <div className="text-sm font-black text-foreground">{decisiveA} <span className="text-[9px] text-muted-foreground">/ {aWins}</span></div>
                </div>

                <div className="bg-muted/30 border border-muted-foreground/15 p-2 rounded-lg text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground truncate">Clutch Finish / Draws</div>
                    <div className="text-sm font-black text-foreground">{clutchA + clutchB + draws}</div>
                </div>

                <div className="bg-secondary/10 border border-secondary/20 p-2 rounded-lg text-center">
                    <div className="text-[10px] font-semibold text-secondary truncate">{nameB} Stomps</div>
                    <div className="text-sm font-black text-foreground">{decisiveB} <span className="text-[9px] text-muted-foreground">/ {bWins}</span></div>
                </div>
            </div>
        </div>
    );
}