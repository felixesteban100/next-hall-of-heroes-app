"use client";

import { useEffect, useRef } from "react";
import type { ActionEvent } from "@/lib/matchup/combat/adapters/adapters";

type UseFighterScrollProps = {
    eventKey?: number;
    actionEvent?: ActionEvent;
    involvedIds: Set<number>;
    selectedActorId: number | null;
};

export function useFighterScroll({
    eventKey,
    actionEvent,
    involvedIds,
    selectedActorId,
}: UseFighterScrollProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const avatarRefsMap = useRef(new Map<number, HTMLDivElement>());

    const programmaticScrollRef = useRef(false);
    const scrollResetTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    // Scroll to the fighter involved in the current event.
    useEffect(() => {
        if (involvedIds.size === 0 || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        for (const id of involvedIds) {
            const element = avatarRefsMap.current.get(id);
            if (!element) continue;

            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const targetScrollTop =
                container.scrollTop +
                (elementRect.top - containerRect.top) -
                container.clientHeight / 2 +
                elementRect.height / 2;

            const targetScrollLeft =
                container.scrollLeft +
                (elementRect.left - containerRect.left) -
                container.clientWidth / 2 +
                elementRect.width / 2;

            container.scrollTo({
                top: targetScrollTop,
                left: targetScrollLeft,
                behavior: "smooth",
            });

            break;
        }
    }, [eventKey, actionEvent]);

    // Center the selected fighter.
    useEffect(() => {
        if (selectedActorId === null) return;

        const container = scrollContainerRef.current;
        const avatar = avatarRefsMap.current.get(selectedActorId);

        if (!container || !avatar) return;

        const containerRect = container.getBoundingClientRect();
        const avatarRect = avatar.getBoundingClientRect();

        const targetScrollTop =
            container.scrollTop +
            (avatarRect.top - containerRect.top) -
            container.clientHeight / 2 +
            avatarRect.height / 2;

        const targetScrollLeft =
            container.scrollLeft +
            (avatarRect.left - containerRect.left) -
            container.clientWidth / 2 +
            avatarRect.width / 2;

        programmaticScrollRef.current = true;

        if (scrollResetTimerRef.current) {
            clearTimeout(scrollResetTimerRef.current);
        }

        container.scrollTo({
            top: targetScrollTop,
            left: targetScrollLeft,
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