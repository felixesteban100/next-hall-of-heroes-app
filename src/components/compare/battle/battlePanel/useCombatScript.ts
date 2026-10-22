import { useCallback } from "react";
import { Swords, Shield, Skull, Trophy, HeartPulse, RefreshCw, Lock } from "lucide-react";
import { computeMatchScore } from "@/lib/compare/compare_utls";
import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole } from "@/types";
import { FighterState, Log, ScriptItem, ROUNDS } from "../BattlePanel";

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
    return {
        name: c.name ?? fallbackName,
        overall: c.powerstats ? (computeMatchScore(c as any).overall ?? 50) : 50,
        isAlive: true,
        powers: c.powers ?? [],
        hasRevived: false,
    };
}

function getPowersByRole(fighter: FighterState, role: PowerRole) {
    if (!Array.isArray(fighter.powers)) return [];
    return fighter.powers.filter(
        (p: any) => p && !p.isFallback && p.combatRole === role
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

            // ── Heal check ───────────────────────────────────────────────────
            const utilityPowers = getPowersByRole(attacker, "Utility");
            const hasHealingTrait = utilityPowers.some((p: any) => {
                const txt = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
                return txt.includes("heal") || txt.includes("regenerat") || txt.includes("recovery");
            });

            if (isAttackerWinnerTeam && hasHealingTrait && Math.random() < 0.25) {
                const healPower =
                    utilityPowers.find((p: any) => {
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
                (p: any) =>
                    p && !p.isFallback && p.name && p.combatRole !== "Defensive" && p.combatRole !== "Utility"
            );
            const pool = strikingPowers.length > 0 ? strikingPowers : fallbackPowers;

            let moveName = "Direct Strike";
            let powerTitle = "";
            let logIcon: any = Swords;

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
                const revivalPowers = [
                    ...getPowersByRole(defender, "Defensive"),
                    ...getPowersByRole(defender, "Utility"),
                    ...getPowersByRole(defender, "Hybrid / Versatile"),
                ];
                const revivalPower = revivalPowers.find((p: any) => {
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

                if (!defender.hasRevived && revivalPower) {
                    defender.hasRevived = true;
                    script.push({
                        targetTeam: defenderTeamTag,
                        targetName: defender.name,
                        isRevive: true,
                        log: {
                            id: timeStep++,
                            type: "revive",
                            defenderName: defender.name,
                            powerName: revivalPower.name,
                            text: `${defender.name} cheated defeat using [${revivalPower.name}], surging back into combat!`,
                            icon: RefreshCw,
                            colorClass: "text-purple-400 font-bold",
                            variant,
                        },
                    });
                } else {
                    defender.isAlive = false;
                    const phrase = ELIMINATION_PHRASES[Math.floor(Math.random() * ELIMINATION_PHRASES.length)];
                    script.push({
                        targetTeam: defenderTeamTag,
                        targetName: defender.name,
                        isKO: true,
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
                }
            } else {
                const moveDesc =
                    powerTitle && powerTitle !== moveName
                        ? `[${powerTitle}: ${moveName}]`
                        : `[${moveName}]`;
                script.push({
                    targetTeam: defenderTeamTag,
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

        // ── Final rout & banner ───────────────────────────────────────────────
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
                /* (${ROUNDS} Rounds) */
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