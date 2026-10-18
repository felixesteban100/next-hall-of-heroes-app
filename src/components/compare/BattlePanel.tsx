// components/compare/BattlePanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Swords, Zap, Shield, Sparkles, Flame, Skull, Trophy } from "lucide-react";
import { simulateSpar, computeMatchScore } from "@/lib/compare/compare_utls";
import { RoundDistributionChart } from "./RoundDistributionChart";
import { PointRadar, StatsRadar } from "./StatRadar";
import TacticalSummary from "./TacticalSummary";
import BattleTimelineLogs from "./BattleTimelineLogs";
import LiveRosterStatus from "./LiveRosterStatus";
import LiveTeamHealthBars from "./LiveTeamHealthBars";
import SparSimulation from "./SparSimulation";
import { TeamTacticalOverview } from "./TeamTacticalOverview";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

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

const STAT_ACTIONS = [
    { stat: "strength", text: "crushed defenses with an overwhelming blow against", icon: Swords, color: "text-red-400" },
    { stat: "speed", text: "blitzed past the guard of", icon: Zap, color: "text-amber-400" },
    { stat: "intelligence", text: "outsmarted and countered a strike from", icon: Shield, color: "text-blue-400" },
    { stat: "power", text: "unleashed an explosive energy surge obliterating", icon: Flame, color: "text-purple-400" },
    { stat: "durability", text: "shrugged off a barrage and countered", icon: Sparkles, color: "text-emerald-400" },
    { stat: "combat", text: "demonstrated master-class martial supremacy over", icon: Swords, color: "text-rose-400" },
];

export type Log = { id: number; text: string; icon: any; colorClass: string }

