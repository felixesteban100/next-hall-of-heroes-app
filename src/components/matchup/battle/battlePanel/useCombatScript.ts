import { useCallback } from "react";
import { Skull, Trophy, HeartPulse, RefreshCw, Lock, HandFist, Shield } from "lucide-react";
import { computeMatchScore } from "@/lib/matchup";

import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole, Power, FallbackItem } from "@/types";
import { isRealPower } from "@/lib/matchup/cinematicCombatView";

const REVIVAL_HP_PERCENTAGE = 0.45; // 45% of maxHp
const HEALING_HP_PERCENTAGE = 0.25; // 25% of maxHp

// ── Shared types (imported by hooks, CombatView, LiveRosterStatus, etc.) ─────
export type LogType = "attack" | "heal" | "defend" | "revive" | "ko" | "finish" | "rout";

export type Log = {
    id: number;
    type: LogType;
    attackerName?: string;
    defenderName?: string;
    powerName?: string;
    actionName?: string;
    text: string;
    icon: any;
    colorClass: string;
    variant: "primary" | "secondary";
    isKO?: boolean;
    damage?: number;
    healing?: number;
};

export type FighterState = {
    name: string;
    overall: number;
    isAlive: boolean;
    image: string;
    powers?: (Power | FallbackItem)[];
    hasRevived?: boolean;
    imageFocus: string;
    maxHp: number;
    currentHp: number;
};

export interface ScriptItem {
    targetTeam: "A" | "B";
    targetName?: string;
    isKO?: boolean;
    isRevive?: boolean;
    isHeal?: boolean;
    healTeam?: "A" | "B";
    isFinish?: boolean;
    isDefend?: boolean;
    damage?: number;
    log: Log;
}

// ── Telemetry per fighter ─────────────────────────────────────────────────────
export type FighterTelemetry = {
    name: string;
    // Offense
    attacksLanded: number;
    damageDealt: number;
    // Defense
    damageBlocked: number;
    hitsTaken: number;
    damageTaken: number;
    // Support
    revivals: number;
    healingDone: number;
    // Derived (computed at finalization)
    accuracy: number;        // attacksLanded / (attacksLanded + blocked against them) — 0–100
    survivalRate: number;    // (maxHp - damageTaken) / maxHp — 0–100 (clamped)
    efficiency: number;      // damageDealt / Math.max(1, damageTaken) — scaled to 0–100
    kos: number;             // enemies knocked out by this fighter
};

export type BattleMetadata = {
    totalRounds: number;
    totalKoCount: number;
    winnerPowerAvg: number;
    winType: string;
    dominance: number;        // 0–100: how lopsided the win was
    teamAPowerAvg: number;
    teamBPowerAvg: number;
    // Per-fighter telemetry by team
    teamAStats: FighterTelemetry[];
    teamBStats: FighterTelemetry[];
    // Top performers (pre-computed for display)
    mvpA: FighterTelemetry;
    mvpB: FighterTelemetry;
    wallA: FighterTelemetry;
    wallB: FighterTelemetry;
    strikerA: FighterTelemetry;
    strikerB: FighterTelemetry;
    reviveA: FighterTelemetry;
    reviveB: FighterTelemetry;
    healerA: FighterTelemetry;
    healerB: FighterTelemetry;
    // Extra
    longestStreak: { name: string; streak: number };
    mostDamageSingleHit: { name: string; damage: number };
    totalDamageDealt: number;
    totalHealingDone: number;
    mostKOA: { name: string; kos: number }
    mostKOB: { name: string; kos: number }
};

const ELIMINATION_PHRASES = [
    "was overwhelmed by the sustained pressure!",
    "succumbed to the relentless barrage!",
    "exhausted their energy reserves and collapsed!",
    "could no longer withstand the onslaught!",
    "was breached and knocked out of the engagement!",
];

const DEFEND_PHRASES = [
    "raised a barrier, blocking the brunt of the attack!",
    "stood their ground and absorbed the impact!",
    "countered with a defensive stance, reducing damage!",
    "braced and deflected the strike!",
    "shielded themselves, neutralizing the threat!",
];

