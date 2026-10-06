"use client";

import { useMemo, useState } from "react";
import { Dices } from "lucide-react";
import { simulateSpar } from "@/lib/compare_utls";

export function SparPanel({
    scoreA,
    scoreB,
    nameA = "Entity A",
    nameB = "Entity B",
}: {
    scoreA: number | null;
    scoreB: number | null;
    nameA?: string;
    nameB?: string;
}) {
    const [seed, setSeed] = useState(0);

    const result = useMemo(() => {
        if (scoreA == null || scoreB == null) return null;
        // seed in deps so "Roll again" re-runs
        void seed;
        return simulateSpar(scoreA, scoreB, 100);
    }, [scoreA, scoreB, seed]);

    if (scoreA == null || scoreB == null) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select both characters to run a spar simulation
            </p>
        );
    }

    return (
        <div className="rounded-xl border border-muted-foreground/20 p-4 space-y-3">
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

            {result && (
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