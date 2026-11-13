import type { FallbackItem, Power } from "@/types";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView"; // or wherever it lives

import type {
    CombatFighter,
    CombatEvent,
    CombatEventType,
    BattleMetadata,
    FighterTelemetry,
    Side,
} from "./types";

export type { BattleMetadata, FighterTelemetry } from "./types";

// OLD TYPES 
export type LogType = "attack" | "heal" | "defend" | "revive" | "ko" | "finish" | "rout";

export type Log = {
    id: number;
    type: CombatEventType//LogType; // it should be CombatEvent
    attackerName?: string;
    defenderName?: string;
    powerName?: string;
    actionName?: string;
    text: string;
    icon: any;
    colorClass: string;
    variant: "primary" | "secondary";
    isKO?: boolean;
    damage?: number;
    healing?: number;
    metadata?: BattleMetadata;
    side: Side;
};

export type FighterState = {
    name: string;
    overall: number;
    isAlive: boolean;
    image: string;
    powers?: (Power | FallbackItem)[];
    hasRevived?: boolean;
    imageFocus: string;
    maxHp: number;
    currentHp: number;
};

export type EnrichedFighter = FighterState & {
    id: number;
    image: string;
    imageFocus: string;
    overall: number;
    // HP before the most-recent log (used to hold the bar at the pre-hit value until phase 2).
    // Optional so enrich() doesn't need to set it; TeamColumn falls back to maxHp when absent.
    prevHp?: number;

    energy: number;
    maxEnergy: number;
    status: { type: string; duration: number; name: string }[];
};

export type ActionEvent = {
    key: number;
    log: Log;
    attacker?: EnrichedFighter;
    defender?: EnrichedFighter;
    activePower?: Power;
};

// OLD TYPES 

const EVENT_META: Record<CombatEventType, { colorClass?: string; actionName: string }> = {
    attack: { actionName: "Basic Strike" },
    power: { colorClass: "text-amber-400", actionName: "Power Cast" },
    defend: { colorClass: "text-cyan-400", actionName: "Guard / Block" },
    heal: { colorClass: "text-emerald-400", actionName: "Restoration" },
    status_applied: { colorClass: "text-violet-400", actionName: "Status Applied" },
    status_tick: { colorClass: "text-orange-400", actionName: "Status Effect" },
    ko: { colorClass: "text-red-500", actionName: "Knockout" },
    revive: { colorClass: "text-purple-400", actionName: "Revival" },
    swap_row: { colorClass: "text-sky-400", actionName: "Formation Shift" },
    team_order: { colorClass: "text-indigo-400", actionName: "Team Order" },
    turn_start: { colorClass: "text-muted-foreground", actionName: "Phase Start" },
    round_start: { colorClass: "text-amber-300", actionName: "New Round" },
    battle_end: { colorClass: "text-amber-400", actionName: "Battle Complete" },
};

export function toLegacyLog(event: CombatEvent): Log {
    const sideColor = event.side === "A" ? "text-primary" : "text-secondary";
    const meta = EVENT_META[event.type] ?? { actionName: "Action" };

    return {
        id: event.id,
        type: event.type, // 🌟 Preserves exact CombatEventType directly
        attackerName: event.attackerName,
        defenderName: event.defenderName,
        powerName: event.powerName ?? event.power?.name,
        actionName: meta.actionName,
        text: event.text,
        icon: null as any,
        colorClass: meta.colorClass ?? sideColor,
        variant: event.side === "A" ? "primary" : "secondary",
        isKO: event.isKO === true || event.type === "ko",
        damage: event.damage,
        healing: event.healing,
        metadata: event.metadata,
        side: event.side,
    };
}

export function toEnrichedFighter(f: CombatFighter, prevHp?: number): EnrichedFighter {
    return {
        // Identity
        id: f.id,
        name: f.name,

        // Combat state (critical for FighterSlot)
        overall: f.overall,
        isAlive: f.isAlive,
        maxHp: f.maxHp,
        currentHp: f.currentHp,
        hasRevived: f.hasRevived ?? false,

        // Visuals
        image: f.image || "",
        imageFocus: f.imageFocus || "50% 18%",

        // Powers (needed by resolveActivePower)
        powers: f.powers as any,

        // Important for the delayed HP bar
        prevHp: prevHp !== undefined ? prevHp : f.currentHp,

        // 🌟 Map engine values here
        energy: f.energy ?? 80,
        maxEnergy: f.maxEnergy ?? 100,
        status: f.status ?? [],
    };
}

export function buildActionEvent(
    event: CombatEvent | null,
    fightersA: CombatFighter[],
    fightersB: CombatFighter[],
    allChars: any[]
): ActionEvent | null {
    if (!event) return null;

    const all = [...fightersA, ...fightersB];

    const findByName = (name?: string) => {
        if (!name) return undefined;
        return all.find((f) => f.name === name);
    };

    const attackerFighter = findByName(event.attackerName);
    const defenderFighter = findByName(event.defenderName);

    const enrichedAttacker = attackerFighter
        ? toEnrichedFighter(attackerFighter)
        : undefined;

    const enrichedDefender = defenderFighter
        ? toEnrichedFighter(defenderFighter)
        : undefined;

    const log = toLegacyLog(event);

    // Prefer the Power object that came from the engine
    let activePower: Power | undefined = event.power;

    if (!activePower && enrichedAttacker) {
        activePower = resolveActivePower(log, enrichedAttacker as any, allChars);
    }

    return {
        key: event.id,
        log,
        attacker: enrichedAttacker,
        defender: enrichedDefender,
        activePower,
    };
}