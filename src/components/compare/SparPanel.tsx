"use client";

import { useEffect, useMemo, useState } from "react";
import { Dices } from "lucide-react";
import { simulateSpar } from "@/lib/compare_utls";

export function SparPanel({
    scoreA,
    scoreB,
    nameA = "Character A",
    nameB = "Character B",
}: {
    scoreA: number | null;
    scoreB: number | null;
    nameA?: string;
    nameB?: string;
}) {
    const [seed, setSeed] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // Ensure we only run randomized simulations after hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const result = useMemo(() => {
        if (!isMounted || scoreA == null || scoreB == null) return null;
        void seed;
        return simulateSpar(scoreA, scoreB, 100);
    }, [scoreA, scoreB, seed, isMounted]);

    if (scoreA == null || scoreB == null) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select both characters to run a spar simulation
            </p>
        );
    }

    return (
        <div className="rounded-xl border border-muted-foreground/20 p-4 space-y-3 min-h-[140px]">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Spar simulation (100 rounds)
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

            {/* Skeleton loader / fallback state during SSR hydration */}
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
                            <p className="text-[10px] text-muted-foreground">Draws</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-secondary">{result.bWins}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{nameB}</p>
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${result.aWinPct}%` }}
                        />
                        <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${100 - result.aWinPct}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">
                        Toy model from overall scores — not canon. {nameA} win rate ≈{" "}
                        {result.aWinPct}%
                    </p>
                </>
            )}
        </div>
    );
}