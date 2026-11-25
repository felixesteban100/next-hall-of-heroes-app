
import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CombatEvent } from "@/lib/matchup/combat/types/types";

type PresentationItem = {
    event?: CombatEvent;
    onComplete?: () => void;
};

type AnimationSpeed = 1 | 2;

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
    setVisibleEvents: Dispatch<SetStateAction<CombatEvent[]>>,
    speed: AnimationSpeed = 1
) {
    const presentationQueueRef = useRef<PresentationItem[]>([]);
    const isPresentingRef = useRef(false);

    const presentationTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const timerStartedAtRef = useRef<number | null>(null);
    const timerBaseDurationRef = useRef(0);
    const speedRef = useRef(speed);

    const processQueueRef = useRef<() => void>(() => { });

    const schedulePresentationTimer = useCallback((baseDuration: number) => {
        timerStartedAtRef.current = Date.now();
        timerBaseDurationRef.current = baseDuration;

        presentationTimerRef.current = setTimeout(() => {
            presentationTimerRef.current = null;
            timerStartedAtRef.current = null;
            timerBaseDurationRef.current = 0;

            processQueueRef.current();
        }, baseDuration / speedRef.current);
    }, []);

    const processNextEvent = useCallback(() => {
        const item = presentationQueueRef.current.shift();

        if (!item) {
            isPresentingRef.current = false;
            return;
        }

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

        schedulePresentationTimer(getEventDisplayDuration(event));
    }, [setVisibleEvents, schedulePresentationTimer]);

    processQueueRef.current = processNextEvent;

    // Adjust the active event's remaining time when speed changes.
    useEffect(() => {
        const previousSpeed = speedRef.current;
        speedRef.current = speed;

        if (!presentationTimerRef.current || timerStartedAtRef.current === null) {
            return;
        }

        const elapsed = Date.now() - timerStartedAtRef.current;

        const remainingBaseDuration = Math.max(
            0,
            timerBaseDurationRef.current - elapsed * previousSpeed
        );

        clearTimeout(presentationTimerRef.current);
        presentationTimerRef.current = null;

        if (remainingBaseDuration === 0) {
            timerStartedAtRef.current = null;
            timerBaseDurationRef.current = 0;
            processQueueRef.current();
            return;
        }

        schedulePresentationTimer(remainingBaseDuration);
    }, [speed, schedulePresentationTimer]);

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

    const skipCurrentPresentation = useCallback(() => {
        if (!presentationTimerRef.current) return;

        clearTimeout(presentationTimerRef.current);
        presentationTimerRef.current = null;
        timerStartedAtRef.current = null;
        timerBaseDurationRef.current = 0;

        processQueueRef.current();
    }, []);

    const resetQueue = useCallback(() => {
        if (presentationTimerRef.current) {
            clearTimeout(presentationTimerRef.current);
            presentationTimerRef.current = null;
        }

        timerStartedAtRef.current = null;
        timerBaseDurationRef.current = 0;
        presentationQueueRef.current = [];
        isPresentingRef.current = false;
    }, []);

    return {
        enqueueEvents,
        isPresentingRef,
        resetQueue,
        skipCurrentPresentation,
    };
}
