import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ChemistryResult, computeTeamChemistry } from "./teamChemistry";
import { computeMatchScore, MatchBreakdown, round1 } from "./scoringUtils";
import { STAT_KEYS } from "./radarUtils";

export type TeamAggregate = {
    avg: MatchBreakdown;
    ace: MatchBreakdown;
    aceName: string | null;
    memberCount: number;
    scoresCombined: number;
    powerEstimate: number;
    chemistry: ChemistryResult | null;
    chemistryBoost: number;
    rosterMedian: number;
};

function chemistryBoostFrom(chem: ChemistryResult | null): number {
    if (!chem) return 0;
    const fromScore = ((chem.score || 0) / 100) * 18;
    const fromTeams = ((chem.breakdown?.teams || 0) / 40) * 10;
    const fromPub = ((chem.breakdown?.publisher || 0) / 35) * 4;
    return Math.round((fromScore + fromTeams + fromPub) * 10) / 10;
}

export function aggregateTeamScores(
    entities: CharacterWithJoinTeamUniversePowerEnemies[]
): TeamAggregate {
    const scored = (entities || [])
        .map((e) => ({ entity: e, score: computeMatchScore(e) }))
        .filter(
            (x): x is { entity: (typeof entities)[0]; score: MatchBreakdown } =>
                x?.score != null && !isNaN(x.score.overall)
        );

    const avg: MatchBreakdown = {
        averagePowerStats: 0,
        tier: 0,
        class: 0,
        powers: 0,
        threat: 0,
        weaknessPenalty: 0,
        overall: 0,
    };

    if (!scored.length) {
        return {
            avg,
            ace: {
                averagePowerStats: 0,
                tier: 0,
                class: 0,
                powers: 0,
                threat: 0,
                weaknessPenalty: 0,
                overall: 0,
            },
            aceName: null,
            memberCount: 0,
            scoresCombined: 0,
            powerEstimate: 0,
            chemistry: null,
            chemistryBoost: 0,
            rosterMedian: 0,
        };
    }

    const n = scored.length;
    const keys = [
        "averagePowerStats",
        "tier",
        "class",
        "powers",
        "threat",
        "weaknessPenalty",
        "overall",
    ] as const;

    for (const k of keys) {
        avg[k] = round1(
            scored.reduce((s, x) => s + (Number(x.score[k]) || 0), 0) / n
        );
    }

    const best = scored.reduce((a, b) =>
        (b.score.overall || 0) > (a.score.overall || 0) ? b : a
    );

    const overalls = scored
        .map((x) => Number(x.score.overall) || 0)
        .sort((a, b) => a - b);
    const scoresCombined = round1(overalls.reduce((s, o) => s + o, 0));

    // Safe Median Calculation
    let rosterMedian = 0;
    if (overalls.length > 0) {
        const mid = Math.floor(overalls.length / 2);
        rosterMedian =
            overalls.length % 2 !== 0
                ? overalls[mid]
                : (overalls[mid - 1] + overalls[mid]) / 2;
    }

    const chemistry = computeTeamChemistry(entities);
    const chemistryBoost = round1(chemistryBoostFrom(chemistry));

    // The Weighted Squad Matrix Model:
    // 65% Ace Ceiling + 35% Squad Median Depth + Chemistry Synergy
    const weightedMatrixScore =
        (best.score.overall || 0) * 0.65 + (rosterMedian || 0) * 0.35;
    const powerEstimate = round1(weightedMatrixScore + chemistryBoost);

    return {
        avg,
        ace: best.score,
        aceName: best.entity?.name || null,
        memberCount: n,
        scoresCombined,
        powerEstimate: isNaN(powerEstimate) ? 0 : powerEstimate,
        chemistry,
        chemistryBoost: isNaN(chemistryBoost) ? 0 : chemistryBoost,
        rosterMedian: round1(isNaN(rosterMedian) ? 0 : rosterMedian),
    };
}

export function avgTeamPowerstats(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    const out: Record<string, number> = {};
    for (const k of STAT_KEYS) {
        const vals = (entities || []).map((e) => Number(e.powerstats?.[k]) || 0);
        out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    return out;
}