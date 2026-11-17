"use client";

import { useMemo } from "react";

import type {
    CombatFighter,
    CombatEvent,
} from "@/lib/matchup/combat/types";

import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import {
    toEnrichedFighter,
    toLegacyLog,
    buildActionEvent,
} from "@/lib/matchup/combat/adapters";

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
    const enrichedA = useMemo(
        () =>
            fightersA.map((fighter) =>
                toEnrichedFighter(
                    fighter,
                    previousHpById[fighter.id] ?? fighter.currentHp
                )
            ),
        [fightersA, previousHpById]
    );

    const enrichedB = useMemo(
        () =>
            fightersB.map((fighter) =>
                toEnrichedFighter(
                    fighter,
                    previousHpById[fighter.id] ?? fighter.currentHp
                )
            ),
        [fightersB, previousHpById]
    );

    const visibleLogs = useMemo(
        () => events.map(toLegacyLog),
        [events]
    );

    const allChars = useMemo(
        () => [...teamAChars, ...teamBChars],
        [teamAChars, teamBChars]
    );

    const latestEvent = events[events.length - 1] ?? null;

    const currentActionEvent = useMemo(
        () =>
            buildActionEvent(
                latestEvent,
                fightersA,
                fightersB,
                allChars,
                previousHpById
            ),
        [
            latestEvent,
            fightersA,
            fightersB,
            allChars,
            previousHpById,
        ]
    );

    // Preserve the existing MVP selection behavior.
    const mvpA = enrichedA.find((fighter) => fighter.isAlive)?.name;
    const mvpB = enrichedB.find((fighter) => fighter.isAlive)?.name;

    return {
        enrichedA,
        enrichedB,
        visibleLogs,
        allChars,
        currentActionEvent,
        mvpA,
        mvpB,
    };
}