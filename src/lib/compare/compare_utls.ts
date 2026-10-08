import { CLASS_SCORE, POWER_TIER_SCORE, TIER_SCORE } from "@/lib/constants";
import type { CharacterWithJoinTeamUniversePowerEnemies, Team, Universe } from "@/types";
import { getCharacterAlignmentText, getCharacterAlignmentTextColor, getCharacterGenderIcon, getCharacterGenderTextColor, getCharacterRaceIcon } from "../character_utils";
import type { LucideIcon } from "lucide-react";
import {
    CHARACTER_TIER,
    CHARACTER_TIER_COLOR,
    CHARACTER_TIER_ICON,
    CHARACTER_CLASS,
    CHARACTER_CLASS_COLOR,
    CHARACTER_CLASS_ICON,
} from "@/lib/constants";
import { getAligmentIcon } from "../characters_utils"; // your paths

const STAT_KEYS = [
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
    "total"
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
) {
    return STAT_KEYS.map((key) => ({
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

export const getAlignmentNames = (powers: any) => {
    if (!powers || !Array.isArray(powers)) return [];
    return powers.map((p) => (getCharacterAlignmentText(typeof p === "string" ? p : p.name || p.value)));
};

export type TeamAggregate = {
    /** Mean of member overalls */
    avg: MatchBreakdown;
    /** Strongest member's breakdown */
    ace: MatchBreakdown;
    /** Character that produced ace */
    aceName: string | null;
    memberCount: number;
};

export function aggregateTeamScores(
    entities: CharacterWithJoinTeamUniversePowerEnemies[]
): TeamAggregate | null {
    const scored = entities
        .map((e) => ({ entity: e, score: computeMatchScore(e) }))
        .filter((x): x is { entity: typeof entities[0]; score: MatchBreakdown } =>
            x.score != null
        );

    if (!scored.length) return null;

    const n = scored.length;
    const keys = [
        "combat",
        "tier",
        "class",
        "powers",
        "threat",
        "weaknessPenalty",
        "overall",
    ] as const;

    const avg = {} as MatchBreakdown;
    for (const k of keys) {
        avg[k] =
            Math.round(
                (scored.reduce((s, x) => s + Number(x.score[k] ?? 0), 0) / n) * 10
            ) / 10;
    }

    const best = scored.reduce((a, b) =>
        b.score.overall > a.score.overall ? b : a
    );

    return {
        avg,
        ace: best.score,
        aceName: best.entity.name,
        memberCount: n,
    };
}

// powerstats average for radar / RowScoreComparer
export function avgPowerstats(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const out: Record<string, number> = {};
    for (const k of STAT_KEYS) {
        const vals = entities.map((e) => Number(e.powerstats?.[k]) || 0);
        out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    return out;
}

export type SharedItem = {
    name: string;
    /** Characters on this side who have it */
    members: { id: number; name: string }[];
};

export type GroupedItems = {
    shared: SharedItem[];
    byCharacter: { id: number; name: string; items: string[] }[];
};
/**
 * itemsForEntity: returns the string list for one character
 * sharedThreshold: 2 = on at least two members; use entities.length for "everyone"
 */
export function groupItemsByCharacter(
    entities: CharacterWithJoinTeamUniversePowerEnemies[],
    itemsForEntity: (e: CharacterWithJoinTeamUniversePowerEnemies) => string[],
    sharedThreshold = 2
): GroupedItems {
    if (!entities.length) {
        return { shared: [], byCharacter: [] };
    }

    const idToName = new Map(entities.map((e) => [e.id, e.name]));

    // item → set of character ids
    const itemToChars = new Map<string, Set<number>>();

    for (const e of entities) {
        for (const item of new Set(itemsForEntity(e).filter(Boolean))) {
            if (!itemToChars.has(item)) itemToChars.set(item, new Set());
            itemToChars.get(item)!.add(e.id);
        }
    }

    const shared: SharedItem[] = [];
    for (const [name, ids] of itemToChars) {
        if (ids.size >= sharedThreshold) {
            shared.push({
                name,
                members: [...ids]
                    .map((id) => ({ id, name: idToName.get(id) ?? String(id) }))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }
    shared.sort((a, b) => a.name.localeCompare(b.name));

    const sharedNames = new Set(shared.map((s) => s.name));

    const byCharacter = entities.map((e) => {
        const all = [...new Set(itemsForEntity(e).filter(Boolean))];
        return {
            id: e.id,
            name: e.name,
            items: all
                .filter((x) => !sharedNames.has(x))
                .sort((a, b) => a.localeCompare(b)),
        };
    });

    return { shared, byCharacter };
}

// Thin wrappers (optional)
export function groupPowers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) => getPowerNames(e.powers));
}

export function groupWeaknesses(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) => e.weaknesses || []);
}

export function groupEnemies(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) =>
        getEnemyNames(e.connections?.enemies)
    );
}

export function groupTeams(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) =>
        getTeamNames(e.connections?.groupAffiliation)
    );
}


