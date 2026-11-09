import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { getCharacterAlignmentText } from "../character_utils";

export const getTeamNames = (teams: any) => {
    if (!teams || !Array.isArray(teams)) return [];
    return teams.map((t) => (typeof t === "string" ? t : t.name || t.value));
};

export const getEnemyNames = (enemies: any) => {
    if (!enemies || !Array.isArray(enemies)) return [];
    return enemies.map((e) => (typeof e === "string" ? e : e.name));
};

export const getPowerNames = (powers: any) => {
    if (!powers || !Array.isArray(powers)) return [];
    return powers.map((p) => (typeof p === "string" ? p : p.name || p.value));
};

export const getAlignmentNames = (powers: any) => {
    if (!powers || !Array.isArray(powers)) return [];
    return powers.map((p) =>
        getCharacterAlignmentText(typeof p === "string" ? p : p.name || p.value)
    );
};

export function hasNemesisLink(
    a: CharacterWithJoinTeamUniversePowerEnemies,
    b: CharacterWithJoinTeamUniversePowerEnemies
): boolean {
    if (!a || !b) return false;

    const list = (entity: CharacterWithJoinTeamUniversePowerEnemies) =>
        entity.connections?.enemies ?? [];

    const hits = (
        source: CharacterWithJoinTeamUniversePowerEnemies,
        target: CharacterWithJoinTeamUniversePowerEnemies
    ) =>
        list(source).some((e) => {
            if (!e || typeof e !== "object") return false;
            const id = "id" in e ? Number(e.id) : NaN;
            const name = "name" in e ? String((e as any).name ?? "") : "";
            return (
                (!Number.isNaN(id) && id === target.id) ||
                (name.length > 0 && name.toLowerCase() === target.name?.toLowerCase())
            );
        });

    return hits(a, b) || hits(b, a);
}