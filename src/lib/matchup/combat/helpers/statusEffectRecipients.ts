
import type {
    CombatFighter,
    StatusEffectType,
} from "../types/types";

export type StatusEffectRecipient =
    | "self"
    | "ally"
    | "enemy"
    | "selected";

/**
 * Defines the intended recipient for every status effect.
 *
 * This mapping is deliberately independent of combatRole:
 * offensive powers can buff their user, and defensive powers
 * can apply effects to allies.
 */
const STATUS_EFFECT_RECIPIENTS: Record<
    StatusEffectType,
    StatusEffectRecipient
> = {
    // Accuracy and combat bonuses
    accuracy_down: "enemy",
    accuracy_up: "self",
    adaptation: "self",
    armor_break: "enemy",
    banish: "enemy",
    barrier: "ally",
    berserk: "self",
    bleed: "enemy",
    blind: "enemy",
    burn: "enemy",
    charm: "enemy",
    chilled: "enemy",
    combo_up: "self",
    conductive: "enemy",
    confuse: "enemy",
    corrosion: "enemy",
    critical_damage_up: "self",
    critical_down: "enemy",
    critical_up: "self",
    curse: "enemy",
    damage_down: "enemy",
    damage_immunity: "self",
    damage_reduction: "self",
    damage_share: "ally",
    damage_up: "self",
    death_mark: "enemy",
    death_prevention: "self",
    decoy: "self",
    defense_down: "enemy",
    defense_up: "self",
    delayed_damage: "enemy",
    delayed_healing: "ally",
    disarm: "enemy",
    distraction: "enemy",
    electrified: "enemy",
    elemental_resistance: "self",
    elemental_vulnerability: "enemy",
    energy_block: "enemy",
    energy_drain: "enemy",
    energy_regen: "self",
    energy_resistance: "self",
    energy_restore: "ally",
    energy_vulnerability: "enemy",
    entangled: "enemy",
    evasion_up: "self",
    exposed: "enemy",
    fatigue_reduction: "self",
    fatigue_resistance: "self",
    fear: "enemy",
    focus: "self",
    freeze: "enemy",
    frostbite: "enemy",
    frozen: "enemy",
    gravity_down: "enemy",
    gravity_up: "self",
    grounded: "enemy",
    healing_amplification: "self",
    healing_block: "enemy",
    healing_down: "enemy",
    healing_up: "ally",
    interrupt: "enemy",
    invisibility: "self",
    invulnerable: "self",
    knockdown: "enemy",
    last_stand: "self",
    life_drain: "enemy",
    lifesteal: "self",
    magic_resistance: "self",
    magic_vulnerability: "enemy",
    marked: "enemy",
    overcharge: "self",
    overheated: "enemy",
    paralyze: "enemy",
    penetration_up: "self",
    petrify: "enemy",
    phase: "self",
    physical_resistance: "self",
    physical_vulnerability: "enemy",
    poison: "enemy",
    possession: "enemy",
    power_copy: "self",
    power_down: "enemy",
    power_reflection: "self",
    power_seal: "enemy",
    power_up: "self",
    protection: "ally",
    radiation: "enemy",
    rage: "self",
    reality_distortion: "enemy",
    reflect: "self",
    regen: "ally",
    resistance_down: "enemy",
    revealed: "enemy",
    revival_protection: "ally",
    root: "enemy",
    second_wind: "self",
    shield: "ally",
    shield_break: "enemy",
    shocked: "enemy",
    silence: "enemy",
    size_change: "self",
    sleep: "enemy",
    slow: "enemy",
    soaked: "enemy",
    soul_drain: "enemy",
    speed_down: "enemy",
    speed_up: "self",
    status_immune: "self",
    status_resistance: "self",
    stealth: "self",
    strength_down: "enemy",
    strength_up: "self",
    stun: "enemy",
    stun_immune: "self",
    target_lock: "enemy",
    taunt: "self",
    thorns: "self",
    time_acceleration: "self",
    time_slow: "enemy",
    time_stop: "enemy",
    toxic: "enemy",
    transformation: "self",
    untargetable: "self",
    water_breathing: "self",
    weaken: "enemy",
    wet: "enemy",
} satisfies Record<StatusEffectType, StatusEffectRecipient>;

/**
 * Resolves the actual fighter who should receive a status effect.
 *
 * Returns null when the selected target does not match the
 * required recipient side. This prevents accidental cross-team
 * application of debuffs and ally-only effects.
 */
export function resolveStatusEffectRecipient(
    type: StatusEffectType,
    actor: CombatFighter,
    selectedTarget: CombatFighter
): CombatFighter | null {
    const recipient = STATUS_EFFECT_RECIPIENTS[type];

    switch (recipient) {
        case "self":
            return actor;

        case "ally":
            return selectedTarget.side === actor.side
                ? selectedTarget
                : actor;

        case "enemy":
            return selectedTarget.side !== actor.side
                ? selectedTarget
                : null;

        case "selected":
            return selectedTarget;

        default: {
            const exhaustiveCheck: never = recipient;
            return exhaustiveCheck;
        }
    }
}