export type FighterState = {
    name: string;
    overall: number;
    isAlive: boolean;
};

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

    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const result = useMemo(() => {
        if (!isMounted) return null;
        void seed;
        return simulateSpar(powerEstimateA, powerEstimateB, ROUNDS);
    }, [powerEstimateA, powerEstimateB, seed, isMounted]);

    const totalCountA = rosterA.length || 1;
    const aliveCountA = rosterA.filter(c => c.isAlive).length;
    const healthA = Math.round((aliveCountA / totalCountA) * 100);

    const totalCountB = rosterB.length || 1;
    const aliveCountB = rosterB.filter(c => c.isAlive).length;
    const healthB = Math.round((aliveCountB / totalCountB) * 100);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 🌟 Initialize fighters with their evaluated overall power score using computeMatchScore
    useEffect(() => {
        if (!isMounted) return;

        const mappedA = (teamAChars.length ? teamAChars : []).map(c => ({
            name: c.name ?? nameA,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
        }));

        const mappedB = (teamBChars.length ? teamBChars : []).map(c => ({
            name: c.name ?? nameB,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
        }));

        setRosterA(mappedA);
        setRosterB(mappedB);
        setVisibleLogs([]);
    }, [teamAChars, teamBChars, nameA, nameB, isMounted]);

    // 🎬 Power-Weighted Turn Simulation Engine (Triggered ONLY when `seed` increments)
    useEffect(() => {
        // If seed is 0, wait for the user to click the button first!
        if (!isMounted || !result || seed === 0) return;

        const initialA = (teamAChars.length ? teamAChars : []).map(c => ({
            name: c.name ?? nameA,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
        }));

        const initialB = (teamBChars.length ? teamBChars : []).map(c => ({
            name: c.name ?? nameB,
            overall: c.powerstats ? computeMatchScore(c as any).overall ?? 50 : 50,
            isAlive: true,
        }));

        if (initialA.length === 0 || initialB.length === 0) return;

        setIsPlaying(true);
        setVisibleLogs([]); // Clear previous logs on new run

        type ScriptItem = {
            log: Log;
            targetTeam: "A" | "B";
            targetName?: string;
            isKO?: boolean;
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

        // Phase 1: Fight rounds
        let roundNum = 1;
        while (roundNum <= 10) {
            const isAttackerA = Math.random() < (isTeamAWinner ? 0.6 : 0.4);
            const attackerTeam = isAttackerA ? tempA : tempB;
            const defenderTeam = isAttackerA ? tempB : tempA;
            const defenderTeamTag = isAttackerA ? "B" : "A";

            const activeAttackers = attackerTeam.filter(c => c.isAlive);
            const activeDefenders = defenderTeam.filter(c => c.isAlive);

            if (activeAttackers.length === 0 || activeDefenders.length === 0) break;

            const attacker = activeAttackers[Math.floor(Math.random() * activeAttackers.length)];
            const defender = activeDefenders[Math.floor(Math.random() * activeDefenders.length)];
            const action = STAT_ACTIONS[Math.floor(Math.random() * STAT_ACTIONS.length)];

            script.push({
                targetTeam: defenderTeamTag,
                log: {
                    id: timeStep++,
                    text: `[RND ${roundNum * 8}] ${attacker.name} (${Math.round(attacker.overall)}) ${action.text} ${defender.name} (${Math.round(defender.overall)})!`,
                    icon: action.icon,
                    colorClass: isAttackerA ? "text-primary" : "text-secondary",
                }
            });

            const powerDiff = attacker.overall - defender.overall;
            const knockoutChance = powerDiff >= 0 ? 0.4 : 0.15;

            const isWinnerTeamDefender = defenderTeamTag === winningTeamTag;
            const canEliminate = !isWinnerTeamDefender || activeDefenders.length > 1;

            if (Math.random() < knockoutChance && canEliminate && activeDefenders.length > 1) {
                defender.isAlive = false;

                script.push({
                    targetTeam: defenderTeamTag,
                    targetName: defender.name,
                    isKO: true,
                    log: {
                        id: timeStep++,
                        text: `💥 [K.O.] ${defender.name} falls under overwhelming power!`,
                        icon: Skull,
                        colorClass: "text-orange-500 font-bold",
                    }
                });
            }

            roundNum++;
        }

        // Phase 2: Sweep remaining members of the losing team
        const losingTeam = isTeamAWinner ? tempB : tempA;
        losingTeam.forEach(fighter => {
            if (fighter.isAlive) {
                fighter.isAlive = false;
                script.push({
                    targetTeam: losingTeamTag,
                    targetName: fighter.name,
                    isKO: true,
                    log: {
                        id: timeStep++,
                        text: `💥 [K.O.] ${fighter.name} is eliminated in the final offensive!`,
                        icon: Skull,
                        colorClass: "text-orange-500 font-bold",
                    }
                });
            }
        });

        // Phase 3: Final Banner
        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const winType = diff > 15 ? "Decisive Wipeout" : "Hard-Fought Victory";

        script.push({
            targetTeam: losingTeamTag,
            isFinish: true,
            log: {
                id: timeStep++,
                text: `🏆 [FINISH] Battle Over: ${winnerName} secures victory via ${winType} (${ROUNDS} Rounds)!`,
                icon: Trophy,
                colorClass: "text-amber-400 font-black",
            }
        });

        // Reset rosters to full health before starting playback
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
    }, [seed, isMounted]); // 👈 Now strictly depends on `seed` changes!

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
                    <button
                        type="button"
                        disabled={isPlaying}
                        onClick={() => setSeed((s) => s + 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Swords className={`size-3.5 ${isPlaying ? "animate-pulse text-primary" : ""}`} />
                        {isPlaying ? "Simulating..." : "Replay Battle"}
                    </button>
                </div>

                {result && seed > 0 ? (
                    <SparSimulation result={result} nameA={nameA} nameB={nameB} />
                ) : (
                    <div className="h-full border border-dashed border-muted-foreground/30 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                        <Swords className="size-6 animate-bounce text-primary" />
                        <p className="text-xs font-medium">Ready to simulate combat. Click "Replay Battle" above to begin!</p>
                    </div>
                )}


                {result && seed > 0 ? (
                    <>
                        <LiveTeamHealthBars
                            healthA={healthA}
                            healthB={healthB}
                            nameA={nameA}
                            nameB={nameB}
                        />

                        <LiveRosterStatus
                            rosterA={rosterA}
                            rosterB={rosterB}
                        />
                    </>
                ) : (
                    <div className="h-full border border-dashed border-muted-foreground/30 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                        <Swords className="size-6 animate-bounce text-secondary" />
                        <p className="text-xs font-medium">Ready to simulate combat. Click "Replay Battle" above to begin!</p>
                    </div>
                )}



                {seed === 0 ? (
                    <div className="h-full border border-dashed border-muted-foreground/30 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                        <Swords className="size-6 text-muted-foreground/60" />
                        <p className="text-xs font-medium">Engagement logs will appear here once the battle starts.</p>
                    </div>
                ) : (
                    <BattleTimelineLogs
                        logs={visibleLogs}
                    />
                )}

                <TacticalSummary
                    isMounted={isMounted}
                    nameA={nameA}
                    nameB={nameB}
                    powerEstimateA={powerEstimateA}
                    powerEstimateB={powerEstimateB}
                    seed={seed}
                />
            </div>
        </div>
    );
}