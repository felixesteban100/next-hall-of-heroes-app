"use client";

import { useEffect, useMemo, useState } from "react";
import { simulateSpar } from "@/lib/compare";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import ControlToolbar from "./battlePanel/ControlToolbar";
import { useCombatScript } from "./battlePanel/useCombatScript";
import { useCombatPlayback } from "./battlePanel/useCombatPlayback";
import CinematicCombatView from "./battlePanel/CinematicCombatView";

export const ROUNDS = 100;

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
        rosterA, rosterB, visibleLogs,
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
                    </div>
                </div>

                <CinematicCombatView
                    {...sharedCombatViewProps}
                />
            </div>
        </div>
    );
}