
import type { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";
import type {
    CombatEvent,
    CombatFighter,
} from "./combat/types/types";

export function isRealPower(power: unknown): power is Power {
    return (
        power !== null &&
        typeof power === "object" &&
        !("isFallback" in power) &&
        "combatRole" in power
    );
}

export function resolveActivePower(
    event: CombatEvent,
    attacker?: CombatFighter,
    chars?: CharacterWithJoinTeamUniversePowerEnemies[]
): Power | undefined {
    if (!attacker) return undefined;

    // Basic physical moves must not fall back to passive powers.
    if (
        event.powerName === "Hand-to-Hand Combat" ||
        event.powerName === "Direct Strike"
    ) {
        return undefined;
    }

    if (!chars || !event.powerName) return undefined;

    const character = chars.find(
        (char) => char.name === attacker.name
    );

    if (!character) return undefined;

    const powers = (character.powers ?? []).filter(isRealPower);

    return powers.find(
        (power) => power.name === event.powerName
    );
}
