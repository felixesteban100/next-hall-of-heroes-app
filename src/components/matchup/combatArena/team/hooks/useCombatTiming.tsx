"use client";

import { useEffect, useRef, useState } from "react";

import {
    HEALTH_DROP_DELAY,
    KO_VISUAL_DELAY,
} from "../../combatTimingConstants";

type UseCombatTimingProps = {
    eventKey?: number;
    latestHeal?: number;
    latestRevive?: number;
    latestKO?: number;
    eventType?: string;
    hasDefenderName?: boolean;
    hasImpacted?: boolean;
};

export function useCombatTiming({
    eventKey,
    latestHeal,
    latestRevive,
    latestKO,
    eventType,
    hasDefenderName,
    hasImpacted,
}: UseCombatTimingProps) {
    const [hpReady, setHpReady] = useState(false);
    const [koReady, setKoReady] = useState(false);

    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setHpReady(false);
        setKoReady(false);

        if (eventKey === undefined) return;

        const isHealReviveEvent =
            latestHeal !== undefined || latestRevive !== undefined;

        const isAnimatedAttack =
            eventType === "attack" ||
            eventType === "power" ||
            eventType === "ko" ||
            (eventType === "defend" && hasDefenderName === true);

        if (isHealReviveEvent) {
            timersRef.current.push(
                setTimeout(() => setHpReady(true), 400)
            );

            timersRef.current.push(
                setTimeout(() => setKoReady(true), 600)
            );
        } else {
            if (!isAnimatedAttack) {
                timersRef.current.push(
                    setTimeout(
                        () => setHpReady(true),
                        HEALTH_DROP_DELAY
                    )
                );
            } else if (hasImpacted) {
                setHpReady(true);
            }

            if (latestKO !== undefined) {
                timersRef.current.push(
                    setTimeout(
                        () => setKoReady(true),
                        KO_VISUAL_DELAY
                    )
                );
            }
        }

        return () => {
            timersRef.current.forEach(clearTimeout);
        };
    }, [
        eventKey,
        latestHeal,
        latestRevive,
        latestKO,
        eventType,
        hasDefenderName,
        hasImpacted,
    ]);

    return { hpReady, koReady };
}