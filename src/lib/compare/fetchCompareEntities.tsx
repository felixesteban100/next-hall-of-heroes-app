"use server"

// lib/compare/fetchCompareEntities.ts
import { collectionCharacters } from "@/db/mongodb";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import type { Character, CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

export async function fetchCharacterById(
    id: number
): Promise<CharacterWithJoinTeamUniversePowerEnemies | null> {
    return collectionCharacters
        .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
            joinTeam_universe_power_enemies_toCharacter(
                { id },
                "id",
                "desc",
                0,
                1,
                { includeEnemies: true }
            )
        )
        .next();
}

export async function fetchCharactersByIds(
    ids: number[]
): Promise<CharacterWithJoinTeamUniversePowerEnemies[]> {
    if (ids.length === 0) return [];

    const rows = await Promise.all(ids.map((id) => fetchCharacterById(id)));

    // keep URL order, drop missing
    return ids
        .map((id) => rows.find((r) => r?.id === id) ?? null)
        .filter((r): r is CharacterWithJoinTeamUniversePowerEnemies => r != null);
}

export async function fetchFightersById(ids: number[]): Promise<Character[]> {
    return collectionCharacters
        .find<Character>({ id: { $in: [...ids] } })
        .project<Character>({ _id: 0 })
        .toArray();
}