
import type { PowerRole } from "@/types";

export function getFighterMotionProfile(
    role?: PowerRole,
    isAttacker?: boolean,
    isTeamA: boolean = true,
    isDefending: boolean = false
) {
    const dir = isTeamA ? 1 : -1;

    if (!isAttacker) {
        if (isDefending) {
            return {
                x: [0, -3 * dir, 0],
                scale: [1, 1.05, 1],
                rotate: 0,
            };
        }

        return {
            x: [0, 0, -18 * dir, 0],
            scale: [1, 1, 0.92, 1],
            rotate: [0, 0, -6 * dir, 0],
        };
    }

    switch (role) {
        case "Offensive":
            return {
                x: [0, 0, 48 * dir, 0],
                scale: [1, 1.05, 1.15, 1],
                rotate: [0, 0, 5 * dir, 0],
            };

        case "Control":
            return {
                x: [0, 0, 42 * dir, 0],
                y: [0, -20, -20, 0],
                scale: [1, 1.08, 1.15, 1],
                rotate: [0, -8 * dir, 8 * dir, 0],
            };

        case "Utility":
            return {
                x: [0, 0, 38 * dir, 0],
                y: [0, -12, 0],
                scale: [1, 1.05, 1.1, 1],
                rotate: 0,
            };

        case "Defensive":
            return {
                x: [0, 0, 36 * dir, 0],
                scale: [1, 1.08, 1.12, 1],
                rotate: 0,
            };

        case "Hybrid / Versatile":
        default:
            return {
                x: [0, 0, 45 * dir, 0],
                scale: [1, 1.05, 1.12, 1],
                rotate: 0,
            };
    }
}
