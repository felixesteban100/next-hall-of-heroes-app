
import type { LucideIcon } from "lucide-react";
import type {
    CharacterWithJoinTeamUniversePowerEnemies,
    PowerRole,
} from "@/types";

import type {
    CombatEvent,
    CombatFighter,
    BattleMetadata,
    FighterTelemetry,
    Side,
} from "@/lib/matchup/combat/types/types";

export type { BattleMetadata, FighterTelemetry };

export type CombatPhase = 0 | 1 | 2 | 3;

export type ClashCardProps = {
    event: CombatEvent | null;
    fighters: CombatFighter[];
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: Side;
    onImpact?: () => void;
};

export type EventStyle = {
    Icon: LucideIcon;
    text: string;
    bg: string;
    border: string;
    label: string;
};

export type RoleStyle = {
    Icon: LucideIcon;
    text: string;
    glow: string;
    bg: string;
    border: string;
    label: string;
};

export type EventInfoCardProps = {
    event: CombatEvent;
    character?: CombatFighter | null;
    teamA: boolean;
    subtitle?: string;
};
