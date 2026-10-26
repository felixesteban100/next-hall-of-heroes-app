import { useCallback } from "react";
import { Shield, Skull, Trophy, HeartPulse, RefreshCw, Lock, HandFist } from "lucide-react";
import { computeMatchScore } from "@/lib/compare";

import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole, Power } from "@/types";
import { FighterState, ScriptItem } from "../BattlePanel";
import { isRealPower } from "@/lib/compare/cinematicCombatView";

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
    // 🚀 Filter powers to guarantee Power[] type compatibility
    const validPowers = Array.isArray(c.powers) ? c.powers.filter(isRealPower) : [];
    return {
        name: c.name ?? fallbackName,
        image: c.images.md ?? "",
        imageFocus: c.imageFocus ?? "center",
        overall: c.powerstats ? (computeMatchScore(c as any).overall ?? 50) : 50,
        isAlive: true,
        powers: validPowers,
        hasRevived: false,
    };
}

function getPowersByRole(fighter: FighterState, role: PowerRole) {
    if (!Array.isArray(fighter.powers)) return [];
    return fighter.powers.filter(isRealPower).filter(
        (p) => p.combatRole === role
    );
}

/**
 * Returns a stable `buildScript` function.
 * Call it when the user presses start / re-roll.
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

        if (initialA.length === 0 || initialB.length === 0) {
            return { script: [], initialA, initialB };
        }

        const script: ScriptItem[] = [];
        let timeStep = 1;

        const isTeamAWinner = aWins >= bWins;
        const winnerName = isTeamAWinner ? nameA : nameB;
        const winningTeamTag = isTeamAWinner ? "A" : "B";
        const losingTeamTag = isTeamAWinner ? "B" : "A";

        // Work on mutable clones so we don't mutate the returned initialA/B
        const tempA = initialA.map((c) => ({ ...c }));
        const tempB = initialB.map((c) => ({ ...c }));

        const maxRounds = Math.max(35, (tempA.length + tempB.length) * 3);
        let roundNum = 1;

        while (roundNum <= maxRounds) {
            const activeTempA = tempA.filter((c) => c.isAlive);
            const activeTempB = tempB.filter((c) => c.isAlive);
            if (activeTempA.length === 0 || activeTempB.length === 0) break;

            const losingActive = isTeamAWinner ? activeTempB : activeTempA;
            if (losingActive.length === 0) break;

            const isAttackerA = Math.random() < (isTeamAWinner ? 0.65 : 0.35);
            const isAttackerWinnerTeam =
                (isAttackerA && isTeamAWinner) || (!isAttackerA && !isTeamAWinner);

            const attackerTeam = isAttackerA ? tempA : tempB;
            const defenderTeam = isAttackerA ? tempB : tempA;
            const defenderTeamTag: "A" | "B" = isAttackerA ? "B" : "A";

            const activeAttackers = attackerTeam.filter((c) => c.isAlive);
            const activeDefenders = defenderTeam.filter((c) => c.isAlive);
            if (activeAttackers.length === 0 || activeDefenders.length === 0) break;

            const attacker = activeAttackers[Math.floor(Math.random() * activeAttackers.length)];
            const defender = activeDefenders[Math.floor(Math.random() * activeDefenders.length)];
            const variant: "primary" | "secondary" = isAttackerA ? "primary" : "secondary";

            // ── Active Tactical / Utility Maneuver Check ─────────────────────
            const utilityPowers = getPowersByRole(attacker, "Utility");
            // Give characters with utility/genius powers a 25% chance to execute a tactical move
            if (utilityPowers.length > 0 && Math.random() < 0.25) {
                const utilPower = utilityPowers[Math.floor(Math.random() * utilityPowers.length)];
                const moveName = Array.isArray(utilPower.actions) && utilPower.actions.length > 0
                    ? utilPower.actions[0].name
                    : utilPower.name;

                script.push({
                    targetTeam: defenderTeamTag,
                    damage: 1,
                    log: {
                        id: timeStep++,
                        type: "attack",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: utilPower.name,
                        actionName: moveName,
                        text: `${attacker.name} executed tactical calculation using [${utilPower.name}] against ${defender.name}!`,
                        icon: HandFist,
                        colorClass: isAttackerA ? "text-primary" : "text-secondary",
                        variant,
                    },
                });
                roundNum++;
                continue;
            }

            // ── Heal check ───────────────────────────────────────────────────
            const hasHealingTrait = utilityPowers.some((p) => {
                const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                return txt.includes("heal") || txt.includes("regenerat") || txt.includes("recovery");
            });

            if (isAttackerWinnerTeam && hasHealingTrait && Math.random() < 0.25) {
                const healPower =
                    utilityPowers.find((p) => {
                        const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                        return txt.includes("heal") || txt.includes("regenerat");
                    }) ?? utilityPowers[0];
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
                        text: `${attacker.name} activated [${healPower.name}], restoring vital health to team ${isAttackerA ? nameA : nameB}!`,
                        icon: HeartPulse,
                        colorClass: "text-emerald-400 font-bold",
                        variant,
                    },
                });
                roundNum++;
                continue;
            }

            // ── Power move ───────────────────────────────────────────────────
            const strikingPowers = [
                ...getPowersByRole(attacker, "Offensive"),
                ...getPowersByRole(attacker, "Control"),
                ...getPowersByRole(attacker, "Hybrid / Versatile"),
            ];
            const fallbackPowers = (attacker.powers ?? []).filter(
                (p): p is Power =>
                    p !== null &&
                    typeof p === "object" &&
                    !("isFallback" in p) &&
                    Boolean(p.name) &&
                    p.combatRole !== "Defensive" &&
                    p.combatRole !== "Utility"
            );
            const pool = strikingPowers.length > 0 ? strikingPowers : fallbackPowers;

            let moveName = "Direct Strike";
            let powerTitle = "Attack";
            let logIcon: any = HandFist;

            if (pool.length > 0) {
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                powerTitle = chosen.name;
                if (Array.isArray(chosen.actions) && chosen.actions.length > 0) {
                    moveName = chosen.actions[Math.floor(Math.random() * chosen.actions.length)].name;
                } else {
                    moveName = chosen.name;
                }
                if (chosen.combatRole === "Control") logIcon = Lock;
            }

            // ── Defensive mitigation ─────────────────────────────────────────
            const isDefenderWinnerTeam = defenderTeamTag === winningTeamTag;
            const defensivePowers = [
                ...getPowersByRole(defender, "Defensive"),
                ...getPowersByRole(defender, "Utility"),
            ];

            if (defensivePowers.length > 0 && Math.random() < (isDefenderWinnerTeam ? 0.35 : 0.08)) {
                const defPower = defensivePowers[Math.floor(Math.random() * defensivePowers.length)];
                script.push({
                    targetTeam: defenderTeamTag,
                    damage: 0, // 🚀 0 damage taken because the attack was blocked!
                    log: {
                        id: timeStep++,
                        type: "defend",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: defPower.name,
                        text: `${defender.name} activated [${defPower.combatRole}: ${defPower.name}] to mitigate incoming damage from ${attacker.name}!`,
                        icon: Shield,
                        colorClass: "text-cyan-400 font-medium",
                        variant,
                    },
                });
                roundNum++;
                continue;
            }

            // ── Knockout evaluation ──────────────────────────────────────────
            const powerDiff = attacker.overall - defender.overall;
            const baseKoThreshold = isDefenderWinnerTeam ? 0.12 : 0.40;
            const koChance = powerDiff >= 0 ? baseKoThreshold + 0.18 : baseKoThreshold;
            const canEliminate = !isDefenderWinnerTeam || activeDefenders.length > 1;

            if (Math.random() < koChance && canEliminate) {
                defender.isAlive = false;
                const phrase = ELIMINATION_PHRASES[Math.floor(Math.random() * ELIMINATION_PHRASES.length)];
                const koDamage = Math.floor(Math.random() * 8) + 10; // 10% to 18% HP damage on K.O.

                script.push({
                    targetTeam: defenderTeamTag,
                    targetName: defender.name,
                    isKO: true,
                    // damage: koDamage,
                    damage: 3,
                    log: {
                        id: timeStep++,
                        type: "ko",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: powerTitle || moveName,
                        actionName: moveName,
                        text: `${defender.name} ${phrase}`,
                        icon: Skull,
                        colorClass: "text-orange-500 font-bold",
                        variant,
                    },
                });

                const revivalPowers = [
                    ...getPowersByRole(defender, "Defensive"),
                    ...getPowersByRole(defender, "Utility"),
                    ...getPowersByRole(defender, "Hybrid / Versatile"),
                ];
                const revivalPower = revivalPowers.find((p) => {
                    const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                    return (
                        txt.includes("immortal") ||
                        txt.includes("resurrect") ||
                        txt.includes("healing factor") ||
                        txt.includes("regeneration") ||
                        txt.includes("revive") ||
                        txt.includes("indestructible")
                    );
                });

                if (!defender.hasRevived && revivalPower && Math.random() < 0.85) {
                    defender.hasRevived = true;
                    defender.isAlive = true;

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
                            text: `${defender.name} cheated death using [${revivalPower.name}], surging back into combat!`,
                            icon: RefreshCw,
                            colorClass: "text-purple-400 font-bold",
                            variant,
                        },
                    });
                }
            } else {
                const moveDesc =
                    powerTitle && powerTitle !== moveName
                        ? `[${powerTitle}: ${moveName}]`
                        : `[${moveName}]`;

                const attackDamage = Math.floor(Math.random() * 6) + 3; // 🚀 3% to 8% chip damage per attack

                script.push({
                    targetTeam: defenderTeamTag,
                    damage: attackDamage, // 🚀 Passes damage to playback state
                    log: {
                        id: timeStep++,
                        type: "attack",
                        attackerName: attacker.name,
                        defenderName: defender.name,
                        powerName: powerTitle || moveName,
                        actionName: powerTitle && powerTitle !== moveName ? moveName : undefined,
                        text: `[RND ${roundNum * 3}] ${attacker.name} (${Math.round(attacker.overall)}) executed ${moveDesc} against ${defender.name} (${Math.round(defender.overall)})!`,
                        icon: logIcon,
                        colorClass: isAttackerA ? "text-primary" : "text-secondary",
                        variant,
                    },
                });
            }
            roundNum++;
        }

        const losingTeamFinal = isTeamAWinner ? tempB : tempA;
        const remaining = losingTeamFinal.filter((c) => c.isAlive);
        if (remaining.length > 0) {
            remaining.forEach((f) => (f.isAlive = false));
            script.push({
                targetTeam: losingTeamTag,
                isKO: true,
                log: {
                    id: timeStep++,
                    type: "rout",
                    text: `${isTeamAWinner ? nameB : nameA}'s remaining line fell under overwhelming pressure as ${winnerName} closed the engagement!`,
                    icon: Skull,
                    colorClass: "text-orange-500 font-bold",
                    variant: isTeamAWinner ? "secondary" : "primary",
                },
            });
        }

        const diff = Math.abs(aWins - bWins);
        const winType = diff > 15 ? "Decisive Wipeout" : "Hard-Fought Victory";
        script.push({
            targetTeam: losingTeamTag,
            isFinish: true,
            log: {
                id: timeStep++,
                type: "finish",
                text: `Battle Over: ${winnerName} secures victory via ${winType}!`,
                icon: Trophy,
                colorClass: "text-amber-400 font-black",
                variant: isTeamAWinner ? "primary" : "secondary",
            },
        });

        return { script, initialA, initialB };
    }, [teamAChars, teamBChars, nameA, nameB, aWins, bWins]);

    return buildScript;
}