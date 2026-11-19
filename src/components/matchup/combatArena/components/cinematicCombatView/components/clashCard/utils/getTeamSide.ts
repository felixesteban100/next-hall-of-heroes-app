
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import type { EnrichedFighter } from "@/lib/matchup/combat/adapters/adapters";

export function isTeamACharacter(
    character: EnrichedFighter | null | undefined,
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[]
): boolean {
    if (!character) return true;

    return teamAChars.some(
        (fighter) => fighter.name === character.name
    );
}
