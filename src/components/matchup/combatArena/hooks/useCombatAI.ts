import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { CombatEngine } from "@/lib/matchup/combat/engine/CombatEngine";
import type { CombatEvent, CombatState } from "@/lib/matchup/combat/types/types";

type EnqueueEvents = (
    events: CombatEvent[],
    onComplete?: () => void
) => void;

type UseCombatAIOptions = {
    state: CombatState | null;
    engineRef: RefObject<CombatEngine | null>;
    isPresentingRef: RefObject<boolean>;
    enqueueEvents: EnqueueEvents;
    setState: Dispatch<SetStateAction<CombatState | null>>;
    setPreviousHpById: Dispatch<SetStateAction<Record<number, number>>>;
};

export function useCombatAI({
    state,
    engineRef,
    isPresentingRef,
    enqueueEvents,
    setState,
    setPreviousHpById,
}: UseCombatAIOptions) {
    useEffect(() => {
        if (
            !state ||
            !state.battleStarted ||
            state.phase !== "ai" ||
            state.winner
        ) return;

        const timers: ReturnType<typeof setTimeout>[] = [];

        const runAI = () => {
            // console.log("[AI DEBUG] runAI started", {
            //     phase: engineRef.current?.getState().phase,
            //     isPresenting: isPresentingRef.current,
            //     availableAIIds: engineRef.current?.getState().availableAIIds,
            // });

            // Don't let the AI act while previous events are being presented.
            if (isPresentingRef.current) {
                const waitTimer = setTimeout(runAI, 250);
                timers.push(waitTimer);
                return;
            }

            const engine = engineRef.current;
            if (!engine) return;

            const prevEventCount = engine.getState().events.length;
            const action = engine.chooseAIAction();

            // console.log("[AI DEBUG] chosen action:", action);

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
                // console.log("[AI DEBUG] action events:", actionEvents);

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

        // Give the player 1.8 seconds before the AI starts thinking.
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
        engineRef,
        isPresentingRef,
        setState,
        setPreviousHpById,
    ]);
}
