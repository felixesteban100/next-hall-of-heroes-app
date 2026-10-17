// components/compare/SparPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Dices, Swords, Zap, Shield, Sparkles, Flame, BrainCircuit } from "lucide-react";
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

const COMBAT_ACTIONS = [
    { text: "landed a devastating heavy strike on", icon: Swords, color: "text-red-400" },
    { text: "outmaneuvered and blitzed", icon: Zap, color: "text-amber-400" },
    { text: "predicted the attack vector of", icon: Shield, color: "text-blue-400" },
    { text: "unleashed an overwhelming energy burst against", icon: Flame, color: "text-purple-400" },
    { text: "absorbed a massive direct assault from", icon: Sparkles, color: "text-emerald-400" },
];

function getRandomChar(chars?: CharacterInfo[], fallbackName = "Fighter") {
    if (!chars || chars.length === 0) return fallbackName;
    const randomItem = chars[Math.floor(Math.random() * chars.length)];
    return randomItem?.name || fallbackName;
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
    const [logs, setLogs] = useState<Log[]>([]);
    const [tacticalSummary, setTacticalSummary] = useState<string>(""); // 👈 Handle via state

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Recalculate Tactical Insight ONLY on client-side mount & when seed/names change
    useEffect(() => {
        if (!isMounted) return;

        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const leader = powerEstimateA > powerEstimateB ? nameA : nameB;
        const underdog = powerEstimateA > powerEstimateB ? nameB : nameA;

        setTacticalSummary(getTacticalInsight(nameA, nameB, diff, leader, underdog));
    }, [isMounted, nameA, nameB, powerEstimateA, powerEstimateB, seed]);

    // Generate Combat Ticker lines
    useEffect(() => {
        const generateLog = () => {
            const isTeamAAttacking = Math.random() > 0.5;
            const attacker = getRandomChar(isTeamAAttacking ? teamAChars : teamBChars, isTeamAAttacking ? nameA : nameB);
            const defender = getRandomChar(isTeamAAttacking ? teamBChars : teamAChars, isTeamAAttacking ? nameB : nameA);

            if (attacker === defender) return;

            const action = COMBAT_ACTIONS[Math.floor(Math.random() * COMBAT_ACTIONS.length)];
            const Icon = action.icon;

            const newLog = {
                id: Date.now() + Math.random(),
                text: `${attacker} ${action.text} ${defender}!`,
                icon: Icon,
                colorClass: action.color,
            };

            setLogs((prev) => [newLog, ...prev.slice(0, 3)]); // Keeps top lines
        };

        generateLog();
        const interval = setInterval(generateLog, 2500);
        return () => clearInterval(interval);
    }, [teamAChars, teamBChars, nameA, nameB, seed]);

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
                logs={logs}
                tacticalSummary={tacticalSummary}
            />
        </div>
    );
}

function SparPanel({ setSeed, result, nameA, nameB, aPct, drawPct, bPct, logs, tacticalSummary }: {
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
    tacticalSummary: string
}) {
    return (
        <div className="rounded-xl border border-muted-foreground/20 p-4 space-y-3 min-h-[140px] flex flex-col justify-between">
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

            {/* ⚔️ LIVE COMBAT TICKER */}
            <div className="pt-2 border-t border-muted-foreground/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <span className="flex items-center gap-1">
                        <Swords className="size-3 text-primary animate-pulse" /> Combat Ticker
                    </span>
                </div>
                <div className="flex flex-col gap-1 min-h-[140px]">
                    {logs.map((log, idx) => {
                        const Icon = log.icon;
                        return (
                            <div
                                key={log.id}
                                className={`flex items-center gap-2 text-[11px] p-1.5 rounded-md bg-muted/30 border border-muted-foreground/10 transition-all duration-300 animate-in fade-in ${idx === 0 ? "opacity-100 font-medium" : "opacity-50 text-[10px]"
                                    }`}
                            >
                                <Icon className={`size-3 shrink-0 ${log.colorClass}`} />
                                <span className="truncate text-foreground/90">{log.text}</span>
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