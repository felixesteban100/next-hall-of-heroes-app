
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

export function detectMode(params: {
    mode?: string;
    a?: string;
    b?: string;
    id1?: string;
    id2?: string;
    p?: string;
}): MatchMode {
    if (params.mode === "bracket" || params.p) return "bracket" as const;
    return "matchup" as const;
}