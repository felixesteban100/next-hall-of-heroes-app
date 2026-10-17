import type { CharacterWithJoinTeamUniversePowerEnemies, Team, Universe } from "@/types";
import { getPowerNames, getTeamNames } from "@/lib/compare/compare_utls"; // your paths

function publisherName(c: CharacterWithJoinTeamUniversePowerEnemies) {
    const p: Universe = c.biography?.publisher;
    return (typeof p === "string" ? p : p?.name)?.trim() || "";
}

/** 0–1: average pairwise same-publisher */
function publisherCohesion(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    if (entities.length < 2) return 0;
    let pairs = 0;
    let same = 0;
    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            pairs++;
            const a = publisherName(entities[i]);
            const b = publisherName(entities[j]);
            if (a && b && a === b) same++;
        }
    }
    return pairs ? same / pairs : 0;
}

/** Unique team names shared by ≥2 members */
function sharedTeamCount(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const map = new Map<string, number>();
    for (const e of entities) {
        for (const t of new Set(getTeamNames(e.connections?.groupAffiliation))) {
            if (!t) continue;
            map.set(t, (map.get(t) || 0) + 1);
        }
    }
    let shared = 0;
    for (const n of map.values()) if (n >= 2) shared++;
    return shared;
}

/** Power names on ≥2 members (synergy through overlap) */
function sharedPowerCount(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const map = new Map<string, number>();
    for (const e of entities) {
        for (const p of new Set(getPowerNames(e.powers))) {
            if (!p) continue;
            map.set(p, (map.get(p) || 0) + 1);
        }
    }
    let shared = 0;
    for (const n of map.values()) if (n >= 2) shared++;
    return shared;
}

/**
 * Soft “coverage”: distinct power count across roster (diminishing).
 * Encourages complementary kits without requiring a tag taxonomy.
 */
function powerCoverageScore(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const set = new Set<string>();
    for (const e of entities) {
        for (const p of getPowerNames(e.powers)) if (p) set.add(p);
    }
    // 8 distinct powers → ~1.0, with soft cap
    return Math.min(1, set.size / 8);
}

export type ChemistryResult = {
    /** 0–100 */
    score: number;
    breakdown: {
        publisher: number; // 0–35
        teams: number;     // 0–40
        powers: number;    // 0–25
    };
    notes: string[];
};

export function computeTeamChemistry(
    entities: CharacterWithJoinTeamUniversePowerEnemies[]
): ChemistryResult | null {
    if (entities.length < 2) return null;

    const pub = publisherCohesion(entities); // 0–1
    const teamN = sharedTeamCount(entities);
    const powN = sharedPowerCount(entities);
    const cover = powerCoverageScore(entities);

    // Map to points
    const publisherPts = Math.round(pub * 35);
    // 1 shared team ≈ 12 pts, soft cap 40
    const teamsPts = Math.min(40, Math.round(teamN * 12 + (teamN > 0 ? 4 : 0)));
    // shared powers + coverage
    const powersPts = Math.min(
        25,
        Math.round(Math.min(powN, 5) * 3 + cover * 10)
    );

    const score = Math.min(100,/*  publisherPts +  */teamsPts/*  + powersPts */);

    const notes: string[] = [];
    if (pub >= 0.99) notes.push("Same publisher");
    else if (pub >= 0.5) notes.push("Mostly same publisher");
    if (teamN > 0) notes.push(`${teamN} shared team${teamN > 1 ? "s" : ""}`);
    if (powN > 0) notes.push(`${powN} overlapping power${powN > 1 ? "s" : ""}`);
    if (cover >= 0.75) notes.push("Wide power coverage");

    return {
        score,
        breakdown: { publisher: publisherPts, teams: teamsPts, powers: powersPts },
        notes,
    };
}


export function getTacticalInsight(aName: string, bName: string, diff: number, leader: string, underdog: string) {
    if (diff < 5) {
        const deadlockTemplates = [
            `Deadlock Matchup: ${aName} and ${bName} are neck-and-neck. Victory rests entirely on clutch triggers, positioning, and team synergy.`,
            `Razor-Thin Margin: Neither side holds a clear stat advantage. Expect a brutal, high-attrition brawl where split-second decisions decide the winner.`,
            `Stalemate Warning: Power parity is absolute between ${aName} and ${bName}. Superior synergy or favorable RNG will tip the scales.`
        ];
        return deadlockTemplates[Math.floor(Math.random() * deadlockTemplates.length)];
    }

    if (diff > 15) {
        const blowoutTemplates = [
            `Overwhelming Mismatch: ${leader} completely outclasses ${underdog} in raw stat density. Expect a swift, decisive victory.`,
            `Tier Gap Detected: ${leader}'s sheer combat ceiling leaves ${underdog} fighting an uphill battle just to stay on the board.`,
            `Dominant Roster Advantage: ${leader} commands a massive +${diff.toFixed(1)} power lead, heavily suppressing ${underdog}'s win conditions.`
        ];
        return blowoutTemplates[Math.floor(Math.random() * blowoutTemplates.length)];
    }

    // Standard variable gap
    const standardTemplates = [
        `${leader} holds a +${diff.toFixed(1)} power differential over ${underdog}, leveraging superior stat density to dictate the pace.`,
        `Tactical Edge: ${leader}'s balanced build gives them a measurable advantage in extended skirmishes against ${underdog}.`,
        `Stat Superiority: ${leader} edges out ${underdog} by +${diff.toFixed(1)} points, translating into consistent round pressure.`
    ];
    return standardTemplates[Math.floor(Math.random() * standardTemplates.length)];
};