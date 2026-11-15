
import type { ClashCardProps } from "./types";

import AwaitingCombat from "./components/AwaitingCombat";
import RoundTransition from "./components/RoundTransition";
import EventCard from "./components/EventCard";
import FighterClash from "./components/FighterClash";

import { BattleEndScreen } from "./components/BattleEndScreen";

export default function ClashCard(props: ClashCardProps) {
    const {
        event,
        allChars,
        teamAChars,
        playerSide,
    } = props;

    if (!event) {
        return <AwaitingCombat />;
    }

    const { log, attacker, defender, activePower } = event;
    const eventType = log.type as string;

    console.log(activePower)

    switch (eventType) {
        case "battle_end": {
            return (
                <BattleEndScreen
                    isVictory={log.side === playerSide}
                    log={log}
                    meta={log.metadata}
                />
            );
        }

        case "round_start":
        case "turn_start": {
            return <RoundTransition event={event} />;
        }

        case "swap_row":
        case "team_order":
        case "status_applied":
        case "status_tick":
        case "heal":
        case "revive": {
            return (
                <EventCard
                    event={event}
                    allChars={allChars}
                    teamAChars={teamAChars}
                    onImpact={props.onImpact}
                />
            );
        }

        case "defend": {
            const isShieldActivation = !log.defenderName || attacker?.id === defender?.id;

            if (isShieldActivation) {
                return (
                    <EventCard
                        event={event}
                        allChars={allChars}
                        teamAChars={teamAChars}
                        onImpact={props.onImpact}
                    />
                );
            }

            return <FighterClash {...props} />;
        }

        default:
            return <FighterClash {...props} />;
    }
}