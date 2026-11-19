"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActionEvent } from "@/lib/matchup/combat/adapters/adapters";
import type { Side } from "@/lib/matchup/combat/types/types";

export function useCombatDialog(
    currentActionEvent: ActionEvent | null,
    playerSide: Side
) {
    const [history, setHistory] = useState<ActionEvent[]>([]);
    const [selectedEventKey, setSelectedEventKey] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [impactedEventKey, setImpactedEventKey] =
        useState<number | null>(null);

    const lastProcessedKeyRef = useRef<number | null>(null);

    useEffect(() => {
        if (!currentActionEvent) return;

        if (lastProcessedKeyRef.current === currentActionEvent.key) {
            return;
        }

        lastProcessedKeyRef.current = currentActionEvent.key;

        // Save each event only once, including turn_start events.
        setHistory((previous) => {
            if (previous.some((event) => event.key === currentActionEvent.key)) {
                return previous;
            }

            return [...previous, currentActionEvent];
        });

        // Close when the player's turn starts.
        if (
            currentActionEvent.log.type === "turn_start" &&
            currentActionEvent.log.side === playerSide
        ) {
            setIsOpen(false);
            return;
        }

        // Automatically select and display the newest event.
        setSelectedEventKey(currentActionEvent.key);
        setImpactedEventKey(null);
        setIsOpen(true);
    }, [currentActionEvent, playerSide]);

    const lastEvent = history[history.length - 1] ?? null;

    const selectedIndex = history.findIndex(
        (event) => event.key === selectedEventKey
    );

    const dialogEvent =
        isOpen && selectedIndex >= 0
            ? history[selectedIndex]
            : null;

    const canGoPrevious = selectedIndex > 0;

    const canGoNext =
        selectedIndex >= 0 &&
        selectedIndex < history.length - 1;

    const handlePrevious = useCallback(() => {
        if (!canGoPrevious) return;

        setSelectedEventKey(history[selectedIndex - 1].key);
    }, [history, selectedIndex, canGoPrevious]);

    const handleNext = useCallback(() => {
        if (!canGoNext) return;

        setSelectedEventKey(history[selectedIndex + 1].key);
    }, [history, selectedIndex, canGoNext]);

    const handleGoToLatest = useCallback(() => {
        if (!lastEvent) return;

        setSelectedEventKey(lastEvent.key);
    }, [lastEvent]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleOpen = useCallback(() => {
        if (lastEvent) {
            setSelectedEventKey(lastEvent.key);
            setIsOpen(true);
        }
    }, [lastEvent]);

    const handleImpact = useCallback(() => {
        if (dialogEvent) {
            setImpactedEventKey(dialogEvent.key);
        }
    }, [dialogEvent]);

    const hasImpacted = useMemo(
        () =>
            currentActionEvent?.key !== undefined &&
            impactedEventKey === currentActionEvent.key,
        [currentActionEvent, impactedEventKey]
    );

    return {
        dialogEvent,

        hasLastEvent: history.length > 0,
        canReopen: !isOpen && history.length > 0,

        eventPosition: selectedIndex + 1,
        totalEvents: history.length,

        canGoPrevious,
        canGoNext,

        isViewingLatest:
            selectedIndex >= 0 &&
            selectedIndex === history.length - 1,

        hasImpacted,

        handleImpact,
        handleClose,
        handleOpen,
        handlePrevious,
        handleNext,
        handleGoToLatest,
    };
}