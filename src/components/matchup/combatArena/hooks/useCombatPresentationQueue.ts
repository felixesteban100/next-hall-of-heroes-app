import { useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CombatEvent } from "@/lib/matchup/combat/types/types";

type PresentationItem = {
    event?: CombatEvent;
    onComplete?: () => void;
};

function getEventDisplayDuration(event: CombatEvent): number {
    switch (event.type) {
        case "battle_end":
            return 6000;

        case "ko":
            return 4500;

        case "revive":
            return 4000;

        case "heal":
            return 3500;

        case "round_start":
            return 2500;

        case "turn_start-A":
        case "turn_start-B":
            return 2000;

        default:
            return event.isKO ? 4500 : 3500;
    }
}

export function useCombatPresentationQueue(
    setVisibleEvents: Dispatch<SetStateAction<CombatEvent[]>>
) {
    const presentationQueueRef = useRef<PresentationItem[]>([]);
    const isPresentingRef = useRef(false);
    const presentationTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);
    const processQueueRef = useRef<() => void>(() => { });

    const processNextEvent = useCallback(() => {
        const item = presentationQueueRef.current.shift();

        // Nothing left to display.
        if (!item) {
            isPresentingRef.current = false;
            return;
        }

        // Execute callbacks after the preceding events have finished.
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

        setVisibleEvents((previous) => [...previous, event]);

        presentationTimerRef.current = setTimeout(() => {
            presentationTimerRef.current = null;
            processQueueRef.current();
        }, getEventDisplayDuration(event));
    }, [setVisibleEvents]);

    processQueueRef.current = processNextEvent;

    const enqueueEvents = useCallback(
        (events: CombatEvent[], onComplete?: () => void) => {
            events.forEach((event) => {
                presentationQueueRef.current.push({ event });
            });

            if (onComplete) {
                presentationQueueRef.current.push({ onComplete });
            }

            if (!isPresentingRef.current) {
                isPresentingRef.current = true;
                processQueueRef.current();
            }
        },
        []
    );

    const resetQueue = useCallback(() => {
        if (presentationTimerRef.current) {
            clearTimeout(presentationTimerRef.current);
            presentationTimerRef.current = null;
        }

        presentationQueueRef.current = [];
        isPresentingRef.current = false;
    }, []);

    return {
        enqueueEvents,
        isPresentingRef,
        resetQueue,
    };
}
