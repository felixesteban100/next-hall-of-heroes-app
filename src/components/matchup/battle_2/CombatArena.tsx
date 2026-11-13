"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CombatEngine } from "@/lib/matchup/combat/CombatEngine";
import type {
    CombatState,
    CombatAction,
    CombatEvent,
} from "@/lib/matchup/combat/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CombatHeader } from "./CombatHeader";
import { CommandPanel } from "./CommandPanel";
import CinematicCombatView from "./combatArena/CinematicCombatView";

type TargetMode = {
    active: boolean;
    validIds: number[];
    onConfirm: (targetId: number) => void;
};

type Props = {
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA?: string;
    nameB?: string;
    playerSide?: "A" | "B";
};

export function CombatArena({
    teamAChars,
    teamBChars,
    nameA = "Team A",
    nameB = "Team B",
    playerSide = "A",
}: Props) {
    const engineRef = useRef<CombatEngine | null>(null);
    const [state, setState] = useState<CombatState | null>(null);
    const [visibleEvents, setVisibleEvents] = useState<CombatEvent[]>([]);
    const [targetMode, setTargetMode] = useState<TargetMode | null>(null);

    // Initialize engine
    useEffect(() => {
        if (teamAChars.length === 0 || teamBChars.length === 0) return;

        const engine = new CombatEngine();
        engine.initialize(teamAChars, teamBChars, playerSide);
        engineRef.current = engine;
        setState({ ...engine.getState() });
        setVisibleEvents([]);
    }, [teamAChars, teamBChars, playerSide]);

    const handleAction = useCallback((action: CombatAction) => {
        if (!engineRef.current) return;

        const newEvents = engineRef.current.performAction(action);

        // Force a fresh copy of the state
        const freshState = engineRef.current.getState();
        setState({ ...freshState });
        setVisibleEvents((prev) => [...prev, ...newEvents]);
    }, []);

    const handleSelectActor = useCallback((id: number) => {
        engineRef.current?.selectActor(id);
        setState({ ...engineRef.current!.getState() });
    }, []);


    const handleSelectTarget = useCallback((id: number) => {
        if (targetMode?.active) {
            if (!targetMode.validIds.includes(id)) return;

            targetMode.onConfirm(id);
            setTargetMode(null);
            return;
        }

        engineRef.current?.selectTarget(id);

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
    }, [targetMode]);

    useEffect(() => {
        if (!state || state.phase !== "ai" || state.winner) return;

        const timers: ReturnType<typeof setTimeout>[] = [];

        // 1. Wait 1800ms after your turn ends so you can finish reading your own action
        const aiThinkTimer = setTimeout(() => {
            const engine = engineRef.current;
            if (!engine) return;

            // Track where the engine's event log was before the AI acts
            const prevEventCount = engine.getState().events.length;
            const action = engine.chooseAIAction();

            if (action) {
                engine.performAction(action);
                // Grab all events produced (e.g. the AI's attack/shield AND the new round_start banner)
                const generatedEvents = engine.getState().events.slice(prevEventCount);

                // 2. Stagger each event by 2200ms so ClashCard shows the attack, pauses, then shows Round Start
                generatedEvents.forEach((ev, index) => {
                    const stepTimer = setTimeout(() => {
                        setVisibleEvents((prev) => [...prev, ev]);

                        // Only unlock the player's UI controls on the final event
                        if (index === generatedEvents.length - 1) {
                            setState({ ...engine.getState() });
                        }
                    }, index * 2200);

                    timers.push(stepTimer);
                });
            } else {
                engine.startPlayerPhase();
                setState({ ...engine.getState() });
            }
        }, 1800);

        timers.push(aiThinkTimer);

        return () => timers.forEach(clearTimeout);
    }, [state?.phase, state?.availableAIIds, state?.winner]);

    if (teamAChars.length === 0 || teamBChars.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select fighters for both sides to begin combat
            </p>
        );
    } else if (!state) {
        return (
            <div className="text-center text-sm text-muted-foreground py-10">
                Preparing combat...
            </div>
        );
    }

    // Temporary mapping helpers until we adapt CinematicCombatView
    const rosterA = state.fighters.filter((f) => f.side === "A");
    const rosterB = state.fighters.filter((f) => f.side === "B");

    return (
        <div className="flex flex-col gap-3 relative">
            <div className="border border-muted-foreground/20 rounded-xl p-3 flex flex-col gap-3">
                <CombatHeader state={state} nameA={nameA} nameB={nameB} />
                <div className="min-h-[220px] flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm w-full">
                    {state.isPlayerTurn && !state.winner && (
                        <CommandPanel
                            state={state}
                            onAction={handleAction}
                            onTargetModeChange={setTargetMode}
                        />
                    )}
                    <CinematicCombatView
                        fightersA={rosterA}
                        fightersB={rosterB}
                        events={visibleEvents}
                        teamAChars={teamAChars}
                        teamBChars={teamBChars}
                        nameA={nameA}
                        nameB={nameB}
                        playerSide={state.playerSide}
                        availablePlayerIds={state.availablePlayerIds}
                        selectedActorId={state.selectedActorId}
                        onSelectActor={handleSelectActor}
                        onSelectTarget={handleSelectTarget}
                        isPlayerTurn={state.isPlayerTurn}
                        selectedTargetId={state.selectedTargetId}
                        availableAIIds={state.availableAIIds}

                        validTargetIds={targetMode?.validIds ?? []}
                        isTargetSelectionActive={targetMode?.active ?? false}
                    />
                </div>

                {/* maybe place here the BattleEnd */}
                {/* {state.winner && (
                    <div className="text-center py-2">
                        <p className="text-lg font-bold text-amber-400">
                            Side {state.winner} wins the battle!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {state.winner === playerSide ? "Victory!" : "Defeat"}
                        </p>
                    </div>
                )} */}
            </div>
        </div>
    );
}