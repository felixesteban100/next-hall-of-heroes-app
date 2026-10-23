import { CLASS_SCORE, POWER_TIER_SCORE, TIER_SCORE } from "@/lib/constants";
import type { Character, CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ROUNDS } from "@/components/compare/battle/BattlePanel";

export type MatchBreakdown = {
    averagePowerStats: number;
    tier: number;
    class: number;
    powers: number;
    threat: number;
    weaknessPenalty: number;
    overall: number;
};

export function round1(n: number) {
    return Math.round(n * 10) / 10;
}

function scorePowers(powers: unknown): number {
    if (!Array.isArray(powers) || powers.length === 0) return 0;

    let raw = 0;
    for (const p of powers) {
        if (p && typeof p === "object" && "isFallback" in p && (p as { isFallback?: boolean }).isFallback) {
            raw += 6;
            continue;
        }

        const power = p as { score?: number; tier?: number };
        const score = Math.min(100, Number(power.score) || 0);
        const tierPts = POWER_TIER_SCORE[Number(power.tier) || 0] ?? 5;

        raw += score * 0.55 + tierPts * 0.45;
    }

    const diminished = raw / (1 + powers.length * 0.07);
    return Math.min(100, diminished);
}

function scoreWeaknessPenalty(weaknesses?: string[]): number {
    const n = weaknesses?.filter((w) => w?.trim()).length ?? 0;
    return Math.min(15, n * 3);
}

function scoreThreat(
    entity: CharacterWithJoinTeamUniversePowerEnemies | Character
): number {
    const enemies = entity.connections?.enemies;
    const count = Array.isArray(enemies) ? enemies.length : 0;
    return Math.min(100, count * 12.5);
}

export function computeMatchScore(
    entity: CharacterWithJoinTeamUniversePowerEnemies | Character
): MatchBreakdown {
    if (entity == null) {
        return {
            averagePowerStats: 0,
            tier: 0,
            class: 0,
            powers: 0,
            threat: 0,
            weaknessPenalty: 0,
            overall: 0,
        };
    }
    const averagePowerStats = entity.powerstats.total;
    const tier = TIER_SCORE[entity.tier ?? 0] ?? 5;
    const cls = CLASS_SCORE[entity.class ?? 0] ?? 10;
    const powers = scorePowers(entity.powers);
    const threat = scoreThreat(entity);
    const weaknessPenalty = scoreWeaknessPenalty(entity.weaknesses);

    const overall = Math.max(
        0,
        Math.min(
            100,
            averagePowerStats * 0.35 +
            tier * 0.22 +
            cls * 0.08 +
            powers * 0.25 +
            threat * 0.1 -
            weaknessPenalty
        )
    );

    return {
        averagePowerStats: round1(averagePowerStats),
        tier: round1(tier),
        class: round1(cls),
        powers: round1(powers),
        threat: round1(threat),
        weaknessPenalty: round1(weaknessPenalty),
        overall: round1(overall),
    };
}

export function simulateSpar(scoreA: number, scoreB: number, rounds = ROUNDS) {
    let aWins = 0;
    let bWins = 0;
    let draws = 0;

    const avgScore = (scoreA + scoreB) / 2;
    const varianceScale = Math.max(0.05, 0.15 * (100 / Math.max(avgScore, 50)));

    for (let i = 0; i < rounds; i++) {
        const jitterA = scoreA * (1 + (Math.random() * (varianceScale * 2) - varianceScale));
        const jitterB = scoreB * (1 + (Math.random() * (varianceScale * 2) - varianceScale));

        const d = jitterA - jitterB;
        const maxVal = Math.max(jitterA, jitterB, 1);
        const pct = Math.abs(d) / maxVal;

        if (pct < 0.06) {
            draws++;
        } else if (jitterA > jitterB) {
            aWins++;
        } else {
            bWins++;
        }
    }

    return {
        aWins,
        bWins,
        draws,
        aWinPct: Math.round((aWins / rounds) * 100),
        bWinPct: Math.round((bWins / rounds) * 100),
        drawPct: Math.round((draws / rounds) * 100),
    };
}