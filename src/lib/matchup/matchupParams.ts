
export type MatchMode = "matchup" | "bracket";

export function parseIdList(raw?: string | string[] | null): number[] {
    if (!raw) return [];
    const s = Array.isArray(raw) ? raw.join(",") : raw;
    return s
        .split(",")
        .map((x) => Number.parseInt(x.trim(), 10))
        .filter((n) => !Number.isNaN(n))
    // .slice(0, MAX_TEAM_SIZE);
}