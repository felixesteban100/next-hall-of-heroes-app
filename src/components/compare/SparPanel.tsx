// components/compare/SparPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Dices } from "lucide-react";
import { simulateSpar } from "@/lib/compare/compare_utls";

const ROUNDS = 100

export function SparPanel({
    powerEstimateA,
    powerEstimateB,
    nameA = "Character A",
    nameB = "Character B",
}: {
    powerEstimateA: number;
    powerEstimateB: number;
    nameA?: string;
    nameB?: string;
}) {
    const [seed, setSeed] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const result = useMemo(() => {
        if (!isMounted) return null;
        void seed;
        return simulateSpar(powerEstimateA, powerEstimateB, ROUNDS);
    }, [powerEstimateA, powerEstimateB, seed, isMounted]);

    if (powerEstimateA == null || powerEstimateB == null) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select for both sides to run a spar simulation
            </p>
        );
    }

    // Calculate percentages for a 3-way split (A wins, Draws, B wins)
    const totalRounds = ROUNDS;
    const aPct = result ? (result.aWins / totalRounds) * 100 : 0;
    const drawPct = result ? (result.draws / totalRounds) * 100 : 0;
    const bPct = result ? (result.bWins / totalRounds) * 100 : 0;

    return (
        <div className="rounded-xl border border-muted-foreground/20 p-4 space-y-3 min-h-[140px]">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Spar simulation ({ROUNDS} rounds)
                </h3>
                <button
                    type="button"
                    onClick={() => setSeed((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                >
                    <Dices className="size-3.5" />
                    Roll again
                </button>
            </div>

            {!result ? (
                <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
                    Calculating simulation...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-lg font-black text-primary">{result.aWins}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{nameA}</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-muted-foreground">{result.draws}</p>
                            <p className="text-[10px] text-muted-foreground">Draws / Toss-ups</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-secondary">{result.bWins}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{nameB}</p>
                        </div>
                    </div>

                    {/* 3-Way Split Progress Bar (A wins | Draws | B wins) */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${aPct}%` }}
                        />
                        <div
                            className="h-full bg-muted-foreground/40 transition-all"
                            style={{ width: `${drawPct}%` }}
                        />
                        <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${bPct}%` }}
                        />
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground">
                        Toy model from overall scores — not canon. {nameA} win rate ≈{" "}
                        {Math.round(aPct)}%
                    </p>
                </>
            )}
        </div>
    );
}