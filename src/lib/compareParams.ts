import { MAX_TEAM_SIZE } from "@/app/(main)/compare/page";

// lib/compareParams.ts
export type CompareMode = "1v1" | "team";

export function parseIdList(raw?: string | string[]): number[] {
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
    id1?: string;
    id2?: string;
    a?: string;
    b?: string;
}): CompareMode {
    if (params.mode === "team") return "team";
    if (params.a != null || params.b != null) return "team";
    return "1v1";
}