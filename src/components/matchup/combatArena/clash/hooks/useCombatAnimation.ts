
import { useCallback, useEffect, useRef, useState } from "react";

import type { CombatEvent } from "@/lib/matchup/combat/types/types";
import type { CombatPhase } from "../types";

import { KO_VISUAL_DELAY } from "../../combatTimingConstants";

const PHASE_1_DELAY = 600;
const PHASE_2_FALLBACK_DELAY = 800;

type UseCombatAnimationProps = {
    event: CombatEvent | null;
    onImpact?: () => void;
    speed?: 1 | 2;
    skipSignal?: number;
};

export function useCombatAnimation({
    event,
    onImpact,
    speed = 1,
    skipSignal = 0,
}: UseCombatAnimationProps) {
    const [phase, setPhase] = useState<CombatPhase>(0);
    const [isSkipped, setIsSkipped] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const impactTriggeredRef = useRef(false);
    const lastSkipSignalRef = useRef(skipSignal);
    const speedRef = useRef(speed);

    // Keep the latest speed without restarting the current event.
    speedRef.current = speed;

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const triggerImpact = useCallback(() => {
        if (impactTriggeredRef.current) return;

        impactTriggeredRef.current = true;

        setPhase((current) => current === 3 ? 3 : 2);
        onImpact?.();
    }, [onImpact]);

    const skipAnimation = useCallback(() => {
        if (!event) return;

        clearTimers();
        setIsSkipped(true);
        const isKO = event.type === "ko" || !!event.isKO;

        if (impactTriggeredRef.current) {
            if (isKO) setPhase(3);
            return;
        }

        impactTriggeredRef.current = true;

        setPhase(isKO ? 3 : 2);
        onImpact?.();
    }, [event, clearTimers, onImpact]);

    // Start the animation once per event.
    useEffect(() => {
        clearTimers();

        impactTriggeredRef.current = false;
        setPhase(0);

        setIsSkipped(false);

        if (!event) return;

        const eventType = event.type;
        const currentSpeed = speedRef.current;

        const isHealRevive =
            eventType === "heal" ||
            eventType === "revive";

        const isAnimatedAttack =
            eventType === "attack" ||
            eventType === "power" ||
            eventType === "ko" ||
            (eventType === "defend" && !!event.defenderName);

        const isKO = eventType === "ko" || !!event.isKO;

        if (isHealRevive) {
            timersRef.current.push(
                setTimeout(() => setPhase(1), 200 / currentSpeed)
            );

            timersRef.current.push(
                setTimeout(() => setPhase(2), 400 / currentSpeed)
            );

            return clearTimers;
        }

        timersRef.current.push(
            setTimeout(
                () => setPhase(1),
                PHASE_1_DELAY / currentSpeed
            )
        );

        if (!isAnimatedAttack) {
            timersRef.current.push(
                setTimeout(
                    () => setPhase(2),
                    PHASE_2_FALLBACK_DELAY / currentSpeed
                )
            );
        }

        if (isKO) {
            timersRef.current.push(
                setTimeout(
                    () => setPhase(3),
                    KO_VISUAL_DELAY / currentSpeed
                )
            );
        }

        return clearTimers;
    }, [event?.id, clearTimers]);

    // A changed signal means the user pressed Skip.
    useEffect(() => {
        if (lastSkipSignalRef.current === skipSignal) return;

        lastSkipSignalRef.current = skipSignal;
        skipAnimation();
    }, [skipSignal, skipAnimation]);

    return {
        phase,
        triggerImpact,
        isSkipped,
    };
}