/* 
*
*
* 
* 
 
*/

export type BadgeMeta = {
    /** Grouping key — must be stable (e.g. "tier:4", "class:5", "align:good", "pub:DC Comics") */
    key: string;
    value: string;
    className?: string;
    icon?: LucideIcon | null;
    imageSrc?: string | null;
    imageAlt?: string;
};

export type SharedBadge = BadgeMeta & {
    members: { id: number; name: string }[];
};

export type GroupedBadges = {
    shared: SharedBadge[];
    byCharacter: {
        id: number;
        name: string;
        items: BadgeMeta[];
    }[];
};

export function groupBadgesByCharacter(
    entities: CharacterWithJoinTeamUniversePowerEnemies[],
    metaForEntity: (e: CharacterWithJoinTeamUniversePowerEnemies) => BadgeMeta | null,
    sharedThreshold = 2
): GroupedBadges {
    if (!entities.length) return { shared: [], byCharacter: [] };

    // key → { meta, member ids }
    const map = new Map<string, { meta: BadgeMeta; ids: Set<number> }>();

    for (const e of entities) {
        const meta = metaForEntity(e);
        if (!meta?.key) continue;
        const cur = map.get(meta.key);
        if (!cur) {
            map.set(meta.key, { meta, ids: new Set([e.id]) });
        } else {
            cur.ids.add(e.id);
        }
    }

    const idToName = new Map(entities.map((e) => [e.id, e.name]));

    const shared: SharedBadge[] = [];
    for (const { meta, ids } of map.values()) {
        if (ids.size >= sharedThreshold) {
            shared.push({
                ...meta,
                members: [...ids]
                    .map((id) => ({ id, name: idToName.get(id) ?? String(id) }))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }
    shared.sort((a, b) => a.value.localeCompare(b.value));

    const sharedKeys = new Set(shared.map((s) => s.key));

    const byCharacter = entities.map((e) => {
        const meta = metaForEntity(e);
        const items =
            meta && !sharedKeys.has(meta.key) ? [meta] : [];
        return { id: e.id, name: e.name, items };
    });

    return { shared, byCharacter };
}

export function groupGenders(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.appearance.gender;
        return {
            key: `gender:${a ?? "unknown"}`,
            value: a,
            className: getCharacterGenderTextColor(a),
            icon: getCharacterGenderIcon(a),
        };
    });
}

export function groupRaces(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.appearance.race;
        return {
            key: `race:${a ?? "unknown"}`,
            value: a ?? "unknown",
            className: "",
            icon: getCharacterRaceIcon(a),
        };
    });
}

export function groupTiers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const tier = c.tier as keyof typeof CHARACTER_TIER;
        return {
            key: `tier:${c.tier}`,
            value: CHARACTER_TIER[tier] ?? "N/A",
            className: CHARACTER_TIER_COLOR[tier]?.text,
            icon: CHARACTER_TIER_ICON[tier],
        };
    });
}

export function groupClasses(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const cls = c.class as keyof typeof CHARACTER_CLASS;
        return {
            key: `class:${c.class}`,
            value: CHARACTER_CLASS[cls] ?? "N/A",
            className: CHARACTER_CLASS_COLOR[cls]?.text,
            icon: CHARACTER_CLASS_ICON[cls],
        };
    });
}

export function groupAlignments(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.biography?.alignment;
        return {
            key: `align:${a ?? "unknown"}`,
            value: getCharacterAlignmentText(a),
            className: getCharacterAlignmentTextColor(a),
            icon: getAligmentIcon(a),
        };
    });
}

export function groupPublishers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const p: Universe = c.biography?.publisher;
        const name = typeof p === "string" ? p : p?.name ?? "Unknown";
        const logo = typeof p === "object" ? p?.logo : undefined;
        return {
            key: `pub:${name}`,
            value: name,
            imageSrc: logo || "/placeholder.png",
            imageAlt: name,
        };
    });
}