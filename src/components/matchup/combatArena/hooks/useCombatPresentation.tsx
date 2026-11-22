"use client";

import { useMemo } from "react";
import type { CombatFighter, CombatEvent } from "@/lib/matchup/combat/types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

type DisplayFighter = CombatFighter & { prevHp: number };

type Props = {
    fightersA: CombatFighter[];
    fightersB: CombatFighter[];
    events: CombatEvent[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    previousHpById: Record<number, number>;
};

export function useCombatPresentation({
    fightersA,
    fightersB,
    events,
    teamAChars,
    teamBChars,
    previousHpById,
}: Props) {
    const enrichedA = useMemo<DisplayFighter[]>(
        () => fightersA.map((fighter) => ({
            ...fighter,
            prevHp: previousHpById[fighter.id] ?? fighter.currentHp,
        })),
        [fightersA, previousHpById]
    );

    const enrichedB = useMemo<DisplayFighter[]>(
        () => fightersB.map((fighter) => ({
            ...fighter,
            prevHp: previousHpById[fighter.id] ?? fighter.currentHp,
        })),
        [fightersB, previousHpById]
    );

    const allChars = useMemo(
        () => [...teamAChars, ...teamBChars],
        [teamAChars, teamBChars]
    );

    // The view consumes the original event; fighter resolution happens where needed.
    const currentActionEvent = events[events.length - 1] ?? null;

    // Preserve the existing MVP selection behavior.
    const mvpA = enrichedA.find((fighter) => fighter.isAlive)?.name;
    const mvpB = enrichedB.find((fighter) => fighter.isAlive)?.name;

    return {
        enrichedA,
        enrichedB,
        visibleLogs: events,
        allChars,
        currentActionEvent,
        mvpA,
        mvpB,
    };
}
