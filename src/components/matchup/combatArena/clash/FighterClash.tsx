
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { EVENT_STYLES } from "./constants/eventStyles";

import { getFighterMotionProfile } from "./utils/getFighterMotion";
import { getImpactDistance } from "./utils/getImpactDistance";
import { isTeamACharacter } from "./utils/getTeamSide";

import { useCombatAnimation } from "./hooks/useCombatAnimation";

import FighterSlot from "./FighterSlot";

import type { ClashCardProps } from "./types";

import { isRealPower, resolveActivePower } from "@/lib/matchup/cinematicCombatView";

import {
    ROLE_STYLES,
    ACTIVATION_VERB,
    RANGE_SUFFIX,
} from "./constants/roleStyles";

import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { useEffect } from "react";

export default function FighterClash({
    event,
    fighters,
    allChars,
    onImpact,
    animationSpeed = 1,
    skipSignal = 0,
}: ClashCardProps) {
    const { phase, triggerImpact, isSkipped } = useCombatAnimation({
        event,
        onImpact,
        speed: animationSpeed,
        skipSignal,
    });

    if (!event) return null;

    const eventType = event.type;

    const attacker =
        fighters.find((fighter) => fighter.id === event.actorId) ??
        fighters.find((fighter) => fighter.name === event.attackerName);

    const defender =
        fighters.find((fighter) => event.targetIds?.includes(fighter.id)) ??
        fighters.find((fighter) => fighter.name === event.defenderName);

    const eventStyle =
        EVENT_STYLES[eventType] ?? EVENT_STYLES.attack;

    const EventIcon = eventStyle.Icon;

    const activePower =
        event.power && isRealPower(event.power)
            ? event.power
            : resolveActivePower(event, attacker, allChars);

    const powerRole = activePower?.combatRole;

    const roleStyle = powerRole
        ? ROLE_STYLES[powerRole]
        : null;

    const RoleIcon = roleStyle?.Icon ?? EventIcon;

    const flavorLine = activePower
        ? `${ACTIVATION_VERB[activePower.activationType] ?? "Uses"} ${activePower.name} ${RANGE_SUFFIX[activePower.range] ?? ""}`
        : null;

    const isKO = eventType === "ko" || !!event.isKO;
    const isPower = eventType === "power";
    const isShieldAbsorption = (event.damageBlocked ?? 0) > 0;
    const isDefend = isShieldAbsorption;

    const damageValue = event.damage ?? (isKO ? 15 : null);

    const defenderChar = defender ?? attacker;
    const attackerChar = attacker ?? defender;

    const isDefenderInTeamA = isTeamACharacter(defenderChar);
    const isAttackerInTeamA = isTeamACharacter(attackerChar);

    const leftFighter = isDefend
        ? isDefenderInTeamA ? defenderChar : attackerChar
        : isAttackerInTeamA ? attackerChar : defenderChar;

    const rightFighter = isDefend
        ? isDefenderInTeamA ? attackerChar : defenderChar
        : isAttackerInTeamA ? defenderChar : attackerChar;

    const leftIsAttacker = isDefend
        ? !isDefenderInTeamA
        : isAttackerInTeamA;

    const rightIsAttacker = !leftIsAttacker;

    const leftIsKO = isKO && !leftIsAttacker;
    const rightIsKO = isKO && !rightIsAttacker;

    const leftDamagePopup = !leftIsAttacker ? damageValue : null;
    const rightDamagePopup = !rightIsAttacker ? damageValue : null;

    const fatigueValue = 30;

    const leftFatiguePopup = leftIsAttacker ? fatigueValue : null;
    const rightFatiguePopup = rightIsAttacker ? fatigueValue : null;

    const leftIsTeamA = isTeamACharacter(leftFighter);
    const rightIsTeamA = isTeamACharacter(rightFighter);

    const isEventTarget = (fighter: CombatFighter | null) =>
        !!fighter && (event.targetIds?.includes(fighter.id) ?? false);

    const getEventHp = (fighter: CombatFighter | undefined) => {
        if (!fighter || !isEventTarget(fighter)) return undefined;

        return {
            previous: event.hpBefore,
            current: event.hpAfter,
        };
    };

    const leftHp = getEventHp(leftFighter);
    const rightHp = getEventHp(rightFighter);

    const leftDisplayFighter = leftFighter && leftHp?.current !== undefined
        ? { ...leftFighter, currentHp: leftHp.current }
        : leftFighter;

    const rightDisplayFighter = rightFighter && rightHp?.current !== undefined
        ? { ...rightFighter, currentHp: rightHp.current }
        : rightFighter;

    const isShielded = (fighter: CombatFighter | null) =>
        !!fighter?.status.some(
            (status) => status.type === "shield" && status.duration > 0
        );

    // Both fighters use the same action classification.
    const leftAction = leftIsAttacker ? "attack" : "defend";
    const rightAction = rightIsAttacker ? "attack" : "defend";


    // Impact detection
    const handleAnimationUpdate = (
        latest: { x?: number | string },
        isAttacker: boolean
    ) => {
        if (!isAttacker) return;

        const currentX = Math.abs(parseFloat(String(latest.x ?? 0)) || 0);

        const impactDistance = getImpactDistance(powerRole);

        if (currentX >= impactDistance * 0.98) {
            triggerImpact();
        }
    };

    // Shared fighter animation settings
    const fighterTransition = {
        delay: isSkipped ? 0 : 0.3 / animationSpeed,
        duration: isSkipped ? 0 : 1 / animationSpeed,
        times: [0, 0.4, 0.75, 1],
        ease: [0.175, 0.885, 0.32, 1.275] as [
            number,
            number,
            number,
            number
        ],
    };

    const accentColorClass = leftIsAttacker
        ? "bg-primary"
        : "bg-secondary";

    const skippedMotion = {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
    };

    const leftMotionProfile = getFighterMotionProfile(
        powerRole,
        leftIsAttacker,
        leftIsTeamA,
        isDefend
    );

    const rightMotionProfile = getFighterMotionProfile(
        powerRole,
        rightIsAttacker,
        rightIsTeamA,
        isDefend
    );


    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-hidden px-2 py-3 sm:gap-4 sm:px-4">

            {/* Event Header */}
            <div className="flex w-full max-w-2xl flex-col items-center gap-1 text-center">
                <div
                    className={cn(
                        "flex items-center justify-center gap-2",
                        "rounded-full border border-white/10",
                        "bg-background/60 px-3 py-1"
                    )}
                >
                    <EventIcon
                        className={cn("size-3.5 shrink-0", eventStyle.text)}
                    />

                    <span
                        className={cn(
                            "text-[10px] font-black uppercase tracking-[0.16em] sm:text-xs",
                            eventStyle.text
                        )}
                    >
                        {isKO
                            ? eventStyle.label
                            : isDefend
                                ? "SHIELD BLOCK"
                                : isPower
                                    ? "POWER UNLEASHED"
                                    : eventStyle.label}
                    </span>
                </div>

                {flavorLine && (
                    <p className="max-w-full text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                        {flavorLine}
                    </p>
                )}
            </div>


            {/* Combat Scene */}
            <div className="grid w-full max-w-5xl min-w-0 grid-cols-2 items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(180px,220px)_minmax(0,1fr)] md:items-center md:gap-4">

                {/* Left Fighter */}
                <div className="col-start-1 row-start-1 flex min-w-0 justify-center">
                    <AnimatePresence mode="wait">
                        {leftFighter && (
                            <motion.div
                                key={leftFighter.id}
                                initial={{
                                    x: -50,
                                    opacity: 0,
                                    scale: 0.85,
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    x: -50,
                                    opacity: 0,
                                    scale: 0.85,
                                }}
                                transition={{
                                    duration: isSkipped ? 0 : 0.3 / animationSpeed,
                                    ease: "easeInOut",
                                }}
                                className="flex min-w-0 justify-center"
                            >
                                <motion.div
                                    key={`${event.id}-${leftFighter.id}`}
                                    animate={isSkipped ? skippedMotion : leftMotionProfile}
                                    onUpdate={(latest) =>
                                        handleAnimationUpdate(latest, leftIsAttacker)
                                    }
                                    transition={fighterTransition}
                                >
                                    <FighterSlot
                                        fighter={leftDisplayFighter}
                                        roleLabel={isDefend ? leftIsAttacker ? "⚔ ATTACKER" : "🛡 BLOCKS" : leftIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET"}
                                        isTeamA={leftIsTeamA}
                                        isKO={leftIsKO}
                                        action={leftAction}
                                        showOverlay={leftIsAttacker || isDefend}
                                        badgeColorClass={isDefend && !leftIsAttacker ? "text-cyan-400" : undefined}
                                        activePower={activePower}
                                        damagePopup={leftDamagePopup}
                                        fatiguePopup={leftFatiguePopup}
                                        phase={phase}
                                        isDefender={!leftIsAttacker && !isDefend}
                                        prevHp={leftHp?.previous}
                                        isSkipped={isSkipped}
                                        isShielded={
                                            isShielded(leftFighter) ||
                                            (isEventTarget(leftFighter) && (event.damageBlocked ?? 0) > 0)
                                        }
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Fighter */}
                <div className="col-start-2 row-start-1 flex min-w-0 justify-center md:col-start-3">
                    <AnimatePresence mode="wait">
                        {rightFighter && (
                            <motion.div
                                key={rightFighter.id}
                                initial={{
                                    x: 50,
                                    opacity: 0,
                                    scale: 0.85,
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    x: 50,
                                    opacity: 0,
                                    scale: 0.85,
                                }}
                                transition={{
                                    duration: isSkipped ? 0 : 0.3 / animationSpeed,
                                    ease: "easeInOut",
                                }}
                                className="flex min-w-0 justify-center"
                            >
                                <motion.div
                                    key={`${event.id}-${rightFighter.id}`}
                                    animate={isSkipped ? skippedMotion : rightMotionProfile}
                                    onUpdate={(latest) =>
                                        handleAnimationUpdate(latest, rightIsAttacker)
                                    }
                                    transition={fighterTransition}
                                >
                                    <FighterSlot
                                        fighter={rightDisplayFighter}
                                        roleLabel={isDefend ? rightIsAttacker ? "⚔ ATTACKER" : "🛡 BLOCKS" : rightIsAttacker ? "⚔ ATTACKER" : "🎯 TARGET"}
                                        isTeamA={rightIsTeamA}
                                        isKO={rightIsKO}
                                        action={rightAction}
                                        showOverlay={rightIsAttacker || isDefend}
                                        badgeColorClass={isDefend && !rightIsAttacker ? "text-cyan-400" : undefined}
                                        activePower={activePower}
                                        damagePopup={rightDamagePopup}
                                        fatiguePopup={rightFatiguePopup}
                                        phase={phase}
                                        isDefender={!rightIsAttacker && !isDefend}
                                        prevHp={rightHp?.previous}
                                        isSkipped={isSkipped}
                                        isShielded={
                                            isShielded(rightFighter) ||
                                            (isEventTarget(rightFighter) && (event.damageBlocked ?? 0) > 0)
                                        }
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center Hub */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 12 }}
                    animate={
                        isSkipped
                            ? { scale: 1, opacity: 1, y: 0 }
                            : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={{
                        delay: isSkipped ? 0 : 0.08 / animationSpeed,
                        duration: isSkipped ? 0 : undefined,
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                    }}
                    className="w-full col-span-2 col-start-1 row-start-2 flex min-w-0 flex-col items-center gap-5 md:col-span-1 md:col-start-2 md:row-start-1"
                >
                    {/* Power Header */}
                    {event.powerName && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: isSkipped ? 0 : 0.15 / animationSpeed,
                                duration: isSkipped ? 0 : 0.25,
                            }}
                            /* max-w-5xl w-[80%]  */
                            className={cn(
                                "relative flex min-w-0 items-center justify-center",
                                "overflow-hidden rounded-xl border px-3 py-2.5",
                                "shadow-lg backdrop-blur-md",
                                roleStyle
                                    ? `${roleStyle.bg} ${roleStyle.border} ${roleStyle.text}`
                                    : `${eventStyle.bg} ${eventStyle.border} ${eventStyle.text}`
                            )}
                        >
                            {/* Decorative glow */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                            <div className="relative flex min-w-0 max-w-full items-center justify-center gap-2">
                                <span className="shrink-0 text-sm opacity-80">
                                    {isDefend ? "🛡️" : "⚡"}
                                </span>

                                <span className="min-w-0 break-words text-center text-xs font-black tracking-wide sm:text-sm">
                                    {event.powerName}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Event Description */}
                    {event.text && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: isSkipped ? 0 : 0.22 / animationSpeed,
                                duration: isSkipped ? 0 : 0.3,
                            }}
                            /* rounded-xl border border-white/10 bg-gradient-to-b from-background/95 to-background/70 shadow-lg backdrop-blur-md */
                            /* max-w-5xl w-[80%] */
                            className=" relative min-w-0 overflow-hidden "
                        >
                            {/* Top accent */}
                            <div className={cn("h-[2px] w-full", accentColorClass /* : roleStyle ? roleStyle.border.replace("border-", "bg-") : eventStyle.border.replace("border-", "bg-") */)} />

                            <div className="flex min-w-0 flex-col items-center gap-2 px-3 py-3 sm:px-4">
                                {/* Event label */}
                                <div className="flex items-center gap-2">
                                    <span className={cn("h-1.5 w-1.5 rounded-full", accentColorClass)} />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        Combat Log
                                    </span>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", accentColorClass)} />
                                </div>

                                {/* Description */}
                                <p className="w-full whitespace-normal  text-center text-[11px] font-medium leading-relaxed text-foreground/90 sm:text-xs">
                                    {event.text}
                                </p>
                            </div>

                            {/* Bottom accent */}
                            <div className={cn("h-[2px] w-full", accentColorClass /* : roleStyle ? roleStyle.border.replace("border-", "bg-") : eventStyle.border.replace("border-", "bg-") */)} />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
