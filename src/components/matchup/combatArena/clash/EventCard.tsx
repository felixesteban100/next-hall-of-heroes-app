
import { cn } from "@/lib/utils";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView";
import { EVENT_STYLES } from "./constants/eventStyles";
import { isTeamACharacter } from "./utils/getTeamSide";
import { useCombatAnimation } from "./hooks/useCombatAnimation";
import FighterSlot from "./FighterSlot";

import type {
    CombatEvent,
    CombatFighter,
} from "@/lib/matchup/combat/types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import type { CombatActionType } from "@/components/shared/powerOverlay/PowerOverlay";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
    event: CombatEvent;
    fighters: CombatFighter[];
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    onImpact?: () => void;
    animationSpeed?: 1 | 2;
    skipSignal?: number;
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
    fighters,
    allChars,
    onImpact,
    animationSpeed = 1,
    skipSignal = 0,

}: Props) {
    const { phase, isSkipped } = useCombatAnimation({
        event,
        onImpact,
        speed: animationSpeed,
        skipSignal,
    });

    const eventType = event.type;
    const presentation = getEventPresentation(eventType);
    const eventStyle = EVENT_STYLES[eventType] ?? EVENT_STYLES.attack;
    const EventIcon = eventStyle.Icon;

    const attacker =
        fighters.find((fighter) => fighter.id === event.actorId) ??
        fighters.find((fighter) => fighter.name === event.attackerName);

    const defender =
        fighters.find((fighter) => event.targetIds?.includes(fighter.id)) ??
        fighters.find((fighter) => fighter.name === event.defenderName);

    const character =
        eventType === "swap_row" || eventType === "team_order"
            ? attacker ?? defender ?? null
            : defender ?? attacker ?? null;

    const activePower =
        event.power && "combatRole" in event.power
            ? event.power
            : resolveActivePower(event, attacker, allChars);

    const isTeamA = isTeamACharacter(character);
    const badgeColor = presentation.badgeColor ?? eventStyle.text;

    // CombatEvent carries the event-time HP snapshot for its affected target.
    const hasHpSnapshot =
        character != null &&
        event.hpBefore !== undefined &&
        event.hpAfter !== undefined;

    const displayCharacter: CombatFighter | null = character
        ? hasHpSnapshot
            ? { ...character, currentHp: event.hpAfter! }
            : character
        : null;

    const hpDifference = hasHpSnapshot
        ? event.hpBefore! - event.hpAfter!
        : 0;

    const statusDamage =
        eventType === "status_tick" ? Math.max(0, hpDifference) : 0;

    const statusHealing =
        eventType === "status_tick" ? Math.max(0, -hpDifference) : 0;

    const isStatusHpChange = statusDamage > 0 || statusHealing > 0;

    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-4 sm:gap-4 sm:px-5">
            <div className="flex items-center gap-2">
                <div>
                    <EventIcon className={cn("size-3.5", eventStyle.text)} />
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

            <AnimatePresence mode="wait">
                {displayCharacter && (
                    <motion.div
                        key={displayCharacter.id}
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
                            duration: isSkipped ? 0 : 0.55 / animationSpeed,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <FighterSlot
                            fighter={displayCharacter}
                            roleLabel={presentation.roleLabel}
                            isTeamA={isTeamA}
                            action={presentation.action}
                            showOverlay={presentation.showOverlay}
                            badgeColorClass={badgeColor}
                            activePower={activePower}
                            damagePopup={
                                statusDamage > 0 ? statusDamage : null
                            }
                            healPopup={
                                presentation.popupType === "heal"
                                    ? event.healing ?? null
                                    : statusHealing > 0
                                        ? statusHealing
                                        : null
                            }
                            prevHp={
                                hasHpSnapshot ? event.hpBefore : undefined
                            }
                            phase={phase}
                            isDefender={isStatusHpChange}
                            isSkipped={isSkipped}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {event.powerName && (
                <div className="text-xs font-bold text-muted-foreground">
                    {event.powerName}
                </div>
            )}

            <p className="text-center text-xs text-foreground/90">
                {event.text}
            </p>
        </div>
    );
}
