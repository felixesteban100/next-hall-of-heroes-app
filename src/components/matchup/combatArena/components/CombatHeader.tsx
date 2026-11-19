"use client";

import type { CombatState } from "@/lib/matchup/combat/types/types";

type Props = {
    state: CombatState;
    nameA: string;
    nameB: string;
};

export function CombatHeader({ state, nameA, nameB }: Props) {
    const aliveA = state.fighters.filter((f) => f.side === "A" && f.isAlive).length;
    const aliveB = state.fighters.filter((f) => f.side === "B" && f.isAlive).length;
    const totalA = state.fighters.filter((f) => f.side === "A").length;
    const totalB = state.fighters.filter((f) => f.side === "B").length;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-muted-foreground/20 pb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Round {state.round}
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