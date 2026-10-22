"use client";

import { useEffect, useMemo, useState } from "react";
import { Swords, Maximize2 } from "lucide-react";
import { simulateSpar } from "@/lib/compare/compare_utls";
import { RoundDistributionChart } from "../bracket/RoundDistributionChart";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ControlToolbar from "./battlePanel/ControlToolbar";
import CombatView from "./battlePanel/CombatView";
import { useCombatScript } from "./battlePanel/useCombatScript";
import { useCombatPlayback } from "./battlePanel/useCombatPlayback";

export const ROUNDS = 100;

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
};

export type FighterState = {
    name: string;
    overall: number;
    isAlive: boolean;
    powers?: any[];
    hasRevived?: boolean;
};

export type ScriptItem = {
    log: Log;
    targetTeam: "A" | "B";
    targetName?: string;
    isKO?: boolean;
    isRevive?: boolean;
    isHeal?: boolean;
    healTeam?: "A" | "B";
    isFinish?: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
    powerEstimateA: number;
    powerEstimateB: number;
    nameA?: string;
    nameB?: string;
    teamAChars?: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars?: CharacterWithJoinTeamUniversePowerEnemies[];
};

export function BattlePanel({
    powerEstimateA,
    powerEstimateB,
    nameA = "Team A",
    nameB = "Team B",
    teamAChars = [],
    teamBChars = [],
}: Props) {
    const [seed, setSeed] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const result = useMemo(() => {
        if (!isMounted) return null;
        void seed;
        return simulateSpar(powerEstimateA, powerEstimateB, ROUNDS);
    }, [powerEstimateA, powerEstimateB, seed, isMounted]);

    const buildScript = useCombatScript(
        teamAChars, teamBChars, nameA, nameB,
        result?.aWins ?? 0, result?.bWins ?? 0
    );

    const {
        combatScript, currentStepIndex, isPlaying,
        rosterA, rosterB, healthA, healthB, visibleLogs,
        loadScript, handleNextStep, handlePrevStep, togglePlayPause,
    } = useCombatPlayback(teamAChars, teamBChars, nameA, nameB);

    // Generate a new script whenever seed bumps (and result is ready)
    useEffect(() => {
        if (!isMounted || !result || seed === 0) return;
        const { script, initialA, initialB } = buildScript();
        loadScript(script, initialA, initialB);
    }, [seed, isMounted, result]);

    const handleToggle = () => {
        if (combatScript.length === 0) setSeed((s) => s + 1);
        else togglePlayPause();
    };

    const handleReset = () => setSeed((s) => s + 1);

    if (!powerEstimateA || !powerEstimateB) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select for both sides to run a spar simulation
            </p>
        );
    }

    const sharedCombatViewProps = {
        result,
        nameA, nameB,
        healthA, healthB,
        rosterA, rosterB,
        visibleLogs,
        isMounted,
        powerEstimateA, powerEstimateB,
        seed,
        teamAChars, teamBChars,
    };

    const toolbar = (
        <ControlToolbar
            onReset={handleReset}
            combatScript={combatScript}
            currentStepIndex={currentStepIndex}
            handleNextStep={handleNextStep}
            handlePrevStep={handlePrevStep}
            isPlaying={isPlaying}
            togglePlayPause={handleToggle}
        />
    );

    return (
        <div className="gap-4">
            <div className="border border-muted-foreground/20 rounded-xl p-4 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Combat simulation
                    </h3>
                    <div className="flex items-center gap-2">
                        {toolbar}

                        {/* Expand dialog (desktop only) */}
                        <div className="hidden md:block">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Maximize2 className="size-4 cursor-pointer hover:text-primary transition-colors" />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[92vw] max-h-[90vh] flex flex-col gap-4 overflow-hidden p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-base font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                                            <span className="flex gap-2 items-center">
                                                <Swords className="size-5 text-primary" />
                                                Live Engagement Overview ({nameA} vs {nameB})
                                            </span>
                                            <div className="pr-4">{toolbar}</div>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <CombatView {...sharedCombatViewProps} isDialog />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <CombatView {...sharedCombatViewProps} isDialog={false} />

                <RoundDistributionChart
                    aWins={result?.aWins}
                    bWins={result?.bWins}
                    draws={result?.draws}
                    nameA={nameA}
                    nameB={nameB}
                />
            </div>
        </div>
    );
}