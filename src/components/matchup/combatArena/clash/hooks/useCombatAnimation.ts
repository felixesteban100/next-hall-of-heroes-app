
import { useCallback, useEffect, useRef, useState } from "react";

import type { CombatEvent } from "@/lib/matchup/combat/types/types";
import type { CombatPhase } from "../types";

import { KO_VISUAL_DELAY } from "../../combatTimingConstants";

const PHASE_1_DELAY = 600;
const PHASE_2_FALLBACK_DELAY = 800;

type UseCombatAnimationProps = {
    event: CombatEvent | null;
    onImpact?: () => void;
};

export function useCombatAnimation({
    event,
    onImpact,
}: UseCombatAnimationProps) {
    const [phase, setPhase] = useState<CombatPhase>(0);

    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const impactTriggeredRef = useRef(false);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const triggerImpact = useCallback(() => {
        if (impactTriggeredRef.current) return;

        impactTriggeredRef.current = true;

        setPhase(2);
        onImpact?.();
    }, [onImpact]);

    useEffect(() => {
        clearTimers();

        impactTriggeredRef.current = false;
        setPhase(0);

        if (!event) return;

        const eventType = event.type;

        const isHealRevive =
            eventType === "heal" ||
            eventType === "revive";

        const isAnimatedAttack =
            eventType === "attack" ||
            eventType === "power" ||
            eventType === "ko" ||
            (eventType === "defend" && !!event.defenderName);

        // Healing and revival use a shorter animation sequence.
        if (isHealRevive) {
            timersRef.current.push(
                setTimeout(() => setPhase(1), 200)
            );

            timersRef.current.push(
                setTimeout(() => setPhase(2), 400)
            );

            return clearTimers;
        }

        // Initial animation phase.
        timersRef.current.push(
            setTimeout(() => setPhase(1), PHASE_1_DELAY)
        );

        // Non-attack events automatically advance after phase 1.
        if (!isAnimatedAttack) {
            timersRef.current.push(
                setTimeout(
                    () => setPhase(2),
                    PHASE_2_FALLBACK_DELAY
                )
            );
        }

        // KO, finish, and rout events receive a final phase.
        const isKO = eventType === "ko" || !!event.isKO;

        if (isKO) {
            timersRef.current.push(
                setTimeout(
                    () => setPhase(3),
                    KO_VISUAL_DELAY
                )
            );
        }

        return clearTimers;
    }, [event?.id, clearTimers]);

    return {
        phase,
        triggerImpact,
    };
}