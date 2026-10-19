// components/compare/BattlePanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Swords, Shield, Skull, Trophy, HeartPulse, Ghost, RefreshCw, Lock } from "lucide-react";
import { simulateSpar, computeMatchScore } from "@/lib/compare/compare_utls";
import { RoundDistributionChart } from "./RoundDistributionChart";
import { PointRadar, StatsRadar } from "./StatRadar";
import TacticalSummary from "./TacticalSummary";
import BattleTimelineLogs from "./BattleTimelineLogs";
import LiveRosterStatus from "./LiveRosterStatus";
import LiveTeamHealthBars from "./LiveTeamHealthBars";
import SparSimulation from "./SparSimulation";
import { TeamTacticalOverview } from "./TeamTacticalOverview";
import { CharacterWithJoinTeamUniversePowerEnemies, PowerRole } from "@/types";
import { Maximize2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export const ROUNDS = 100;

type Props = {
    radar: PointRadar[]
    powerEstimateA: number;
    powerEstimateB: number;
    nameA?: string;
    nameB?: string;
    teamAChars?: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars?: CharacterWithJoinTeamUniversePowerEnemies[];
    showRadarA: boolean;
    showRadarB: boolean;
};

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
    colorClass: string
}

export type FighterState = {
    name: string;
    overall: number;
    isAlive: boolean;
    powers?: any[];
    hasRevived?: boolean;
};

const ELIMINATION_PHRASES = [
    "was overwhelmed by the sustained pressure!",
    "succumbed to the relentless barrage!",
    "exhausted their energy reserves and collapsed!",
    "could no longer withstand the onslaught!",
    "was breached and knocked out of the engagement!"
];

