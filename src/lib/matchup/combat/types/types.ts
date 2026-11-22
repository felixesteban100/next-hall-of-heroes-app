import type { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";

export type Side = "A" | "B";
export type Row = "front" | "back";

export type StatusEffectType =
    | "accuracy_down"
    | "accuracy_up"
    | "adaptation"
    | "armor_break"
    | "banish"
    | "barrier"
    | "berserk"
    | "bleed"
    | "blind"
    | "burn"
    | "charm"
    | "chilled"
    | "combo_up"
    | "conductive"
    | "confuse"
    | "corrosion"
    | "critical_damage_up"
    | "critical_down"
    | "critical_up"
    | "curse"
    | "damage_down"
    | "damage_immunity"
    | "damage_reduction"
    | "damage_share"
    | "damage_up"
    | "death_mark"
    | "death_prevention"
    | "decoy"
    | "defense_down"
    | "defense_up"
    | "delayed_damage"
    | "delayed_healing"
    | "disarm"
    | "distraction"
    | "electrified"
    | "elemental_resistance"
    | "elemental_vulnerability"
    | "energy_block"
    | "energy_drain"
    | "energy_regen"
    | "energy_resistance"
    | "energy_restore"
    | "energy_vulnerability"
    | "entangled"
    | "evasion_up"
    | "exposed"
    | "fatigue_reduction"
    | "fatigue_resistance"
    | "fear"
    | "focus"
    | "freeze"
    | "frostbite"
    | "frozen"
    | "gravity_down"
    | "gravity_up"
    | "grounded"
    | "healing_amplification"
    | "healing_block"
    | "healing_down"
    | "healing_up"
    | "interrupt"
    | "invisibility"
    | "invulnerable"
    | "knockdown"
    | "last_stand"
    | "life_drain"
    | "lifesteal"
    | "magic_resistance"
    | "magic_vulnerability"
    | "marked"
    | "overcharge"
    | "overheated"
    | "paralyze"
    | "penetration_up"
    | "petrify"
    | "phase"
    | "physical_resistance"
    | "physical_vulnerability"
    | "poison"
    | "possession"
    | "power_copy"
    | "power_down"
    | "power_reflection"
    | "power_seal"
    | "power_up"
    | "protection"
    | "radiation"
    | "rage"
    | "reality_distortion"
    | "reflect"
    | "regen"
    | "resistance_down"
    | "revealed"
    | "revival_protection"
    | "root"
    | "second_wind"
    | "shield"
    | "shield_break"
    | "shocked"
    | "silence"
    | "size_change"
    | "sleep"
    | "slow"
    | "soaked"
    | "soul_drain"
    | "speed_down"
    | "speed_up"
    | "status_immune"
    | "status_resistance"
    | "stealth"
    | "strength_down"
    | "strength_up"
    | "stun"
    | "stun_immune"
    | "target_lock"
    | "taunt"
    | "thorns"
    | "time_acceleration"
    | "time_slow"
    | "time_stop"
    | "toxic"
    | "transformation"
    | "untargetable"
    | "water_breathing"
    | "weaken"
    | "wet";


export type StatusEffect = {
    id: string;
    type: StatusEffectType;
    name: string;
    duration: number;
    value: number;
    sourceId?: number;
};

export type CombatFighter = {
    id: number;
    name: string;
    side: Side;
    original: CharacterWithJoinTeamUniversePowerEnemies;

    row: Row;
    maxHp: number;
    currentHp: number;
    energy: number;
    maxEnergy: number;

    overall: number;
    fatigue: number; // 0–100
    powerstats: CharacterWithJoinTeamUniversePowerEnemies["powerstats"];
    powers: Power[];

    status: StatusEffect[];
    cooldowns: Record<number, number>;
    hasRevived: boolean;
    isAlive: boolean;

    image: string;
    imageFocus: string;
};

export type TeamOrderType =
    | "focus_fire"
    | "protect"
    | "all_out"
    | "defensive_wall"
    | "flank"
    | "rally";

export type TeamOrder = {
    id: string;
    type: TeamOrderType;
    name: string;
    side: Side;
    duration: number;
    targetId?: number;
    value?: number;
};

export type ActionType =
    | "basic_attack"
    | "use_power"
    | "defend"
    | "swap_row"
    | "pass"
    | "team_order";

export type CombatAction = {
    type: ActionType;
    actorId: number;
    powerId?: number;
    targetIds?: number[];
    teamOrderType?: TeamOrderType;
    newRow?: Row;
    chosenRole?: PowerRole;
};



export type FighterTelemetry = {
    name: string;

    attacksLanded: number;
    damageDealt: number;

    damageBlocked: number;
    hitsTaken: number;
    damageTaken: number;

    revivals: number;
    healingDone: number;

    accuracy: number;
    survivalRate: number;
    efficiency: number;
    kos: number;
};

export type BattleMetadata = {
    teamAName: string;
    teamBName: string;
    totalRounds: number;
    totalKoCount: number;
    winnerPowerAvg: number;
    winType: string;
    dominance: number;

    teamAPowerAvg: number;
    teamBPowerAvg: number;

    teamAStats: FighterTelemetry[];
    teamBStats: FighterTelemetry[];

    mvpA: FighterTelemetry;
    mvpB: FighterTelemetry;
    wallA: FighterTelemetry;
    wallB: FighterTelemetry;
    strikerA: FighterTelemetry;
    strikerB: FighterTelemetry;
    reviveA: FighterTelemetry;
    reviveB: FighterTelemetry;
    healerA: FighterTelemetry;
    healerB: FighterTelemetry;

    longestStreak: { name: string; streak: number };
    mostDamageSingleHit: { name: string; damage: number };

    totalDamageDealt: number;
    totalHealingDone: number;

    mostKOA: { name: string; kos: number };
    mostKOB: { name: string; kos: number };
};

export type CombatEventType =
    | "attack"
    | "power"
    | "defend"
    | "heal"
    | "status_applied"
    | "status_tick"
    | "ko"
    | "revive"
    | "swap_row"
    | "team_order"
    | "turn_start-A"
    | "turn_start-B"
    | "round_start"
    | "battle_end";

export type CombatEvent = {
    id: number;
    type: CombatEventType;
    actorId?: number;
    targetIds?: number[];
    power?: Power | { name: string, combatRole: PowerRole };
    damage?: number;
    damageBlocked?: number;
    healing?: number;
    hpBefore?: number;
    hpAfter?: number;
    status?: StatusEffect;
    text: string;
    side: Side;
    isKO?: boolean;
    attackerName?: string;
    defenderName?: string;
    powerName?: string;
    metadata?: BattleMetadata;
};

export type CombatState = {
    teamAName: string;
    teamBName: string;
    fighters: CombatFighter[];
    turnOrder: number[];
    currentTurnIndex: number;
    round: number;
    teamOrders: TeamOrder[];
    events: CombatEvent[];
    winner: Side | "draw" | null;
    playerSide: Side;

    // Battle and turn order
    battleStarted: boolean;
    startingSide: Side;
    activeSide: Side;

    // Phase system
    phase: "player" | "ai";
    isPlayerTurn: boolean;
    selectedActorId: number | null;
    availablePlayerIds: number[];
    availableAIIds: number[];
    selectedTargetId: number | null;
    lastActorBySide: Record<Side, number | null>;
};