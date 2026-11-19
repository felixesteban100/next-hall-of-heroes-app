
import { cn } from "@/lib/utils";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView";

import { EVENT_STYLES } from "../constants/eventStyles";
import { isTeamACharacter } from "../utils/getTeamSide";
import { useCombatAnimation } from "../hooks/useCombatAnimation";

import FighterSlot from "./FighterSlot";

import type {
    ActionEvent,
    EnrichedFighter,
} from "@/lib/matchup/combat/adapters/adapters";

import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import type { CombatActionType } from "@/components/shared/powerOverlay/PowerOverlay";

import { AnimatePresence, motion } from "framer-motion"
import { Crosshair, Lock, Shield } from "lucide-react";
import FighterClash from "./FighterClash";
import FighterCard from "../../teamColumn/components/FighterCard";

type Props = {
    event: ActionEvent;
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    onImpact?: () => void;
};

type EventPresentation = {
    title: string;
    roleLabel: string;
    action?: CombatActionType;
    showOverlay: boolean;
    badgeColor?: string;
    popupType?: "heal";
};

function getEventPresentation(type: string): EventPresentation {
    switch (type) {
        case "heal":
            return {
                title: "HEALING",
                roleLabel: "HEALING",
                action: "heal",
                showOverlay: true,
                badgeColor: "text-emerald-400",
                popupType: "heal",
            };

        case "revive":
            return {
                title: "REVIVED",
                roleLabel: "REVIVED",
                action: "revive",
                showOverlay: true,
                badgeColor: "text-purple-400",
            };

        case "defend":
            return {
                title: "DEFENDING",
                roleLabel: "BLOCKS",
                action: "defend",
                showOverlay: true,
                badgeColor: "text-cyan-400",
            };

        case "swap_row":
            return {
                title: "POSITION CHANGE",
                roleLabel: "SWITCHING",
                showOverlay: false,
                badgeColor: "text-blue-400",
            };

        case "team_order":
            return {
                title: "TEAM FORMATION",
                roleLabel: "FORMATION",
                showOverlay: false,
                badgeColor: "text-blue-400",
            };

        case "status_applied":
            return {
                title: "STATUS APPLIED",
                roleLabel: "AFFECTED",
                showOverlay: false,
                badgeColor: "text-purple-400",
            };

        case "status_tick":
            return {
                title: "STATUS EFFECT",
                roleLabel: "AFFECTED",
                showOverlay: false,
                badgeColor: "text-purple-400",
            };

        default:
            return {
                title: "COMBAT EVENT",
                roleLabel: "PARTICIPANT",
                showOverlay: false,
            };
    }
}

export default function EventCard({
    event,
    allChars,
    teamAChars,
    onImpact,
}: Props) {
    const { phase } = useCombatAnimation({
        event,
        onImpact,
    });

    const { log, attacker, defender, activePower } = event;

    const eventType = log.type as string;

    const presentation = getEventPresentation(eventType);

    const eventStyle =
        EVENT_STYLES[eventType] ?? EVENT_STYLES.attack;

    const EventIcon = eventStyle.Icon;

    // Choose the character affected by the event.
    const character: EnrichedFighter | null =
        eventType === "swap_row" || eventType === "team_order"
            ? attacker ?? defender ?? null
            : defender ?? attacker ?? null;

    // const activePower = resolveActivePower(
    //     log,
    //     character ?? undefined,
    //     allChars
    // );

    const isTeamA = isTeamACharacter(
        character,
        teamAChars
    );

    const badgeColor =
        presentation.badgeColor ?? eventStyle.text;


    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-4 sm:gap-4 sm:px-5">

            {/* Event heading */}
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        // eventStyle.bg,
                        // eventStyle.border
                    )}
                >
                    <EventIcon
                        className={cn("size-3.5", eventStyle.text)}
                    />
                </div>

                <span
                    className={cn(
                        "text-xs font-black tracking-widest text-center",
                        eventStyle.text
                    )}
                >
                    {presentation.title}
                </span>
            </div>

            {/* Character */}
            <AnimatePresence mode="wait">
                {character && (
                    <motion.div
                        key={character.id}
                        initial={{
                            opacity: 0,
                            y: 45,
                            scale: 0.85,
                            filter: "blur(8px)",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                        }}
                        exit={{
                            opacity: 0,
                            y: -35,
                            scale: 0.9,
                            filter: "blur(6px)",
                        }}
                        transition={{
                            duration: 0.55,
                            delay: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <FighterSlot
                            fighter={character}
                            roleLabel={presentation.roleLabel}
                            isTeamA={isTeamA}
                            action={presentation.action ?? log.actionName as CombatActionType}
                            showOverlay={true}
                            badgeColorClass={badgeColor}
                            activePower={activePower}
                            healPopup={
                                presentation.popupType === "heal"
                                    ? log.healing ?? null
                                    : null
                            }
                            prevHp={character.prevHp}
                            phase={phase}
                            isDefender={false}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* {character && (
                <FighterSlot
                    fighter={character}
                    roleLabel={presentation.roleLabel}
                    isTeamA={isTeamA}
                    action={presentation.action ?? log.actionName as CombatActionType}
                    showOverlay={true}
                    badgeColorClass={badgeColor}
                    activePower={activePower}
                    healPopup={
                        presentation.popupType === "heal"
                            ? log.healing ?? null
                            : null
                    }
                    prevHp={character.prevHp}
                    phase={phase}
                    isDefender={false}
                />
            )} */}

            {/* {character &&
                <FighterCard
                    size={200}
                    key={character.id}
                    fighter={character}
                    variant={teamAChars.find(c => c.name === character?.name) ? "primary" : "secondary"}
                    targetIds={[]}
                    hpReady={false}
                    koReady={false}
                    isSelectedActor={false}
                    isSelectedTarget={false}
                    isValidTarget={false}
                    canSelectActor={false}
                    eventType={eventType}
                    // eventRole={event.log.}
                    setAvatarRef={() => { }}
                    onClick={() => { }}
                />} */}


            {/* Power name */}
            {log.powerName && (
                <p className="text-center text-[9px] font-medium text-muted-foreground">
                    {log.powerName}
                </p>
            )}

            {/* Event description */}
            <p className="w-full max-w-[min(90vw,420px)] break-words text-center text-[10px] font-semibold text-muted-foreground sm:text-xs">
                {log.text}
            </p>
        </div>
    );
}
