"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionEvent } from "@/lib/matchup/combat/adapters";
import type { Side } from "@/lib/matchup/combat/types";

export function useCombatDialog(
    currentActionEvent: ActionEvent | null,
    playerSide: Side
) {
    const [lastEvent, setLastEvent] = useState<ActionEvent | null>(null);
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

        // Close only when the player's turn starts.
        if (
            currentActionEvent.log.type === "turn_start" &&
            currentActionEvent.log.side === playerSide
        ) {
            setIsOpen(false);
            return;
        }

        setLastEvent(currentActionEvent);
        setImpactedEventKey(null);
        setIsOpen(true);
    }, [currentActionEvent, playerSide]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleOpen = useCallback(() => {
        if (lastEvent) {
            setIsOpen(true);
        }
    }, [lastEvent]);

    const handleImpact = useCallback(() => {
        if (lastEvent) {
            setImpactedEventKey(lastEvent.key);
        }
    }, [lastEvent]);

    return {
        dialogEvent: isOpen ? lastEvent : null,
        hasLastEvent: lastEvent !== null,
        canReopen: !isOpen && lastEvent !== null,
        hasImpacted:
            currentActionEvent?.key !== undefined &&
            impactedEventKey === currentActionEvent.key,
        handleImpact,
        handleClose,
        handleOpen,
    };
}