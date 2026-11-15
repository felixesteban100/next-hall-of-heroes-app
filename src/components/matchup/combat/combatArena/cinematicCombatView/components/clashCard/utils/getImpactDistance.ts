
import type { PowerRole } from "@/types";

export function getImpactDistance(role?: PowerRole): number {
    switch (role) {
        case "Offensive":
            return 48;

        case "Control":
            return 42;

        case "Utility":
            return 38;

        case "Defensive":
            return 36;

        case "Hybrid / Versatile":
        default:
            return 45;
    }
}
