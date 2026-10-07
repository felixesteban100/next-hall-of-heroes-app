import { CLASS_SCORE, POWER_TIER_SCORE, TIER_SCORE } from "@/lib/constants";
import type { CharacterWithJoinTeamUniversePowerEnemies, Universe } from "@/types";

const STAT_KEYS = [
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
] as const;

export type MatchBreakdown = {
    combat: number;
    tier: number;
    class: number;
    powers: number;
    threat: number;
    weaknessPenalty: number;
    overall: number;
};

function round1(n: number) {
    return Math.round(n * 10) / 10;
}

function scoreCombat(
    stats?: CharacterWithJoinTeamUniversePowerEnemies["powerstats"]
): number {
    if (!stats) return 0;
    const vals = STAT_KEYS.map((k) => Math.min(100, Number(stats[k]) || 0));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function scorePowers(powers: unknown): number {
    if (!Array.isArray(powers) || powers.length === 0) return 0;

    let raw = 0;
    for (const p of powers) {
        // Fallback / external power
        if (p && typeof p === "object" && "isFallback" in p && (p as { isFallback?: boolean }).isFallback) {
            raw += 6; // small but visible credit
            continue;
        }

        const power = p as { score?: number; tier?: number };
        const score = Math.min(100, Number(power.score) || 0);
        const tierPts = POWER_TIER_SCORE[Number(power.tier) || 0] ?? 5;

        // Blend: database score + power-tier ladder
        // (tier matters more at the high end; score fills in nuance)
        raw += score * 0.55 + tierPts * 0.45;
    }

    // Diminishing returns on long power lists
    const diminished = raw / (1 + powers.length * 0.07);
    return Math.min(100, diminished);
}

function scoreWeaknessPenalty(weaknesses?: string[]): number {
    const n = weaknesses?.filter((w) => w?.trim()).length ?? 0;
    return Math.min(15, n * 3); // −3 each, cap −15
}

function scoreThreat(
    entity: CharacterWithJoinTeamUniversePowerEnemies
): number {
    const enemies = entity.connections?.enemies;
    const count = Array.isArray(enemies) ? enemies.length : 0;
    // Up to ~8 notable enemies → 100
    return Math.min(100, count * 12.5);
}

export function computeMatchScore(
    entity: CharacterWithJoinTeamUniversePowerEnemies | null | undefined
): MatchBreakdown | null {
    if (!entity) return null;

    const combat = scoreCombat(entity.powerstats);
    const tier = TIER_SCORE[entity.tier ?? 0] ?? 5;
    const cls = CLASS_SCORE[entity.class ?? 0] ?? 10;
    const powers = scorePowers(entity.powers);
    const threat = scoreThreat(entity);
    const weaknessPenalty = scoreWeaknessPenalty(entity.weaknesses);

    const overall = Math.max(
        0,
        Math.min(
            100,
            combat * 0.35 +
            tier * 0.22 +
            cls * 0.08 +
            powers * 0.25 +
            threat * 0.1 -
            weaknessPenalty
        )
    );

    return {
        combat: round1(combat),
        tier: round1(tier),
        class: round1(cls),
        powers: round1(powers),
        threat: round1(threat),
        weaknessPenalty: round1(weaknessPenalty),
        overall: round1(overall),
    };
}

/** Compare two sides for UI badges */
export function compareMatchScores(
    a: MatchBreakdown | null,
    b: MatchBreakdown | null
): {
    winner: "a" | "b" | "tie" | "none";
    diff: number;
    label: string;
} {
    if (!a && !b) return { winner: "none", diff: 0, label: "Select characters" };
    if (a && !b) return { winner: "a", diff: a.overall, label: "Only Character A scored" };
    // if (a && !b) return { winner: "a", diff: a.overall, label: "Only Entity A scored" };
    if (!a && b) return { winner: "b", diff: b.overall, label: "Only Character B scored" };
    // if (!a && b) return { winner: "b", diff: b.overall, label: "Only Entity B scored" };

    const diff = round1(a!.overall - b!.overall);
    if (Math.abs(diff) < 3) {
        return { winner: "tie", diff, label: "Too close to call" };
    }
    if (diff > 0) {
        // return { winner: "a", diff, label: `Entity A edge +${diff}` };
        return { winner: "a", diff, label: `Character A edge +${diff}` };
    }
    return { winner: "b", diff: Math.abs(diff), label: `Character B edge +${Math.abs(diff)}` };
}

export function hasNemesisLink(
    a: CharacterWithJoinTeamUniversePowerEnemies,
    b: CharacterWithJoinTeamUniversePowerEnemies
): boolean {
    const list = (entity: CharacterWithJoinTeamUniversePowerEnemies) =>
        entity.connections?.enemies ?? [];

    const hits = (
        source: CharacterWithJoinTeamUniversePowerEnemies,
        target: CharacterWithJoinTeamUniversePowerEnemies
    ) =>
        list(source).some((e) => {
            if (!e || typeof e !== "object") return false;
            const id = "id" in e ? Number(e.id) : NaN;
            const name = "name" in e ? String((e as { name: string }).name) : "";
            return id === target.id || (name && name === target.name);
        });

    return hits(a, b) || hits(b, a);
}

/** Toy spar: probability A wins ≈ logistic of overall difference */
export function simulateSpar(
    scoreA: number,
    scoreB: number,
    trials = 100
): { aWins: number; bWins: number; draws: number; aWinPct: number } {
    const diff = scoreA - scoreB;
    // sigmoid → P(A wins a round)
    const pA = 1 / (1 + Math.exp(-diff / 8));
    let aWins = 0;
    let bWins = 0;
    let draws = 0;

    for (let i = 0; i < trials; i++) {
        const r = Math.random();
        if (Math.abs(scoreA - scoreB) < 2 && Math.random() < 0.15) {
            draws++;
        } else if (r < pA) {
            aWins++;
        } else {
            bWins++;
        }
    }

    return {
        aWins,
        bWins,
        draws,
        aWinPct: Math.round((aWins / trials) * 1000) / 10,
    };
}

export const STAT_KEYS_RADAR = [
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
] as const;

export function radarData(
    a: CharacterWithJoinTeamUniversePowerEnemies | null,
    b: CharacterWithJoinTeamUniversePowerEnemies | null
) {
    return STAT_KEYS_RADAR.map((key) => ({
        stat: key.slice(0, 3).toUpperCase(), // INT, STR, ...
        full: key,
        A: a ? Math.min(100, Number(a.powerstats?.[key]) || 0) : 0,
        B: b ? Math.min(100, Number(b.powerstats?.[key]) || 0) : 0,
    }));
}

export function radarDataFromStats(
    statsA: Record<string, number> | null | undefined,
    statsB: Record<string, number> | null | undefined
) {
    return STAT_KEYS_RADAR.map((key) => ({
        stat: key.slice(0, 3).toUpperCase(),
        full: key,
        A: Math.min(100, Number(statsA?.[key]) || 0),
        B: Math.min(100, Number(statsB?.[key]) || 0),
    }));
}

// Helper to extract team names from groupAffiliation array
export const getTeamNames = (teams: any) => {
    if (!teams || !Array.isArray(teams)) return [];
    return teams.map((t) => (typeof t === "string" ? t : t.name || t.value));
};

// Helper to extract enemy names from enemies array
export const getEnemyNames = (enemies: any) => {
    if (!enemies || !Array.isArray(enemies)) return [];
    return enemies.map((e) => (typeof e === "string" ? e : e.name));
};

// Helper to extract power names from powers array
export const getPowerNames = (powers: any) => {
    if (!powers || !Array.isArray(powers)) return [];
    return powers.map((p) => (typeof p === "string" ? p : p.name || p.value));
};

// Helper to safely get publisher string
export const getPublisher = (pub: any) => {
    if (!pub) return "N/A";
    if (typeof pub === "string") return pub;
    return pub.name || pub.value || "N/A";
};


export function aggregateScores(
    entities: CharacterWithJoinTeamUniversePowerEnemies[]
): MatchBreakdown | null {
    const scores = entities.map(computeMatchScore).filter(Boolean) as MatchBreakdown[];
    if (!scores.length) return null;

    const avg = (key: keyof MatchBreakdown) =>
        scores.reduce((s, x) => s + Number(x[key]), 0) / scores.length;

    return {
        combat: round1(avg("combat")),
        tier: round1(avg("tier")),
        class: round1(avg("class")),
        powers: round1(avg("powers")),
        threat: round1(avg("threat")),
        weaknessPenalty: round1(avg("weaknessPenalty")),
        overall: round1(avg("overall")),
    };
}

// powerstats average for radar / RowScoreComparer
export function avgPowerstats(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const keys = ["intelligence", "strength", "speed", "durability", "power", "combat", "total"] as const;
    const out: Record<string, number> = {};
    for (const k of keys) {
        const vals = entities.map((e) => Number(e.powerstats?.[k]) || 0);
        out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    return out;
}

export function maxTier(entities: { tier?: number }[]) {
    if (!entities.length) return null;
    return Math.max(...entities.map((e) => e.tier ?? 0));
}

export function maxClass(entities: { class?: number }[]) {
    if (!entities.length) return null;
    return Math.max(...entities.map((e) => e.class ?? 0));
}

export function uniquePublishers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const map = new Map<string, { name: string; logo?: string }>();
    for (const e of entities) {
        const p: Universe = e.biography?.publisher;
        const name = typeof p === "string" ? p : p?.name;
        if (!name) continue;
        if (!map.has(name)) {
            map.set(name, {
                name,
                logo: typeof p === "object" ? p?.logo : undefined,
            });
        }
    }
    return [...map.values()];
}

export function joinUnique(values: (string | undefined | null)[]) {
    return [...new Set(values.map((v) => v?.trim()).filter(Boolean) as string[])].join(" · ") || undefined;
}

export function mergePowerNames(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return [...new Set(entities.flatMap((e) => getPowerNames(e.powers)))];
}

export function mergeWeaknesses(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return [...new Set(entities.flatMap((e) => e.weaknesses || []))];
}

export function mergeTeams(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return [...new Set(entities.flatMap((e) => getTeamNames(e.connections?.groupAffiliation)))];
}

export function mergeEnemies(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return [...new Set(entities.flatMap((e) => getEnemyNames(e.connections?.enemies)))];
}