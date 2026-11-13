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

function getEventDisplayDuration(event: CombatEvent): number {
    switch (event.type) {
        case "battle_end":
            return 6000;

        case "ko":
            // case "rout":
            return 4500;

        case "revive":
            return 4000;

        case "heal":
            return 3500;

        case "round_start":
            return 2500;

        case "turn_start":
            return 2000;

        default:
            return event.isKO ? 4500 : 3500;
    }
}

type PresentationItem = {
    event?: CombatEvent;
    onComplete?: () => void;
};

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

    const [previousHpById, setPreviousHpById] = useState<Record<number, number>>({});

    const presentationQueueRef = useRef<PresentationItem[]>([]);
    const isPresentingRef = useRef(false);

    const presentationTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const processQueueRef = useRef<() => void>(() => { });

    const processNextEvent = useCallback(() => {
        const item = presentationQueueRef.current.shift();

        // Nothing left to display
        if (!item) {
            isPresentingRef.current = false;
            return;
        }

        // Execute callbacks after the preceding events have finished
        if (item.onComplete) {
            item.onComplete();
            processQueueRef.current();
            return;
        }

        if (!item.event) {
            processQueueRef.current();
            return;
        }

        const event = item.event;

        isPresentingRef.current = true;

        // Display this event
        setVisibleEvents((prev) => [...prev, event]);

        // Keep it visible before advancing to the next event
        presentationTimerRef.current = setTimeout(() => {
            presentationTimerRef.current = null;
            processQueueRef.current();
        }, getEventDisplayDuration(event));
    }, []);

    processQueueRef.current = processNextEvent;

    const enqueueEvents = useCallback(
        (events: CombatEvent[], onComplete?: () => void) => {
            events.forEach((event) => {
                presentationQueueRef.current.push({ event });
            });

            if (onComplete) {
                presentationQueueRef.current.push({ onComplete });
            }

            // Start processing only if another event isn't already displaying
            if (!isPresentingRef.current) {
                isPresentingRef.current = true;
                processQueueRef.current();
            }
        },
        []
    );

    useEffect(() => {
        if (teamAChars.length === 0 || teamBChars.length === 0) return;

        // Clear any previous presentation
        if (presentationTimerRef.current) {
            clearTimeout(presentationTimerRef.current);
            presentationTimerRef.current = null;
        }

        presentationQueueRef.current = [];
        isPresentingRef.current = false;

        const engine = new CombatEngine();

        engine.initialize(teamAChars, teamBChars, playerSide);

        engineRef.current = engine;

        setState({ ...engine.getState() });
        setVisibleEvents([]);

        return () => {
            if (presentationTimerRef.current) {
                clearTimeout(presentationTimerRef.current);
            }

            presentationQueueRef.current = [];
            isPresentingRef.current = false;
        };
    }, [teamAChars, teamBChars, playerSide]);

    const handleAction = useCallback((action: CombatAction) => {
        if (!engineRef.current) return;

        // Capture HP before the engine applies the action.
        const fightersBeforeAction = engineRef.current.getState().fighters;

        const previousHp = Object.fromEntries(
            fightersBeforeAction.map((fighter) => [
                fighter.id,
                fighter.currentHp,
            ])
        );

        setPreviousHpById(previousHp);

        const newEvents = engineRef.current.performAction(action);

        const freshState = engineRef.current.getState();
        setState({ ...freshState });

        enqueueEvents(newEvents);
    }, [enqueueEvents]);

    const handleSelectActor = useCallback((id: number) => {
        engineRef.current?.selectActor(id);
        setState({ ...engineRef.current!.getState() });
    }, []);

    const handleDeselectActor = useCallback(() => {
        engineRef.current?.deselectActor();
        setTargetMode(null);

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
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

        const runAI = () => {
            // Don't let the AI act while previous events are being presented
            if (isPresentingRef.current) {
                const waitTimer = setTimeout(runAI, 250);
                timers.push(waitTimer);
                return;
            }

            const engine = engineRef.current;
            if (!engine) return;

            const prevEventCount = engine.getState().events.length;

            const action = engine.chooseAIAction();

            if (action) {
                // Capture HP before the AI action.
                const fightersBeforeAction = engine.getState().fighters;

                const previousHp = Object.fromEntries(
                    fightersBeforeAction.map((fighter) => [
                        fighter.id,
                        fighter.currentHp,
                    ])
                );

                setPreviousHpById(previousHp);

                engine.performAction(action);

                const generatedEvents = engine
                    .getState()
                    .events.slice(prevEventCount);

                // Queue all AI events and update the UI after the last one
                enqueueEvents(generatedEvents, () => {
                    setState({ ...engine.getState() });
                });
            } else {
                engine.startPlayerPhase();
                setState({ ...engine.getState() });
            }
        };

        // Give the player 1.8 seconds before the AI starts thinking
        const aiThinkTimer = setTimeout(runAI, 1800);

        timers.push(aiThinkTimer);

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [
        state?.phase,
        state?.availableAIIds,
        state?.winner,
        enqueueEvents,
    ]);

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
                <div className="flex w-full flex-col gap-2 text-sm text-muted-foreground">
                    {/* {state.isPlayerTurn && !state.winner && (
                        <CommandPanel
                            state={state}
                            onAction={handleAction}
                            onTargetModeChange={setTargetMode}
                        />
                    )} */}
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
                        onDeselectActor={handleDeselectActor}
                        validTargetIds={targetMode?.validIds ?? []}
                        isTargetSelectionActive={targetMode?.active ?? false}
                        commandPanelProps={{
                            state,
                            onAction: handleAction,
                            onTargetModeChange: setTargetMode,
                        }}
                        renderCommandPanel={(onClose) => (
                            <CommandPanel
                                state={state}
                                onAction={handleAction}
                                onTargetModeChange={setTargetMode}
                                onClose={onClose}
                                compact
                            />
                        )}
                        previousHpById={previousHpById}
                    />
                </div>
            </div>
        </div>
    );
}