import { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";
import { EnrichedFighter, Log } from "./combat/adapters";

export function isRealPower(power: any): power is Power {
    return (
        power !== null &&
        typeof power === "object" &&
        !("isFallback" in power) &&
        "combatRole" in power
    );
}

export function resolveActivePower(
    log: Log,
    attacker?: EnrichedFighter,
    chars?: CharacterWithJoinTeamUniversePowerEnemies[]
): Power | undefined {
    if (!attacker) return undefined;

    // 🚀 If the log is a basic physical move, don't fall back to passive powers!
    if (log.powerName === "Hand-to-Hand Combat" || log.powerName === "Direct Strike") {
        return undefined; // PowerOverlay will cleanly default to "combat" (physical impact)
    }

    // 1. Try to find exact power match by name
    if (chars) {
        const char = chars.find((c) => c.name === attacker.name);
        if (char) {
            const powers = (char.powers ?? []).filter(isRealPower);
            if (log.powerName) {
                const exact = powers.find((p) => p.name === log.powerName);
                if (exact) return exact;
            }
        }
    }

    return undefined;
}