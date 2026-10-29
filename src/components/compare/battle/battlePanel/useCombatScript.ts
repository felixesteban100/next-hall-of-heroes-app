import { useCallback } from "react";
import { /* Shield,  */Skull, Trophy, HeartPulse, RefreshCw, Lock, HandFist } from "lucide-react";
import { computeMatchScore } from "@/lib/compare";

import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole, Power, FallbackItem } from "@/types";
import { isRealPower } from "@/lib/compare/cinematicCombatView";

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
    // 🚀 Add these optional properties so ClashCard can read them safely
    isKO?: boolean;
    damage?: number;
    healing?: number,
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
    damage?: number;
    log: Log;
}

const ELIMINATION_PHRASES = [
    "was overwhelmed by the sustained pressure!",
    "succumbed to the relentless barrage!",
    "exhausted their energy reserves and collapsed!",
    "could no longer withstand the onslaught!",
    "was breached and knocked out of the engagement!",
];

function toFighterState(
    c: CharacterWithJoinTeamUniversePowerEnemies,
    fallbackName: string
): FighterState {
    const validPowers = Array.isArray(c.powers) ? c.powers.filter(isRealPower) : [];
    const durability = c.powerstats?.durability ?? 50;
    const maxHp = durability * 2; // e.g., Durability 70 = 140 Max HP

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

function getPowersByRole(fighter: FighterState, role: PowerRole) {
    if (!Array.isArray(fighter.powers)) return [];
    return fighter.powers.filter(isRealPower).filter(
        (p) => p.combatRole === role
    );
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

        // 🚀 Telemetry Tracker Map
        const statsMap: Record<string, { attacksLanded: number; damageDealt: number; damageBlocked: number; hitsTaken: number; revivals: number; healingDone: number }> = {};
        [...initialA, ...initialB].forEach(c => {
            statsMap[c.name] = { attacksLanded: 0, damageDealt: 0, damageBlocked: 0, hitsTaken: 0, revivals: 0, healingDone: 0 };
        });

        if (initialA.length === 0 || initialB.length === 0) {
            return { script: [], initialA, initialB };
        }

        const script: ScriptItem[] = [];
        let timeStep = 1;

        const isTeamAWinner = aWins >= bWins;
        const winnerName = isTeamAWinner ? nameA : nameB;
        // const winningTeamTag = isTeamAWinner ? "A" : "B";
        const losingTeamTag = isTeamAWinner ? "B" : "A";

        // Mutable clones for the simulation loop
        const tempA = initialA.map((c) => ({ ...c }));
        const tempB = initialB.map((c) => ({ ...c }));

        const maxRounds = Math.max(45, (tempA.length + tempB.length) * 4);
        let roundNum = 1;

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

            // ── 1. Healing / Regeneration / Passive Check ────────────────────
            const allAttackerPowers = Array.isArray(attacker.powers) ? attacker.powers.filter(isRealPower) : [];
            const healingPowers = allAttackerPowers.filter((p) => {
                const txt = `${p.name ?? ""} ${p.description ?? ""} ${p.combatRole ?? ""}`.toLowerCase();
                return txt.includes("heal") || txt.includes("regenerat") || txt.includes("recovery") || txt.includes("health") || txt.includes("factor");
            });

            // If the character has healing/regeneration and is hurt, trigger a heal on self instead of attacking!
            if (healingPowers.length > 0 && attacker.currentHp < attacker.maxHp && Math.random() < 0.35) {
                const healPower = healingPowers[Math.floor(Math.random() * healingPowers.length)];
                const healAmount = Math.round(attacker.maxHp * 0.25); // Heal 25% of max HP
                attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);

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
                        text: `${attacker.name} triggered [${healPower.name}], restoring ${healAmount} HP!`,
                        icon: HeartPulse,
                        colorClass: "text-emerald-400 font-bold",
                        variant,
                        healing: healAmount,
                    },
                });
                roundNum++;
                continue;
            }

            // ── 2. Offensive Power Filtering (Excludes Heals & Defends) ──────
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

            // ⚡ High-Impact Damage Scaling (Deals 20% to 45% of defender's actual Max HP per hit)
            const defenderMaxHp = defender.maxHp || 100;
            const damagePercentage = Math.random() * 0.25 + 0.20; // 20% to 45% chunk
            const calculatedDamage = Math.max(15, Math.round(defenderMaxHp * damagePercentage));

            defender.currentHp = Math.max(0, defender.currentHp - calculatedDamage);

            if (statsMap[attacker.name]) {
                statsMap[attacker.name].attacksLanded++;
                statsMap[attacker.name].damageDealt += calculatedDamage;
            }
            if (statsMap[defender.name]) {
                statsMap[defender.name].hitsTaken++;
            }

            // ── 4. Knockout Evaluation (Individual HP Check) ─────────────────
            if (defender.currentHp === 0) {
                defender.isAlive = false;
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

                // Check Revival Traits
                const revivalPowers = [...allAttackerPowers, ...(Array.isArray(defender.powers) ? defender.powers : [])].filter(isRealPower);
                const revivalPower = revivalPowers.find((p) => {
                    const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                    return txt.includes("immortal") || txt.includes("resurrect") || txt.includes("healing factor") || txt.includes("regeneration") || txt.includes("revive");
                });

                if (!defender.hasRevived && revivalPower && Math.random() < 0.85) {
                    defender.hasRevived = true;
                    defender.isAlive = true;
                    defender.currentHp = Math.round(defender.maxHp * 0.45); // Revive with 45% HP
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
                            text: `${defender.name} cheated death using [${revivalPower.name}], resurrecting with 45% HP!`,
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
                        damage: calculatedDamage, // 🚀 Crucial for live playback HP tracking
                    },
                });
            }
            roundNum++;
        }

        // Finalize Rout if any remaining active units on losing side
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

        const totalRounds = roundNum - 1;
        const totalKoCount = [...tempA, ...tempB].filter(c => !c.isAlive).length;
        const avgTeamA = Math.round(initialA.reduce((acc, c) => acc + c.overall, 0) / (initialA.length || 1));
        const avgTeamB = Math.round(initialB.reduce((acc, c) => acc + c.overall, 0) / (initialB.length || 1));
        const diff = Math.abs(aWins - bWins);
        const winType = diff > 15 ? "Decisive Wipeout" : "Hard-Fought Victory";

        // Aggregate Dual-Team Telemetry for Final Summary Card (7 Categories)
        const teamANames = new Set(initialA.map(c => c.name));
        const allFightersStats = Object.entries(statsMap).map(([name, stats]) => ({ name, ...stats }));
        const statsA = allFightersStats.filter(f => teamANames.has(f.name));
        const statsB = allFightersStats.filter(f => !teamANames.has(f.name));

        const getBest = (arr: typeof allFightersStats, key: keyof typeof allFightersStats[0], fallback: typeof allFightersStats[0]) =>
            arr.length > 0 ? arr.reduce((prev, curr) => (curr[key] > prev[key] ? curr : prev), arr[0]) : fallback;

        const fallbackFighter = { name: "N/A", attacksLanded: 0, damageDealt: 0, damageBlocked: 0, hitsTaken: 0, revivals: 0, healingDone: 0 };

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
                metadata: {
                    totalRounds,
                    totalKoCount,
                    winnerPowerAvg: isTeamAWinner ? avgTeamA : avgTeamB,
                    winType,
                    // 🚀 Expanded Telemetry Categories (7 categories per team)
                    mvpA: getBest(statsA, "damageDealt", fallbackFighter),
                    mvpB: getBest(statsB, "damageDealt", fallbackFighter),
                    wallA: getBest(statsA, "damageBlocked", fallbackFighter),
                    wallB: getBest(statsB, "damageBlocked", fallbackFighter),
                    strikerA: getBest(statsA, "attacksLanded", fallbackFighter),
                    strikerB: getBest(statsB, "attacksLanded", fallbackFighter),
                    punishA: getBest(statsA, "hitsTaken", fallbackFighter),
                    punishB: getBest(statsB, "hitsTaken", fallbackFighter),
                    reviveA: getBest(statsA, "revivals", fallbackFighter),
                    reviveB: getBest(statsB, "revivals", fallbackFighter),
                    healerA: getBest(statsA, "healingDone", fallbackFighter),
                    healerB: getBest(statsB, "healingDone", fallbackFighter),
                },
            } as any,
        });

        return { script, initialA, initialB };
    }, [teamAChars, teamBChars, nameA, nameB, aWins, bWins]);

    return buildScript;
}