import { MAX_TEAM_SIZE } from "@/app/(main)/compare/page";

export type CompareMode = "1v1" | "team" | "bracket";

export function parseIdList(raw?: string | string[] | null): number[] {
    if (!raw) return [];
    const s = Array.isArray(raw) ? raw.join(",") : raw;
    return s
        .split(",")
        .map((x) => Number.parseInt(x.trim(), 10))
        .filter((n) => !Number.isNaN(n))
        .slice(0, MAX_TEAM_SIZE);
}

export function detectMode(params: {
    mode?: string;
    a?: string;
    b?: string;
    id1?: string;
    id2?: string;
    p?: string;
}) {
    if (params.mode === "bracket" || params.p) return "bracket" as const;
    if (params.mode === "team" || params.a || params.b) return "team" as const;
    return "1v1" as const;
}