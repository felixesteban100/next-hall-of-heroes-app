
import type { ClashCardProps } from "./types";
import type { CombatEventType } from "@/lib/matchup/combat/types/types";

import RoundTransition from "./RoundTransition";
import EventCard from "./EventCard";
import FighterClash from "./FighterClash";
import { BattleEndScreen } from "./BattleEndScreen";

export default function ClashCard(props: ClashCardProps) {
    const {
        event,
        fighters,
        allChars,
        teamAChars,
        playerSide,
    } = props;

    if (!event) {
        return null;
    }

    const eventType: CombatEventType = event.type;

    switch (eventType) {
        case "battle_end":
            return (
                <BattleEndScreen
                    isVictory={event.side === playerSide}
                    event={event}
                    meta={event.metadata}
                />
            );

        case "round_start":
        case "turn_start-A":
        case "turn_start-B":
            return <RoundTransition event={event} />;

        case "swap_row":
        case "team_order":
        case "status_applied":
        case "status_tick":
        case "heal":
        case "revive":
        case "defend":
            return (
                <EventCard
                    event={event}
                    fighters={fighters}
                    allChars={allChars}
                    teamAChars={teamAChars}
                    onImpact={props.onImpact}
                    animationSpeed={props.animationSpeed}
                    skipSignal={props.skipSignal}
                />
            );

        default:
            return <FighterClash {...props} />;
    }
}
