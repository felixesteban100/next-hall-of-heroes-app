"use client";

import type { CombatState } from "@/lib/matchup/combat/types";
import { cn } from "@/lib/utils";

type Props = {
    state: CombatState;
    nameA: string;
    nameB: string;
};

export function CombatHeader({ state, nameA, nameB }: Props) {
    const current = state.fighters.find(
        (f) => f.id === state.selectedActorId
        // (f) => f.id === state.turnOrder[state.currentTurnIndex]
    );

    const aliveA = state.fighters.filter((f) => f.side === "A" && f.isAlive).length;
    const aliveB = state.fighters.filter((f) => f.side === "B" && f.isAlive).length;
    const totalA = state.fighters.filter((f) => f.side === "A").length;
    const totalB = state.fighters.filter((f) => f.side === "B").length;

    /* const resultText =
  state.winner === "draw"
    ? "DRAW"
    : state.winner
      ? `TEAM ${state.winner} WINS`
      : ""; */

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-muted-foreground/20 pb-3">
            <div className="flex items-center gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Round {state.round}
                </div>
                <div className="h-4 w-px bg-muted-foreground/30" />
                <div className="text-sm font-medium">
                    {state.winner ? (
                        <span className="text-amber-400 font-bold">
                            Side {state.winner} wins!
                        </span>
                    ) : current ? (
                        <span>
                            <span className={cn(
                                "font-semibold",
                                current.side === "A" ? "text-primary" : "text-secondary"
                            )}>
                                {current.name}
                            </span>
                            <span className="text-muted-foreground"> · turn</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Select character...</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <span className="text-primary font-bold">{nameA}</span>
                    <span className="text-muted-foreground">
                        {aliveA}/{totalA}
                    </span>
                </div>
                <span className="text-muted-foreground/50">vs</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-secondary font-bold">{nameB}</span>
                    <span className="text-muted-foreground">
                        {aliveB}/{totalB}
                    </span>
                </div>
            </div>
        </div>
    );
}