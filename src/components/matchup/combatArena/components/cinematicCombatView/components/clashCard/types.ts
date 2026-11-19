
import type { LucideIcon } from "lucide-react";
import type {
    CharacterWithJoinTeamUniversePowerEnemies,
    PowerRole,
} from "@/types";

import type {
    ActionEvent,
    EnrichedFighter,
} from "@/lib/matchup/combat/adapters/adapters";

import type { Side } from "@/lib/matchup/combat/types/types";

export type CombatPhase = 0 | 1 | 2 | 3;

export type ClashCardProps = {
    event: ActionEvent | null;
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
    log: ActionEvent["log"];
    type: string;
    character?: EnrichedFighter | null;
    teamA: boolean;
    subtitle?: string;
};