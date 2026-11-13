import type { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";

export type Side = "A" | "B";
export type Row = "front" | "back";

export type StatusEffectType =
    | "strength_up"
    | "speed_up"
    | "shield"
    | "regen"
    | "focus"
    | "stun"
    | "slow"
    | "burn"
    | "weaken"
    | "marked"
    | "taunt"
    | "stealth";

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
    | "turn_start"
    | "round_start"
    | "battle_end"

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

export type CombatEvent = {
    id: number;
    type: CombatEventType;
    actorId?: number;
    targetIds?: number[];
    power?: Power;
    damage?: number;
    healing?: number;
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
    fighters: CombatFighter[];
    turnOrder: number[];               // can still be used for preferred order
    currentTurnIndex: number;
    round: number;
    teamOrders: TeamOrder[];
    events: CombatEvent[];
    winner: Side | null;
    playerSide: Side;

    // Phase system
    phase: "player" | "ai";
    isPlayerTurn: boolean;
    selectedActorId: number | null;
    availablePlayerIds: number[];      // characters that can still act this phase
    availableAIIds: number[];          // same for AI
    selectedTargetId: number | null;
};