export function BattlePanel({
    radar,
    powerEstimateA,
    powerEstimateB,
    nameA = "Team A",
    nameB = "Team B",
    teamAChars = [],
    teamBChars = [],
    showRadarA,
    showRadarB
}: Props) {
    const [seed, setSeed] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    const [visibleLogs, setVisibleLogs] = useState<Log[]>([]);

    const [rosterA, setRosterA] = useState<FighterState[]>([]);
    const [rosterB, setRosterB] = useState<FighterState[]>([]);

    const [dynamicHealthBonusA, setDynamicHealthBonusA] = useState(0);
    const [dynamicHealthBonusB, setDynamicHealthBonusB] = useState(0);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const result = useMemo(() => {
        if (!isMounted) return null;
        void seed;
        return simulateSpar(powerEstimateA, powerEstimateB, ROUNDS);
    }, [powerEstimateA, powerEstimateB, seed, isMounted]);

    const totalCountA = rosterA.length || 1;
    const aliveCountA = rosterA.filter(c => c.isAlive).length;
    const baseHealthA = Math.round((aliveCountA / totalCountA) * 100);
    const healthA = Math.min(100, Math.max(0, baseHealthA + dynamicHealthBonusA));

    const totalCountB = rosterB.length || 1;
    const aliveCountB = rosterB.filter(c => c.isAlive).length;
    const baseHealthB = Math.round((aliveCountB / totalCountB) * 100);
    const healthB = Math.min(100, Math.max(0, baseHealthB + dynamicHealthBonusB));

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const mappedA = (teamAChars.length ? teamAChars : []).map(c => ({
            name: c.name ?? nameA,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
            powers: c.powers ?? [],
            hasRevived: false,
        }));

        const mappedB = (teamBChars.length ? teamBChars : []).map(c => ({
            name: c.name ?? nameB,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
            powers: c.powers ?? [],
            hasRevived: false,
        }));

        setRosterA(mappedA);
        setRosterB(mappedB);
        setDynamicHealthBonusA(0);
        setDynamicHealthBonusB(0);
        setVisibleLogs([]);
    }, [teamAChars, teamBChars, nameA, nameB, isMounted]);

    // 🎬 Simulation Engine with Staggered, Battle-Long Eliminations
    useEffect(() => {
        if (!isMounted || !result || seed === 0) return;

        const initialA = (teamAChars.length ? teamAChars : []).map(c => ({
            name: c.name ?? nameA,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
            powers: c.powers ?? [],
            hasRevived: false,
        }));

        const initialB = (teamBChars.length ? teamBChars : []).map(c => ({
            name: c.name ?? nameB,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
            powers: c.powers ?? [],
            hasRevived: false,
        }));

        if (initialA.length === 0 || initialB.length === 0) return;

        setIsPlaying(true);
        setVisibleLogs([]);
        setDynamicHealthBonusA(0);
        setDynamicHealthBonusB(0);

        type ScriptItem = {
            log: Log;
            targetTeam: "A" | "B";
            targetName?: string;
            isKO?: boolean;
            isRevive?: boolean;
            isHeal?: boolean;
            healTeam?: "A" | "B";
            isFinish?: boolean;
        };

        const script: ScriptItem[] = [];
        let timeStep = 1;

        const isTeamAWinner = result.aWins >= result.bWins;
        const winnerName = isTeamAWinner ? nameA : nameB;

        let tempA = initialA.map(c => ({ ...c }));
        let tempB = initialB.map(c => ({ ...c }));

        const winningTeamTag = isTeamAWinner ? "A" : "B";
        const losingTeamTag = isTeamAWinner ? "B" : "A";

        const getPowersByRole = (fighter: any, role: PowerRole) => {
            if (!fighter.powers || !Array.isArray(fighter.powers)) return [];
            return fighter.powers.filter((p: any) => p && !p.isFallback && p.combatRole === role);
        };

        // Phase 1: Fight rounds (Escalate loop iterations based on roster size)
        let roundNum = 1;
        const maxRounds = Math.max(35, (tempA.length + tempB.length) * 3);

        while (roundNum <= maxRounds) {
            const activeTempA = tempA.filter(c => c.isAlive);
            const activeTempB = tempB.filter(c => c.isAlive);

            if (activeTempA.length === 0 || activeTempB.length === 0) break;

            // 🌟 Use losingActive to check if the losing team is completely wiped out
            const losingActive = isTeamAWinner ? activeTempB : activeTempA;
            if (losingActive.length === 0) break;

            const isAttackerA = Math.random() < (isTeamAWinner ? 0.65 : 0.35);

            // 🌟 Use isAttackerWinnerTeam to determine if the attacker belongs to the winning team
            const isAttackerWinnerTeam = (isAttackerA && isTeamAWinner) || (!isAttackerA && !isTeamAWinner);

            const attackerTeam = isAttackerA ? tempA : tempB;
            const defenderTeam = isAttackerA ? tempB : tempA;
            const defenderTeamTag = isAttackerA ? "B" : "A";

            const activeAttackers = attackerTeam.filter(c => c.isAlive);
            const activeDefenders = defenderTeam.filter(c => c.isAlive);

            if (activeAttackers.length === 0 || activeDefenders.length === 0) break;

            const attacker = activeAttackers[Math.floor(Math.random() * activeAttackers.length)];
            const defender = activeDefenders[Math.floor(Math.random() * activeDefenders.length)];

            // 1. Healing / Regeneration Check (Restricted primarily to dominant/winning attackers)
            const utilityPowers = getPowersByRole(attacker, "Utility");
            const hasHealingTrait = utilityPowers.some((p: any) => {
                const txt = `${p.name || ""} ${p.description || ""}`.toLowerCase();
                return txt.includes("heal") || txt.includes("regenerat") || txt.includes("recovery");
            });

            if (isAttackerWinnerTeam && hasHealingTrait && Math.random() < 0.25) {
                const healPower = utilityPowers.find((p: any) => {
                    const txt = `${p.name || ""} ${p.description || ""}`.toLowerCase();
                    return txt.includes("heal") || txt.includes("regenerat");
                }) || utilityPowers[0];

                script.push({
                    targetTeam: isAttackerA ? "A" : "B",
                    log: {
                        id: timeStep++,
                        type: "heal",
                        attackerName: attacker.name,
                        powerName: healPower.name,
                        text: `${attacker.name} activated [${healPower.name}], restoring vital health to team ${isAttackerA ? nameA : nameB}!`,
                        icon: HeartPulse,
                        colorClass: "text-emerald-400 font-bold",
                    }
                });
                roundNum++;
                continue;
            }

            // 2. Power Move Execution
            const strikingPowers = [
                ...getPowersByRole(attacker, "Offensive"),
                ...getPowersByRole(attacker, "Control"),
                ...getPowersByRole(attacker, "Hybrid / Versatile")
            ];

            const fallbackPowers = attacker.powers?.filter((p: any) => p && !p.isFallback && p.name) ?? [];
            const poolToUse = strikingPowers.length > 0 ? strikingPowers : fallbackPowers;

            let moveName = "Direct Strike";
            let powerTitle = "";
            let logIcon = Swords;

            if (poolToUse.length > 0) {
                const chosenPower = poolToUse[Math.floor(Math.random() * poolToUse.length)];
                powerTitle = chosenPower.name;

                if (chosenPower.actions && Array.isArray(chosenPower.actions) && chosenPower.actions.length > 0) {
                    const action = chosenPower.actions[Math.floor(Math.random() * chosenPower.actions.length)];
                    moveName = action.name;
                } else {
                    moveName = chosenPower.name;
                }

                if (chosenPower.combatRole === "Control") {
                    logIcon = Lock;
                }
            }

            // 3. Defensive Mitigation Check
            const isDefenderWinnerTeam = (defenderTeamTag === winningTeamTag);
            const defensivePowers = [
                ...getPowersByRole(defender, "Defensive"),
                ...getPowersByRole(defender, "Utility")
            ];

            const mitigationChance = isDefenderWinnerTeam ? 0.35 : 0.08;
            if (defensivePowers.length > 0 && Math.random() < mitigationChance) {
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
                    }
                });
                roundNum++;
                continue;
            }

            // 4. Progressive Knockout Evaluation paired with Attacking Action
            const powerDiff = attacker.overall - defender.overall;
            const baseKoThreshold = isDefenderWinnerTeam ? 0.12 : 0.40;
            const koChance = powerDiff >= 0 ? baseKoThreshold + 0.18 : baseKoThreshold;

            const canEliminate = !isDefenderWinnerTeam || activeDefenders.length > 1;

            if (Math.random() < koChance && canEliminate) {
                const revivalPowers = [
                    ...getPowersByRole(defender, "Defensive"),
                    ...getPowersByRole(defender, "Utility"),
                    ...getPowersByRole(defender, "Hybrid / Versatile")
                ];

                const revivalPower = revivalPowers.find((p: any) => {
                    const txt = `${p.name || ""} ${p.description || ""}`.toLowerCase();
                    return txt.includes("immortal") || txt.includes("resurrect") || txt.includes("healing factor") || txt.includes("regeneration") || txt.includes("revive") || txt.includes("indestructible");
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
                            colorClass: "text-amber-400 font-bold",
                        }
                    });
                } else {
                    defender.isAlive = false;
                    const randomPhrase = ELIMINATION_PHRASES[Math.floor(Math.random() * ELIMINATION_PHRASES.length)];

                    script.push({
                        targetTeam: defenderTeamTag,
                        targetName: defender.name, // 🌟 REQUIRED so interval updates roster state!
                        isKO: true,                // 🌟 REQUIRED to trigger live health/roster drops!
                        log: {
                            id: timeStep++,
                            type: "ko",            // 🌟 Set to "ko" so it uses orange styling and custom display
                            attackerName: attacker.name,
                            defenderName: defender.name,
                            powerName: powerTitle || moveName,
                            text: `${defender.name} ${randomPhrase}`,
                            icon: Skull,
                            colorClass: "text-orange-500 font-bold",
                        }
                    });
                }
            } else {
                // Regular combat strike log
                const moveDesc = powerTitle && powerTitle !== moveName ? `[${powerTitle}: ${moveName}]` : `[${moveName}]`;
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
                    }
                });
            }

            roundNum++;
        }

        // Phase 2: Dynamic Team Finish (No more bulk listing of individual K.O.s)
        const losingTeamFinal = isTeamAWinner ? tempB : tempA;
        const remainingLosingFighters = losingTeamFinal.filter(c => c.isAlive);

        if (remainingLosingFighters.length > 0) {
            remainingLosingFighters.forEach(fighter => {
                fighter.isAlive = false;
            });

            const loserName = isTeamAWinner ? nameB : nameA;
            script.push({
                targetTeam: losingTeamTag,
                isKO: true,
                log: {
                    id: timeStep++,
                    type: "rout",
                    text: `${loserName}'s remaining line fell under overwhelming pressure as ${winnerName} closed the engagement!`,
                    icon: Skull,
                    colorClass: "text-orange-500 font-bold",
                }
            });
        }

        // Phase 3: Final Banner
        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const winType = diff > 15 ? "Decisive Wipeout" : "Hard-Fought Victory";

        script.push({
            targetTeam: losingTeamTag,
            isFinish: true,
            log: {
                id: timeStep++,
                type: "finish",
                text: `Battle Over: ${winnerName} secures victory via ${winType} (${ROUNDS} Rounds)!`,
                icon: Trophy,
                colorClass: "text-amber-400 font-black",
            }
        });

        setRosterA(initialA);
        setRosterB(initialB);

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < script.length) {
                const step = script[currentIndex];
                setVisibleLogs((prev) => [...prev, step.log]);

                if (step.isKO && step.targetName) {
                    if (step.targetTeam === "A") {
                        setRosterA(prev => prev.map(c => c.name === step.targetName ? { ...c, isAlive: false } : c));
                    } else {
                        setRosterB(prev => prev.map(c => c.name === step.targetName ? { ...c, isAlive: false } : c));
                    }
                }

                if (step.isHeal && step.healTeam) {
                    if (step.healTeam === "A") {
                        setDynamicHealthBonusA(prev => Math.min(30, prev + 15));
                    } else {
                        setDynamicHealthBonusB(prev => Math.min(30, prev + 15));
                    }
                }

                if (step.isFinish) {
                    setIsPlaying(false);
                }

                currentIndex++;
            } else {
                clearInterval(interval);
                setIsPlaying(false);
            }
        }, 1400);

        return () => clearInterval(interval);
    }, [seed, isMounted]);

    if (powerEstimateA == null || powerEstimateB == null || powerEstimateA == 0 || powerEstimateB == 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select for both sides to run a spar simulation
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-muted-foreground/20 rounded-xl p-4 flex flex-col gap-3 justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                        Stats radar
                    </h3>
                    <StatsRadar data={radar} nameA={nameA} nameB={nameB} showA={showRadarA} showB={showRadarB} />
                </div>

                <TeamTacticalOverview
                    entitiesA={teamAChars}
                    entitiesB={teamBChars}
                    nameA={nameA}
                    nameB={nameB}
                />

                <RoundDistributionChart
                    aWins={result?.aWins}
                    bWins={result?.bWins}
                    draws={result?.draws}
                    nameA={nameA}
                    nameB={nameB}
                />
            </div>

            <div className="border border-muted-foreground/20 rounded-xl p-4 flex flex-col gap-3 justify-between">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Combat simulation ({ROUNDS} rounds)
                    </h3>
                    <ButtonStartBattle onClick={() => setSeed((s) => s + 1)} isPlaying={isPlaying} />
                    {/* Desktop Expand Button */}
                    <div className=" top-2 right-2 z-10 hidden md:block">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Maximize2 className="size-4" />
                            </DialogTrigger>

                            {/* Enlarged Desktop Dialog */}
                            <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[92vw] max-h-[90vh] flex flex-col gap-4 overflow-hidden p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-base font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                                        <span className="flex gap-2"><Swords className="size-5 text-primary" /> Live Engagement Overview ({nameA} vs {nameB})</span>
                                        <ButtonStartBattle onClick={() => setSeed((s) => s + 1)} isPlaying={isPlaying} />
                                    </DialogTitle>
                                </DialogHeader>
                                <CombatView isDialog={true} result={result} nameA={nameA} nameB={nameB} healthA={healthA} healthB={healthB} rosterA={rosterA} rosterB={rosterB} visibleLogs={visibleLogs} isMounted={isMounted} powerEstimateA={powerEstimateA} powerEstimateB={powerEstimateB} seed={seed} teamAChars={teamAChars} teamBChars={teamBChars} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <CombatView isDialog={false} result={result} nameA={nameA} nameB={nameB} healthA={healthA} healthB={healthB} rosterA={rosterA} rosterB={rosterB} visibleLogs={visibleLogs} isMounted={isMounted} powerEstimateA={powerEstimateA} powerEstimateB={powerEstimateB} seed={seed} teamAChars={teamAChars} teamBChars={teamBChars} />
            </div>
        </div>
    );
}

