import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import type { PointRadar } from "@/components/compare/stats/StatRadar";

export const STAT_KEYS = [
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
    "total"
] as const;

export function radarData(
    a: CharacterWithJoinTeamUniversePowerEnemies | null,
    b: CharacterWithJoinTeamUniversePowerEnemies | null
) {
    return STAT_KEYS.map((key) => ({
        stat: key.slice(0, 3).toUpperCase(), // INT, STR, ...
        full: key,
        A: a ? Math.min(100, Number(a.powerstats?.[key]) || 0) : 0,
        B: b ? Math.min(100, Number(b.powerstats?.[key]) || 0) : 0,
    }));
}

export function radarDataFromStats(
    statsA: Record<string, number> | null | undefined,
    statsB: Record<string, number> | null | undefined
): PointRadar[] {
    return STAT_KEYS.map((key) => ({
        stat: key.slice(0, 3).toUpperCase(),
        full: key,
        A: Math.min(100, Number(statsA?.[key]?.toFixed(2)) || 0),
        B: Math.min(100, Number(statsB?.[key]?.toFixed(2)) || 0),
    }));
}