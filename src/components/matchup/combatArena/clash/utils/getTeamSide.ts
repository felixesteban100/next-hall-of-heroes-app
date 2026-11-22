import type { CombatFighter } from "@/lib/matchup/combat/types/types";

export function isTeamACharacter(
    fighter: CombatFighter | null | undefined
): boolean {
    return fighter?.side === "A";
}