type CombatViewProps = {
    result: {
        aWins: number;
        bWins: number;
        draws: number;
        aWinPct: number;
        bWinPct: number;
        drawPct: number;
    } | null,
    nameA: string,
    nameB: string,
    healthA: number,
    healthB: number,
    rosterA: FighterState[],
    rosterB: FighterState[],
    visibleLogs: Log[],
    isMounted: boolean,
    powerEstimateA: number,
    powerEstimateB: number,
    seed: number;
    isDialog: boolean,
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[],
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[]
}

function CombatView({ isDialog, result, nameA, nameB, healthA, healthB, rosterA, rosterB, visibleLogs, isMounted, powerEstimateA, powerEstimateB, seed, teamAChars, teamBChars }: CombatViewProps) {
    return result && seed > 0 ? (
        isDialog ?
            <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                <LiveTeamHealthBars
                    healthA={healthA}
                    healthB={healthB}
                    nameA={nameA}
                    nameB={nameB}
                />
                <LiveRosterStatus
                    rosterA={rosterA}
                    rosterB={rosterB}
                    teamAChars={teamAChars}
                    teamBChars={teamBChars}
                    nameA={nameA}
                    nameB={nameB}
                    latestLog={visibleLogs[visibleLogs.length - 1]}
                    isDialog={isDialog}

                />
                <BattleTimelineLogs logs={visibleLogs} maxHeight="h-[220px]" />
            </div>
            :
            <>
                <SparSimulation result={result} nameA={nameA} nameB={nameB} />
                <LiveTeamHealthBars healthA={healthA} healthB={healthB} nameA={nameA} nameB={nameB} />
                <LiveRosterStatus
                    rosterA={rosterA}
                    rosterB={rosterB}
                    teamAChars={teamAChars}
                    teamBChars={teamBChars}
                    nameA={nameA}
                    nameB={nameB}
                    latestLog={visibleLogs[visibleLogs.length - 1]}
                    isDialog={isDialog}
                />
                <BattleTimelineLogs logs={visibleLogs} />
                <TacticalSummary isMounted={isMounted} nameA={nameA} nameB={nameB} powerEstimateA={powerEstimateA} powerEstimateB={powerEstimateB} seed={seed} />
            </>
    ) : (
        <div className={`${isDialog ? "h-[75vh]" : "h-full"} border border-dashed border-muted-foreground/30 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20`}>
            <div className="flex gap-2">
                <Swords className="size-6 animate-bounce text-primary" />
                <Swords className="size-6 animate-bounce text-secondary" />
            </div>
            <p className="text-xs font-medium">Ready to simulate combat. Click "Replay Battle" above to begin!</p>
        </div>
    )
}

function ButtonStartBattle({ isPlaying, onClick }: { isPlaying: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            disabled={isPlaying}
            onClick={() => onClick()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
            <Swords className={`size-3.5 ${isPlaying ? "animate-pulse text-primary" : ""}`} />
            {isPlaying ? "Simulating..." : "Replay Battle"}
        </button>
    )
}
