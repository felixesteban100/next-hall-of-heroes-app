// components/compare/SparPanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dices, Swords, Zap, Shield, Sparkles, Flame, BrainCircuit, Skull, Trophy } from "lucide-react";
import { simulateSpar } from "@/lib/compare/compare_utls";
import { RoundDistributionChart } from "./RoundDistributionChart";
import { StatsRadar } from "./StatRadar";
import { getTacticalInsight } from "@/lib/compare/teamChemistry";

export const ROUNDS = 100;

type CharacterInfo = { name: string };

type Props = {
    radar: {
        stat: string;
        full: "speed" | "intelligence" | "strength" | "durability" | "power" | "combat" | "total";
        A: number;
        B: number;
    }[]
    powerEstimateA: number;
    powerEstimateB: number;
    nameA?: string;
    nameB?: string;
    teamAChars?: CharacterInfo[];
    teamBChars?: CharacterInfo[];
    showRadarA: boolean;
    showRadarB: boolean;
};

// 🌟 Varied stat-driven action library with unique icons and colors
const STAT_ACTIONS = [
    { stat: "strength", text: "crushed defenses with an overwhelming blow against", icon: Swords, color: "text-red-400" },
    { stat: "speed", text: "blitzed past the guard of", icon: Zap, color: "text-amber-400" },
    { stat: "intelligence", text: "outsmarted and countered a strike from", icon: Shield, color: "text-blue-400" },
    { stat: "power", text: "unleashed an explosive energy surge obliterating", icon: Flame, color: "text-purple-400" },
    { stat: "durability", text: "shrugged off a barrage and countered", icon: Sparkles, color: "text-emerald-400" },
    { stat: "combat", text: "demonstrated master-class martial supremacy over", icon: Swords, color: "text-rose-400" },
];

function getRandomChar(chars?: CharacterInfo[], fallbackName = "Fighter") {
    if (!chars || chars.length === 0) return { name: fallbackName };
    return chars[Math.floor(Math.random() * chars.length)];
}

type Log = { id: number; text: string; icon: any; colorClass: string }

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
    const [tacticalSummary, setTacticalSummary] = useState<string>(""); // 👈 Handle via state

    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 🎬 Finite, narrative-driven combat timeline generation
    // 🎬 Sequential, timed reveal of combat events
    useEffect(() => {
        if (!isMounted) return;

        setVisibleLogs([]); // Reset log display when seed or teams change

        const fullTimeline: Log[] = [];
        let timeStep = 1;

        // Generate 5 dynamic exchanges
        for (let i = 0; i < 5; i++) {
            const isTeamAAttacking = Math.random() > 0.5;
            const attackerObj = getRandomChar(isTeamAAttacking ? teamAChars : teamBChars, isTeamAAttacking ? nameA : nameB);
            const defenderObj = getRandomChar(isTeamAAttacking ? teamBChars : teamAChars, isTeamAAttacking ? nameB : nameA);

            if (attackerObj.name === defenderObj.name) continue;

            const action = STAT_ACTIONS[Math.floor(Math.random() * STAT_ACTIONS.length)];
            const Icon = action.icon;

            fullTimeline.push({
                id: timeStep++,
                text: `[RND ${i * 15 + 5}] ${attackerObj.name} ${action.text} ${defenderObj.name}!`,
                icon: Icon,
                colorClass: action.color,
            });
        }

        // Knockout event
        const losingTeamName = powerEstimateA > powerEstimateB ? nameB : nameA;
        const losingChars = powerEstimateA > powerEstimateB ? teamBChars : teamAChars;
        const fallenHero = getRandomChar(losingChars, losingTeamName);

        fullTimeline.push({
            id: timeStep++,
            text: `💥 [RND 75] ${fallenHero.name} takes critical damage and is forced down!`,
            icon: Skull,
            colorClass: "text-orange-500 font-bold",
        });

        // Conclusion event
        const winnerName = powerEstimateA > powerEstimateB ? nameA : nameB;
        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const winType = diff > 15 ? "Decisive Blowout" : "Hard-Fought Decision";

        fullTimeline.push({
            id: timeStep++,
            text: `🏆 [FINISH] Simulation Concluded: ${winnerName} secures victory via ${winType} (${ROUNDS} Rounds)!`,
            icon: Trophy,
            colorClass: "text-amber-400 font-black",
        });

        // Reveal entries one by one every 1.8 seconds
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < fullTimeline.length) {
                const nextLog = fullTimeline[currentIndex];
                setVisibleLogs((prev) => [...prev, nextLog]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 1800);

        return () => clearInterval(interval);
    }, [teamAChars, teamBChars, nameA, nameB, powerEstimateA, powerEstimateB, seed, isMounted]);

    useEffect(() => {
        if (!isMounted) return;
        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const leader = powerEstimateA > powerEstimateB ? nameA : nameB;
        const underdog = powerEstimateA > powerEstimateB ? nameB : nameA;
        setTacticalSummary(getTacticalInsight(nameA, nameB, diff, leader, underdog));
    }, [isMounted, nameA, nameB, powerEstimateA, powerEstimateB, seed]);

    // Auto-scroll to bottom as new items arrive
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [visibleLogs]);

    const result = useMemo(() => {
        if (!isMounted) return null;
        void seed;
        return simulateSpar(powerEstimateA, powerEstimateB, ROUNDS);
    }, [powerEstimateA, powerEstimateB, seed, isMounted]);


    if (powerEstimateA == null || powerEstimateB == null) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select for both sides to run a spar simulation
            </p>
        );
    }

    const totalRounds = ROUNDS;
    const aPct = result ? (result.aWins / totalRounds) * 100 : 0;
    const drawPct = result ? (result.draws / totalRounds) * 100 : 0;
    const bPct = result ? (result.bWins / totalRounds) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-border  border-muted-foreground/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                        Stats radar
                    </h3>
                    <StatsRadar data={radar} nameA={nameA} nameB={nameB} showA={showRadarA} showB={showRadarB} />
                </div>
                <RoundDistributionChart
                    aWins={result?.aWins}
                    bWins={result?.bWins}
                    draws={result?.draws}
                    nameA={nameA}
                    nameB={nameB}
                />
            </div>
            <SparPanel
                setSeed={setSeed}
                result={result}
                nameA={nameA}
                nameB={nameB}
                aPct={aPct}
                drawPct={drawPct}
                bPct={bPct}
                logs={visibleLogs}
                tacticalSummary={tacticalSummary}
                logContainerRef={logContainerRef}
            />
        </div>
    );
}

