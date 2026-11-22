"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CombatEvent, Side } from "@/lib/matchup/combat/types/types";

export function useCombatDialog(
    currentActionEvent: CombatEvent | null,
    playerSide: Side
) {
    const [history, setHistory] = useState<CombatEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [impactedEventId, setImpactedEventId] = useState<number | null>(null);
    const lastProcessedIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!currentActionEvent) return;
        if (lastProcessedIdRef.current === currentActionEvent.id) return;

        lastProcessedIdRef.current = currentActionEvent.id;

        setHistory((previous) => {
            if (previous.some((event) => event.id === currentActionEvent.id)) {
                return previous;
            }
            return [...previous, currentActionEvent];
        });

        // Close when the player's turn starts.
        if ((currentActionEvent.type === "turn_start-A" || currentActionEvent.type === "turn_start-B") && currentActionEvent.side === playerSide) {
            setIsOpen(false);
            return;
        }

        setSelectedEventId(currentActionEvent.id);
        setImpactedEventId(null);
        setIsOpen(true);
    }, [currentActionEvent, playerSide]);

    const lastEvent = history[history.length - 1] ?? null;
    const selectedIndex = history.findIndex((event) => event.id === selectedEventId);
    const dialogEvent = isOpen && selectedIndex >= 0 ? history[selectedIndex] : null;
    const canGoPrevious = selectedIndex > 0;
    const canGoNext = selectedIndex >= 0 && selectedIndex < history.length - 1;

    const handlePrevious = useCallback(() => {
        if (canGoPrevious) setSelectedEventId(history[selectedIndex - 1].id);
    }, [history, selectedIndex, canGoPrevious]);

    const handleNext = useCallback(() => {
        if (canGoNext) setSelectedEventId(history[selectedIndex + 1].id);
    }, [history, selectedIndex, canGoNext]);

    const handleGoToLatest = useCallback(() => {
        if (lastEvent) setSelectedEventId(lastEvent.id);
    }, [lastEvent]);

    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleOpen = useCallback(() => {
        if (lastEvent) {
            setSelectedEventId(lastEvent.id);
            setIsOpen(true);
        }
    }, [lastEvent]);

    const handleImpact = useCallback(() => {
        if (dialogEvent) setImpactedEventId(dialogEvent.id);
    }, [dialogEvent]);

    const hasImpacted = currentActionEvent !== null && impactedEventId === currentActionEvent.id;

    return {
        dialogEvent,
        eventPosition: selectedIndex + 1,
        totalEvents: history.length,
        canGoPrevious,
        canGoNext,
        isViewingLatest: selectedIndex >= 0 && selectedIndex === history.length - 1,
        hasImpacted,
        handleImpact,
        handleClose,
        handleOpen,
        handlePrevious,
        handleNext,
        handleGoToLatest,
    };
}
