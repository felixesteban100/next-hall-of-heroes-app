"use client";

import { useEffect, useRef } from "react";
import type { CombatEvent } from "@/lib/matchup/combat/types/types";

type UseFighterScrollProps = {
    eventKey?: number;
    actionEvent?: CombatEvent;
    involvedIds: Set<number>;
    selectedActorId: number | null;
};

function centerElementInContainer(
    container: HTMLDivElement,
    element: HTMLDivElement
) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return {
        top:
            container.scrollTop +
            (elementRect.top - containerRect.top) -
            container.clientHeight / 2 +
            elementRect.height / 2,
        left:
            container.scrollLeft +
            (elementRect.left - containerRect.left) -
            container.clientWidth / 2 +
            elementRect.width / 2,
    };
}

export function useFighterScroll({ eventKey, actionEvent, involvedIds, selectedActorId }: UseFighterScrollProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const avatarRefsMap = useRef(new Map<number, HTMLDivElement>());

    const programmaticScrollRef = useRef(false);
    const scrollResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Scroll to the fighter involved in the current event.
    useEffect(() => {
        if (involvedIds.size === 0 || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        for (const id of involvedIds) {
            const element = avatarRefsMap.current.get(id);
            if (!element) continue;

            const position = centerElementInContainer(container, element);

            container.scrollTo({
                ...position,
                behavior: "smooth",
            });

            break;
        }
    }, [eventKey, actionEvent, involvedIds]);

    // Center the selected fighter.
    useEffect(() => {
        if (selectedActorId === null) return;

        const container = scrollContainerRef.current;
        const avatar = avatarRefsMap.current.get(selectedActorId);

        if (!container || !avatar) return;

        programmaticScrollRef.current = true;

        if (scrollResetTimerRef.current) {
            clearTimeout(scrollResetTimerRef.current);
        }

        const position = centerElementInContainer(container, avatar);

        container.scrollTo({
            ...position,
            behavior: "smooth",
        });

        scrollResetTimerRef.current = setTimeout(() => {
            programmaticScrollRef.current = false;
        }, 800);

        return () => {
            if (scrollResetTimerRef.current) {
                clearTimeout(scrollResetTimerRef.current);
            }
        };
    }, [selectedActorId]);

    // Clean up the scroll reset timer on unmount.
    useEffect(() => {
        return () => {
            if (scrollResetTimerRef.current) {
                clearTimeout(scrollResetTimerRef.current);
            }
        };
    }, []);

    return {
        scrollContainerRef,
        avatarRefsMap,
        programmaticScrollRef,
    };
}