function SparPanel({ setSeed, result, nameA, nameB, aPct, drawPct, bPct, logs, tacticalSummary, logContainerRef }: {
    setSeed: (value: number | ((prev: number) => number)) => void;
    result: {
        aWins: number;
        bWins: number;
        draws: number;
        aWinPct: number;
        bWinPct: number;
        drawPct: number;
    } | null
    nameA: string;
    nameB: string;
    aPct: number;
    drawPct: number;
    bPct: number;
    logs: Log[];
    tacticalSummary: string;
    logContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        /* min-h-[140px] */
        <div className="rounded-xl border border-muted-foreground/20 p-4 space-y-3  flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Spar simulation ({ROUNDS} rounds)
                </h3>
                <button
                    type="button"
                    onClick={() => setSeed((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                >
                    <Dices className="size-3.5" />
                    Roll again
                </button>
            </div>

            {!result ? (
                <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
                    Calculating simulation...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-lg font-black text-primary">{result.aWins}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{nameA}</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-muted-foreground">{result.draws}</p>
                            <p className="text-[10px] text-muted-foreground">Draws / Toss-ups</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-secondary">{result.bWins}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{nameB}</p>
                        </div>
                    </div>

                    {/* 3-Way Split Progress Bar */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                        <div className="h-full bg-primary transition-all" style={{ width: `${aPct}%` }} />
                        <div className="h-full bg-muted-foreground/40 transition-all" style={{ width: `${drawPct}%` }} />
                        <div className="h-full bg-secondary transition-all" style={{ width: `${bPct}%` }} />
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground">
                        Toy model from overall scores — not canon. {nameA} win rate ≈ {Math.round(aPct)}%
                    </p>
                </>
            )}

            {/* ⚔️ BATTLE TIMELINE LOGS (SEQUENTIAL REVEAL & FULL TEXT WRAPPING) */}
            <div className="pt-2 border-t border-muted-foreground/10 flex flex-col gap-1.5 min-h-[200px]">
                <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <span className="flex items-center gap-1">
                        <Swords className="size-3 text-primary animate-pulse" /> Battle Timeline Log
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">{logs.length} Events</span>
                </div>
                <div
                    ref={logContainerRef}
                    className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 scroll-smooth"
                >
                    {logs.map((log) => {
                        const Icon = log.icon;
                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-2 text-[11px] p-2 rounded-md bg-muted/20 border border-muted-foreground/10 transition-all duration-300 animate-in fade-in slide-in-from-top-1"
                            >
                                <Icon className={`size-3.5 shrink-0 mt-0.5 ${log.colorClass}`} />
                                <span className="text-foreground/90 whitespace-normal break-words leading-snug">
                                    {log.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 🧠 AI TACTICAL SUMMARY */}
            <div className="pt-2 border-t border-muted-foreground/10 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <BrainCircuit className="size-3 text-cyan-400" /> Tactical Insight
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded-md border border-muted-foreground/10">
                    {tacticalSummary}
                </p>
            </div>
        </div>
    )
}