function toFighterState(
    c: CharacterWithJoinTeamUniversePowerEnemies,
    fallbackName: string
): FighterState {
    const validPowers = Array.isArray(c.powers) ? c.powers.filter(isRealPower) : [];
    const durability = c.powerstats?.durability ?? 50;
    const maxHp = durability * 2;

    return {
        name: c.name ?? fallbackName,
        image: c.images.md ?? "",
        imageFocus: c.imageFocus ?? "center",
        overall: c.powerstats ? (computeMatchScore(c as any).overall ?? 50) : 50,
        isAlive: true,
        powers: validPowers,
        hasRevived: false,
        maxHp,
        currentHp: maxHp,
    };
}

function clamp(value: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Returns a stable `buildScript` function with full durability-based combat and power-driven damage scaling.
 */
export function useCombatScript(
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[],
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[],
    nameA: string,
    nameB: string,
    aWins: number,
    bWins: number
) {
    const buildScript = useCallback((): {
        script: ScriptItem[];
        initialA: FighterState[];
        initialB: FighterState[];
    } => {
        const initialA = teamAChars.map((c) => toFighterState(c, nameA));
        const initialB = teamBChars.map((c) => toFighterState(c, nameB));

        // ── Telemetry tracker ────────────────────────────────────────────────
        type RawStats = {
            attacksLanded: number;
            damageDealt: number;
            damageBlocked: number;
            hitsTaken: number;
            damageTaken: number;
            revivals: number;
            healingDone: number;
            kos: number;
            maxSingleHit: number;
            streak: number;
            currentStreak: number;
            maxHp: number;
            currentHp: number;
        };
        const statsMap: Record<string, RawStats> = {};
        [...initialA, ...initialB].forEach(c => {
            statsMap[c.name] = {
                attacksLanded: 0, damageDealt: 0, damageBlocked: 0,
                hitsTaken: 0, damageTaken: 0, revivals: 0, healingDone: 0,
                kos: 0, maxSingleHit: 0, streak: 0, currentStreak: 0,
                maxHp: c.maxHp,
                currentHp: c.maxHp,
            };
        });

        if (initialA.length === 0 || initialB.length === 0) {
            return { script: [], initialA, initialB };
        }

        const script: ScriptItem[] = [];
        let timeStep = 1;

        const isTeamAWinner = aWins >= bWins;
        const winnerName = isTeamAWinner ? nameA : nameB;
        const losingTeamTag = isTeamAWinner ? "B" : "A";

        const tempA = initialA.map((c) => ({ ...c }));
        const tempB = initialB.map((c) => ({ ...c }));

        const maxRounds = Math.max(45, (tempA.length + tempB.length) * 4);
        let roundNum = 1;

        // Track last attacker for streak detection
        let lastAttackerName = "";

        while (roundNum <= maxRounds) {
            const activeTempA = tempA.filter((c) => c.isAlive);
            const activeTempB = tempB.filter((c) => c.isAlive);
            if (activeTempA.length === 0 || activeTempB.length === 0) break;

            const isAttackerA = Math.random() < (isTeamAWinner ? 0.62 : 0.38);
            const attackerTeam = isAttackerA ? tempA : tempB;
            const defenderTeam = isAttackerA ? tempB : tempA;
            const defenderTeamTag: "A" | "B" = isAttackerA ? "B" : "A";

            const activeAttackers = attackerTeam.filter((c) => c.isAlive);
            const activeDefenders = defenderTeam.filter((c) => c.isAlive);
            if (activeAttackers.length === 0 || activeDefenders.length === 0) break;

            const attacker = activeAttackers[Math.floor(Math.random() * activeAttackers.length)];
            const defender = activeDefenders[Math.floor(Math.random() * activeDefenders.length)];
            const variant: "primary" | "secondary" = isAttackerA ? "primary" : "secondary";

            // ── Streak tracking ───────────────────────────────────────────────
            if (attacker.name === lastAttackerName) {
                if (statsMap[attacker.name]) statsMap[attacker.name].currentStreak++;
            } else {
                if (lastAttackerName && statsMap[lastAttackerName]) {
                    const prev = statsMap[lastAttackerName];
                    prev.streak = Math.max(prev.streak, prev.currentStreak);
                    prev.currentStreak = 0;
                }
                lastAttackerName = attacker.name;
                if (statsMap[attacker.name]) statsMap[attacker.name].currentStreak = 1;
            }

            // ── 1. Healing / Regeneration / Passive Check ────────────────────
            const allAttackerPowers = Array.isArray(attacker.powers) ? attacker.powers.filter(isRealPower) : [];
            const healingPowers = allAttackerPowers.filter((p) => {
                const txt = `${p.name ?? ""} ${p.description ?? ""} ${p.combatRole ?? ""}`.toLowerCase();
                return txt.includes("heal") || txt.includes("regenerat") || txt.includes("recovery") || txt.includes("health") || txt.includes("factor");
            });

            if (healingPowers.length > 0 && attacker.currentHp < attacker.maxHp && Math.random() < 0.35) {
                const healPower = healingPowers[Math.floor(Math.random() * healingPowers.length)];
                const healAmount = Math.round(attacker.maxHp * HEALING_HP_PERCENTAGE);
                attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
                if (statsMap[attacker.name]) statsMap[attacker.name].healingDone += healAmount;

                script.push({
                    targetTeam: isAttackerA ? "A" : "B",
                    isHeal: true,
                    healTeam: isAttackerA ? "A" : "B",
                    log: {
                        id: timeStep++,
                        type: "heal",
                        attackerName: attacker.name,
                        defenderName: attacker.name,
                        powerName: healPower.name,
                        text: `${attacker.name} triggered [${healPower.name}], restoring ${healAmount} HP (${HEALING_HP_PERCENTAGE * 100}%)!`,
                        icon: HeartPulse,
                        colorClass: "text-emerald-400 font-bold",
                        variant,
                        healing: healAmount,
                    },
                });
                roundNum++;
                continue;
            }

            // ── 2. Offensive Power Filtering ─────────────────────────────────
            const strikingPowers = allAttackerPowers.filter((p) => {
                const role = p.combatRole;
                const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                const isHealOrDefend = txt.includes("heal") || txt.includes("regenerat") || txt.includes("shield") || txt.includes("block");
                return !isHealOrDefend && (role === "Offensive" || role === "Control" || role === "Hybrid / Versatile");
            });

            const pool = strikingPowers.length > 0 ? strikingPowers : allAttackerPowers.filter(p => {
                const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                return !txt.includes("heal") && !txt.includes("regenerat");
            });

            let powerTitle = "Precision Strike";
            let moveName = "Direct Assault";
            let combatRole: PowerRole = "Offensive";

            if (pool.length > 0) {
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                powerTitle = chosen.name ?? "Custom Strike";
                combatRole = chosen.combatRole ?? "Offensive";
                if (Array.isArray(chosen.actions) && chosen.actions.length > 0) {
                    moveName = chosen.actions[Math.floor(Math.random() * chosen.actions.length)].name;
                } else {
                    moveName = powerTitle;
                }
            } else {
                const characterThemes = [
                    "Willpower Construct", "Tactical Onslaught", "Vanguard Strike",
                    "Signature Blitz", "Unrelenting Force", "Power Surge"
                ];
                powerTitle = characterThemes[Math.floor(Math.random() * characterThemes.length)];
                moveName = `${attacker.name}'s Signature Move`;
            }

            let logIcon: any = HandFist;
            if (combatRole === "Control") logIcon = Lock;

            const defenderMaxHp = defender.maxHp || 100;
            const damagePercentage = Math.random() * 0.25 + 0.20;
            const calculatedDamage = Math.max(15, Math.round(defenderMaxHp * damagePercentage));

            const defenderVariant: "primary" | "secondary" = isAttackerA ? "secondary" : "primary";

            // ── 3. Defend Check ───────────────────────────────────────────────
            if (Math.random() < 0.15) {
                const blockPowerName = "Defense";
                const blockedAmount = calculatedDamage;

                if (statsMap[defender.name]) statsMap[defender.name].damageBlocked += blockedAmount;

                const phrase = DEFEND_PHRASES[Math.floor(Math.random() * DEFEND_PHRASES.length)];

                script.push({
                    targetTeam: defenderTeamTag,
                    isDefend: true,
                    damage: 0,
                    log: {
                        id: timeStep++,
                        type: "defend",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: blockPowerName,
                        text: `${defender.name} activated [${blockPowerName}] and ${phrase} Blocked ${blockedAmount} of ${calculatedDamage} damage!`,
                        icon: Shield,
                        colorClass: "text-cyan-400 font-bold",
                        variant: defenderVariant,
                        damage: 0,
                    },
                });

                roundNum++;
                continue;
            }

            // ── Normal hit ────────────────────────────────────────────────────
            defender.currentHp = Math.max(0, defender.currentHp - calculatedDamage);
            statsMap[defender.name].currentHp = defender.currentHp;
            if (statsMap[attacker.name]) {
                statsMap[attacker.name].attacksLanded++;
                statsMap[attacker.name].damageDealt += calculatedDamage;
                statsMap[attacker.name].maxSingleHit = Math.max(statsMap[attacker.name].maxSingleHit, calculatedDamage);
            }
            if (statsMap[defender.name]) {
                statsMap[defender.name].hitsTaken++;
                statsMap[defender.name].damageTaken += calculatedDamage;
            }

            // ── 4. Knockout Evaluation ────────────────────────────────────────
            if (defender.currentHp === 0) {
                defender.isAlive = false;
                statsMap[defender.name].currentHp = 0;
                if (statsMap[attacker.name]) statsMap[attacker.name].kos++;
                const phrase = ELIMINATION_PHRASES[Math.floor(Math.random() * ELIMINATION_PHRASES.length)];

                script.push({
                    targetTeam: defenderTeamTag,
                    targetName: defender.name,
                    isKO: true,
                    damage: calculatedDamage,
                    log: {
                        id: timeStep++,
                        type: "ko",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: powerTitle,
                        actionName: moveName,
                        text: `${defender.name} took ${calculatedDamage} fatal damage from [${powerTitle}] and ${phrase}`,
                        icon: Skull,
                        colorClass: "text-orange-500 font-bold",
                        variant,
                        isKO: true,
                        damage: calculatedDamage,
                    },
                });

                // Revival check
                const revivalPowers = [...allAttackerPowers, ...(Array.isArray(defender.powers) ? defender.powers : [])].filter(isRealPower);
                const revivalPower = revivalPowers.find((p) => {
                    const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                    return txt.includes("immortal") || txt.includes("resurrect") || txt.includes("healing factor") || txt.includes("regeneration") || txt.includes("revive");
                });

                if (!defender.hasRevived && revivalPower && Math.random() < 0.85) {
                    defender.hasRevived = true;
                    defender.isAlive = true;
                    defender.currentHp = Math.round(defender.maxHp * REVIVAL_HP_PERCENTAGE);
                    statsMap[defender.name].currentHp = defender.currentHp;
                    if (statsMap[defender.name]) statsMap[defender.name].revivals++;

                    script.push({
                        targetTeam: defenderTeamTag,
                        targetName: defender.name,
                        isRevive: true,
                        log: {
                            id: timeStep++,
                            type: "revive",
                            attackerName: defender.name,
                            defenderName: defender.name,
                            powerName: revivalPower.name,
                            text: `${defender.name} cheated death using [${revivalPower.name}], resurrecting with ${REVIVAL_HP_PERCENTAGE * 100}% HP!`,
                            icon: RefreshCw,
                            colorClass: "text-purple-400 font-bold",
                            variant,
                            healing: defender.currentHp,
                        },
                    });
                }
            } else {
                script.push({
                    targetTeam: defenderTeamTag,
                    damage: calculatedDamage,
                    log: {
                        id: timeStep++,
                        type: "attack",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: powerTitle,
                        actionName: moveName !== powerTitle ? moveName : undefined,
                        text: `${attacker.name} struck ${defender.name} with [${powerTitle}], dealing ${calculatedDamage} damage!`,
                        icon: logIcon,
                        colorClass: isAttackerA ? "text-primary" : "text-secondary",
                        variant,
                        damage: calculatedDamage,
                    },
                });
            }
            roundNum++;
        }

        // Flush last streak
        if (lastAttackerName && statsMap[lastAttackerName]) {
            const s = statsMap[lastAttackerName];
            s.streak = Math.max(s.streak, s.currentStreak);
        }

        // ── Rout finalization ─────────────────────────────────────────────────
        const losingTeamFinal = isTeamAWinner ? tempB : tempA;
        const remaining = losingTeamFinal.filter((c) => c.isAlive);
        if (remaining.length > 0) {
            remaining.forEach((f) => { f.isAlive = false; f.currentHp = 0; });
            script.push({
                targetTeam: losingTeamTag,
                isKO: true,
                log: {
                    id: timeStep++,
                    type: "rout",
                    text: `${isTeamAWinner ? nameB : nameA}'s remaining roster collapsed as cumulative damage depleted their final HP pools!`,
                    icon: Skull,
                    colorClass: "text-orange-500 font-bold",
                    variant: isTeamAWinner ? "secondary" : "primary",
                },
            });
        }

        // ── Build final telemetry ─────────────────────────────────────────────
        const totalRounds = roundNum - 1;
        const totalKoCount = [...tempA, ...tempB].filter(c => !c.isAlive).length;
        const avgTeamA = Math.round(initialA.reduce((acc, c) => acc + c.overall, 0) / (initialA.length || 1));
        const avgTeamB = Math.round(initialB.reduce((acc, c) => acc + c.overall, 0) / (initialB.length || 1));
        const diff = Math.abs(aWins - bWins);
        const dominance = clamp(Math.round((diff / Math.max(1, aWins + bWins)) * 100));
        const winType = diff > 15 ? "Decisive Wipeout" : diff > 5 ? "Dominant Victory" : "Hard-Fought Victory";

        // const teamANames = new Set(initialA.map(c => c.name));

        // Convert raw stats → FighterTelemetry with derived fields
        // const toTelemetry = (name: string): FighterTelemetry => {
        //     const r = statsMap[name] ?? {
        //         attacksLanded: 0, damageDealt: 0, damageBlocked: 0, hitsTaken: 0,
        //         damageTaken: 0, revivals: 0, healingDone: 0, kos: 0,
        //         maxSingleHit: 0, streak: 0, currentStreak: 0, maxHp: 100,
        //     };
        //     const accuracy = r.attacksLanded > 0
        //         ? clamp(Math.round((r.attacksLanded / (r.attacksLanded + r.hitsTaken || 1)) * 100))
        //         : 0;
        //     // this is not quite right
        //     const allHPGained = r.healingDone ? r.healingDone + (r.revivals * r.maxHp * REVIVAL_HP_PERCENTAGE) : r.maxHp;
        //     const survivalRate = clamp(Math.round(((allHPGained - r.damageTaken) / (r.maxHp || 1)) * 100));
        //     // clamp(Math.round(((r.maxHp - r.damageTaken) / (r.maxHp || 1)) * 100)); // it was like this before, but now we want to account for healing and revivals.
        //     const efficiency = clamp(Math.round(Math.min((r.damageDealt / Math.max(1, r.damageTaken)) * 50, 100)));
        //     return {
        //         name,
        //         attacksLanded: r.attacksLanded,
        //         damageDealt: r.damageDealt,
        //         damageBlocked: r.damageBlocked,
        //         hitsTaken: r.hitsTaken,
        //         damageTaken: r.damageTaken,
        //         revivals: r.revivals,
        //         healingDone: r.healingDone,
        //         kos: r.kos,
        //         accuracy,
        //         survivalRate,
        //         efficiency,
        //     };
        // };

        // Convert raw stats → FighterTelemetry with derived fields
        const toTelemetry = (name: string): FighterTelemetry => {
            const r = statsMap[name] ?? {
                attacksLanded: 0, damageDealt: 0, damageBlocked: 0, hitsTaken: 0,
                damageTaken: 0, revivals: 0, healingDone: 0, kos: 0,
                maxSingleHit: 0, streak: 0, currentStreak: 0, maxHp: 100,
            };

            const accuracy = r.attacksLanded > 0
                ? clamp(Math.round((r.attacksLanded / (r.attacksLanded + r.hitsTaken || 1)) * 100))
                : 0;

            // ── Fixed Survival Rate Calculation ──────────────────────────────
            // Total HP a fighter had access to throughout the match:
            // Base maxHp + total healing done + HP gained from all revivals
            const revivalHpGained = r.revivals * (r.maxHp * REVIVAL_HP_PERCENTAGE);
            const totalHpPool = r.maxHp + r.healingDone + revivalHpGained;

            // Remaining effective health pool after all damage taken
            const remainingHp = Math.max(0, totalHpPool - r.damageTaken);

            // Survival rate is the ratio of remaining health vs the total health pool they utilized
            const survivalRate = clamp(Math.round((remainingHp / (totalHpPool || 1)) * 100));

            const efficiency = clamp(Math.round(Math.min((r.damageDealt / Math.max(1, r.damageTaken)) * 50, 100)));

            return {
                name,
                attacksLanded: r.attacksLanded,
                damageDealt: r.damageDealt,
                damageBlocked: r.damageBlocked,
                hitsTaken: r.hitsTaken,
                damageTaken: r.damageTaken,
                revivals: r.revivals,
                healingDone: r.healingDone,
                kos: r.kos,
                accuracy,
                survivalRate,
                efficiency,
            };
        };

        const teamAStats = initialA.sort((a, b) => b.overall - a.overall).map(c => toTelemetry(c.name));
        const teamBStats = initialB.sort((a, b) => b.overall - a.overall).map(c => toTelemetry(c.name));

        const getBest = <K extends keyof FighterTelemetry>(
            arr: FighterTelemetry[], key: K
        ): FighterTelemetry => arr.length > 0
                ? arr.reduce((prev, curr) => ((curr[key] as number) > (prev[key] as number) ? curr : prev), arr[0])
                : toTelemetry("N/A");

        // Global records
        const allStats = [...teamAStats, ...teamBStats];
        const allRaw = Object.entries(statsMap);
        const longestStreak = allRaw.reduce(
            (best, [name, s]) => s.streak > best.streak ? { name, streak: s.streak } : best,
            { name: "N/A", streak: 0 }
        );
        const mostDamageSingleHit = allRaw.reduce(
            (best, [name, s]) => s.maxSingleHit > best.damage ? { name, damage: s.maxSingleHit } : best,
            { name: "N/A", damage: 0 }
        );
        const totalDamageDealt = allStats.reduce((s, f) => s + f.damageDealt, 0);
        const totalHealingDone = allStats.reduce((s, f) => s + f.healingDone, 0);

        const metadata: BattleMetadata = {
            totalRounds,
            totalKoCount,
            winnerPowerAvg: isTeamAWinner ? avgTeamA : avgTeamB,
            winType,
            dominance,
            teamAPowerAvg: avgTeamA,
            teamBPowerAvg: avgTeamB,
            teamAStats,
            teamBStats,
            mvpA: getBest(teamAStats, "damageDealt"),
            mvpB: getBest(teamBStats, "damageDealt"),
            wallA: getBest(teamAStats, "damageBlocked"),
            wallB: getBest(teamBStats, "damageBlocked"),
            strikerA: getBest(teamAStats, "attacksLanded"),
            strikerB: getBest(teamBStats, "attacksLanded"),
            reviveA: getBest(teamAStats, "revivals"),
            reviveB: getBest(teamBStats, "revivals"),
            healerA: getBest(teamAStats, "healingDone"),
            healerB: getBest(teamBStats, "healingDone"),
            longestStreak,
            mostDamageSingleHit,
            totalDamageDealt,
            totalHealingDone,
            mostKOA: getBest(teamAStats, "kos"),
            mostKOB: getBest(teamBStats, "kos")
        };

        script.push({
            targetTeam: losingTeamTag,
            isFinish: true,
            log: {
                id: timeStep++,
                type: "finish",
                text: `Battle Over: ${winnerName} secures victory via ${winType} after ${totalRounds} tactical engagements!`,
                icon: Trophy,
                colorClass: "text-amber-400 font-black",
                variant: isTeamAWinner ? "primary" : "secondary",
                metadata,
            } as any,
        });

        return { script, initialA, initialB };
    }, [teamAChars, teamBChars, nameA, nameB, aWins, bWins]);

    return buildScript;
}