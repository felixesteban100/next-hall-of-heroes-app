"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CombatEngine } from "@/lib/matchup/combat/engine/CombatEngine";
import type {
    CombatState,
    CombatAction,
    CombatEvent,
    Side,
} from "@/lib/matchup/combat/types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CombatHeader } from "./components/CombatHeader";
import CinematicCombatView from "./components/cinematicCombatView/CinematicCombatView";
import {
    CombatProvider,
    type TargetMode,
} from "./components/cinematicCombatView/context/CombatContext";

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
    const targetModeRef = useRef<TargetMode | null>(null);

    const [previousHpById, setPreviousHpById] = useState<Record<number, number>>({});

    const presentationQueueRef = useRef<PresentationItem[]>([]);
    const isPresentingRef = useRef(false);

    const presentationTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const processQueueRef = useRef<() => void>(() => { });

    const handleTargetModeChange = useCallback(
        (next: TargetMode | null) => {
            const previous = targetModeRef.current;

            // Preserve selected targets when only the callbacks are refreshed.
            const shouldPreserveSelection =
                previous !== null &&
                next !== null &&
                previous.active === next.active &&
                previous.selectionMode === next.selectionMode &&
                previous.validIds.length === next.validIds.length &&
                previous.validIds.every(
                    (id, index) => id === next.validIds[index]
                );

            const normalizedNext =
                shouldPreserveSelection && next.selectedIds === undefined
                    ? {
                        ...next,
                        selectedIds: previous.selectedIds ?? [],
                    }
                    : next;

            // Always keep the latest callbacks.
            targetModeRef.current = normalizedNext;

            const unchanged =
                previous === null && normalizedNext === null ||
                (
                    previous !== null &&
                    normalizedNext !== null &&
                    previous.active === normalizedNext.active &&
                    previous.selectionMode === normalizedNext.selectionMode &&
                    previous.validIds.length === normalizedNext.validIds.length &&
                    previous.validIds.every(
                        (id, index) => id === normalizedNext.validIds[index]
                    ) &&
                    (previous.selectedIds ?? []).length ===
                    (normalizedNext.selectedIds ?? []).length &&
                    (previous.selectedIds ?? []).every(
                        (id, index) =>
                            id === (normalizedNext.selectedIds ?? [])[index]
                    )
                );

            if (!unchanged) {
                setTargetMode(normalizedNext);
            }
        },
        []
    );

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

        engine.initialize(teamAChars, teamBChars, playerSide, nameA, nameB);

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
    }, [teamAChars, teamBChars, playerSide, nameA, nameB]);

    const handleAction = useCallback((action: CombatAction) => {
        const engine = engineRef.current;
        if (!engine) return;

        // Capture HP before the action.
        const fightersBeforeAction = engine.getState().fighters;

        const previousHp = Object.fromEntries(fightersBeforeAction.map((fighter) => [fighter.id, fighter.currentHp]));

        setPreviousHpById(previousHp);

        // Capture every event generated by the action AND phase transitions.
        const previousEventCount = engine.getState().events.length;

        engine.performAction(action, true);

        const freshState = engine.getState();
        const generatedEvents = freshState.events.slice(previousEventCount);

        setState({ ...freshState });

        enqueueEvents(generatedEvents, () => {
            const previousCount = engine.getState().events.length;

            engine.completeActionPhase(action.actorId);

            const nextState = engine.getState();
            const nextEvents = nextState.events.slice(previousCount);

            setState({ ...nextState });
            enqueueEvents(nextEvents);
        });
    }, [enqueueEvents]);

    const handleStartBattle = useCallback((firstSide: Side) => {
        const engine = engineRef.current;
        if (!engine || engine.getState().battleStarted) return;

        const previousEventCount = engine.getState().events.length;

        engine.startBattle(firstSide);

        const freshState = engine.getState();
        const generatedEvents = freshState.events.slice(previousEventCount);

        setState({ ...freshState });
        enqueueEvents(generatedEvents);
    }, [enqueueEvents]);

    const handleSelectActor = useCallback((id: number) => {
        const engine = engineRef.current;
        if (!engine) return;

        engine.selectActor(id);
        setState({ ...engine.getState() });
    }, []);

    const handleDeselectActor = useCallback(() => {
        targetModeRef.current = null;
        setTargetMode(null);

        engineRef.current?.deselectActor();

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
    }, []);

    const handleSelectTarget = useCallback((id: number) => {
        const currentTargetMode = targetModeRef.current;

        if (currentTargetMode?.active) {
            if (!currentTargetMode.validIds.includes(id)) return;

            // Multiple selection: toggle the selected target.
            if (currentTargetMode.selectionMode === "multiple") {
                const selectedIds = currentTargetMode.selectedIds ?? [];

                const nextSelectedIds = selectedIds.includes(id)
                    ? selectedIds.filter((selectedId) => selectedId !== id)
                    : [...selectedIds, id];

                const nextMode = {
                    ...currentTargetMode,
                    selectedIds: nextSelectedIds,
                };

                targetModeRef.current = nextMode;
                setTargetMode(nextMode);

                return;
            }

            // Single selection: preserve the existing behavior.
            currentTargetMode.onConfirm(id);

            targetModeRef.current = null;
            setTargetMode(null);

            return;
        }

        engineRef.current?.selectTarget(id);

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
    }, []);

    useEffect(() => {
        if (
            !state ||
            !state.battleStarted ||
            state.phase !== "ai" ||
            state.winner
        ) return;

        const timers: ReturnType<typeof setTimeout>[] = [];

        const runAI = () => {
            console.log("[AI DEBUG] runAI started", {
                phase: engineRef.current?.getState().phase,
                isPresenting: isPresentingRef.current,
                availableAIIds: engineRef.current?.getState().availableAIIds,
            });
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

            console.log("[AI DEBUG] chosen action:", action);

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

                const actionEvents = engine.performAction(action, true);
                console.log("[AI DEBUG] action events:", actionEvents);

                if (actionEvents.length === 0) {
                    engine.finishAIPhase();
                }

                const freshState = engine.getState();
                const generatedEvents = freshState.events.slice(prevEventCount);

                setState({ ...freshState });

                if (actionEvents.length > 0) {
                    enqueueEvents(generatedEvents, () => {
                        const previousCount = engine.getState().events.length;

                        engine.completeActionPhase(action.actorId);

                        const nextState = engine.getState();
                        const nextEvents = nextState.events.slice(previousCount);

                        setState({ ...nextState });
                        enqueueEvents(nextEvents);
                    });
                } else {
                    enqueueEvents(generatedEvents);
                }
            } else {
                engine.finishAIPhase();

                const freshState = engine.getState();
                const generatedEvents = freshState.events.slice(prevEventCount);

                setState({ ...freshState });

                enqueueEvents(generatedEvents);
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
        state?.battleStarted,
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
        <div className="flex flex-col gap-3 relative border border-muted-foreground/20 rounded-xl p-3">
            <CombatHeader state={state} nameA={nameA} nameB={nameB} />
            <CombatProvider
                value={{
                    state,
                    targetMode,
                    onAction: handleAction,
                    onSelectActor: handleSelectActor,
                    onSelectTarget: handleSelectTarget,
                    onDeselectActor: handleDeselectActor,
                    onTargetModeChange: handleTargetModeChange,
                }}
            >
                <CinematicCombatView
                    fightersA={rosterA}
                    fightersB={rosterB}
                    events={visibleEvents}
                    teamAChars={teamAChars}
                    teamBChars={teamBChars}
                    playerSide={state.playerSide}
                    previousHpById={previousHpById}
                    battleStarted={state.battleStarted}
                    onStartBattle={handleStartBattle}
                />
            </CombatProvider>
        </div>
    );
}