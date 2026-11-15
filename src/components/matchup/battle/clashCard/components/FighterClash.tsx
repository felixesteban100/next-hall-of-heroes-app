
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { resolveActivePower } from "@/lib/matchup/cinematicCombatView";

import { EVENT_STYLES } from "../constants/eventStyles";

import { getFighterMotionProfile } from "../utils/getFighterMotion";
import { getImpactDistance } from "../utils/getImpactDistance";
import { isTeamACharacter } from "../utils/getTeamSide";

import { useCombatAnimation } from "../hooks/useCombatAnimation";

import FighterSlot from "./FighterSlot";

import type { ClashCardProps } from "../types";

import {
    ROLE_STYLES,
    ACTIVATION_VERB,
    RANGE_SUFFIX,
} from "../constants/roleStyles";

export default function FighterClash({
    event,
    allChars,
    teamAChars,
    onImpact,
}: ClashCardProps) {
    const { phase, triggerImpact } = useCombatAnimation({
        event,
        onImpact,
    });

    if (!event) return null;

    const { log, attacker, defender } = event;

    const eventType = log.type as string;

    const eventStyle =
        EVENT_STYLES[eventType] ?? EVENT_STYLES.attack;

    const EventIcon = eventStyle.Icon;

    // Active power information
    const activePower = resolveActivePower(
        log,
        attacker,
        allChars
    );

    const powerRole = activePower?.combatRole;

    const roleStyle = powerRole
        ? ROLE_STYLES[powerRole]
        : null;

    const RoleIcon = roleStyle?.Icon ?? EventIcon;

    const flavorLine = activePower
        ? `${ACTIVATION_VERB[activePower.activationType] ?? "Uses"} ${activePower.name} ${RANGE_SUFFIX[activePower.range] ?? ""}`
        : null;

    // Event classification
    const isKO =
        eventType === "ko" ||
        eventType === "finish" ||
        eventType === "rout" ||
        !!log.isKO;

    const isPower = eventType === "power";

    const isShieldAbsorption =
        eventType === "defend" &&
        !!log.defenderName;

    const isDefend = isShieldAbsorption;

    // Damage information
    const damageValue = log.damage ?? (isKO ? 15 : null);

    // Determine fighter sides
    const defenderChar = defender ?? attacker;
    const attackerChar = attacker ?? defender;

    const isDefenderInTeamA = isTeamACharacter(
        defenderChar,
        teamAChars
    );

    const isAttackerInTeamA = isTeamACharacter(
        attackerChar,
        teamAChars
    );

    // Position fighters from Team A on the left.
    const leftFighter = isDefend
        ? isDefenderInTeamA
            ? defenderChar
            : attackerChar
        : isAttackerInTeamA
            ? attacker
            : defender;

    const rightFighter = isDefend
        ? isDefenderInTeamA
            ? attackerChar
            : defenderChar
        : isAttackerInTeamA
            ? defender
            : attacker;

    const leftIsAttacker = isDefend
        ? !isDefenderInTeamA
        : isAttackerInTeamA;

    const rightIsAttacker = !leftIsAttacker;

    // Fighter-specific states
    const leftIsKO = isKO && !leftIsAttacker;
    const rightIsKO = isKO && !rightIsAttacker;

    const leftDamagePopup = !leftIsAttacker
        ? damageValue
        : null;

    const rightDamagePopup = !rightIsAttacker
        ? damageValue
        : null;

    const leftIsTeamA = isTeamACharacter(
        leftFighter,
        teamAChars
    );

    const rightIsTeamA = isTeamACharacter(
        rightFighter,
        teamAChars
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

        const currentX = Math.abs(Number(latest.x ?? 0));

        const impactDistance = getImpactDistance(powerRole);

        if (currentX >= impactDistance * 0.98) {
            triggerImpact();
        }
    };

    // Shared fighter animation settings
    const fighterTransition = {
        delay: 0.3,
        duration: 1,
        times: [0, 0.4, 0.75, 1],
        ease: [0.175, 0.885, 0.32, 1.275] as [
            number,
            number,
            number,
            number
        ],
    };

    return (
        <div className=" flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden gap-4">
            {/* Event Header */}
            <div className="flex w-full flex-col items-center gap-1 px-2 text-center">
                <div className="flex items-center gap-1.5">
                    <EventIcon
                        className={cn(
                            "size-3.5",
                            eventStyle.text
                        )}
                    />

                    <span
                        className={cn(
                            "text-[10px] font-black tracking-wider uppercase",
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

                <p className="max-w-full text-[10px] text-muted-foreground/80 text-center whitespace-normal break-words sm:max-w-[420px]">
                    {flavorLine}
                </p>
            </div>

            {/* Fighters */}
            <div className="w-full flex flex-col justify-center items-center gap-3">
                <div className="flex gap-5">
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
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="flex min-w-0 justify-center"
                                >
                                    <motion.div
                                        animate={getFighterMotionProfile(
                                            powerRole,
                                            leftIsAttacker,
                                            leftIsTeamA,
                                            isDefend
                                        )}
                                        onUpdate={(latest) =>
                                            handleAnimationUpdate(latest, leftIsAttacker)
                                        }
                                        transition={fighterTransition}
                                    >
                                        <FighterSlot
                                            fighter={leftFighter}
                                            roleLabel={
                                                isDefend
                                                    ? leftIsAttacker
                                                        ? "⚔ ATTACKER"
                                                        : "🛡 BLOCKS"
                                                    : leftIsAttacker
                                                        ? "⚔ ATTACKER"
                                                        : "🎯 TARGET"
                                            }
                                            isTeamA={leftIsTeamA}
                                            isKO={leftIsKO}
                                            action={leftAction}
                                            showOverlay={leftIsAttacker || isDefend}
                                            badgeColorClass={
                                                isDefend && !leftIsAttacker
                                                    ? "text-cyan-400"
                                                    : undefined
                                            }
                                            activePower={activePower}
                                            damagePopup={leftDamagePopup}
                                            prevHp={leftFighter.prevHp}
                                            phase={phase}
                                            isDefender={!leftIsAttacker && !isDefend}
                                            isShielded={leftFighter.isShielded}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Fighter */}
                    <div className="col-start-2 row-start-1 flex min-w-0 justify-center sm:col-start-3">
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
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="flex min-w-0 justify-center"
                                >
                                    <motion.div
                                        animate={getFighterMotionProfile(
                                            powerRole,
                                            rightIsAttacker,
                                            rightIsTeamA,
                                            isDefend
                                        )}
                                        onUpdate={(latest) =>
                                            handleAnimationUpdate(latest, rightIsAttacker)
                                        }
                                        transition={fighterTransition}
                                    >
                                        <FighterSlot
                                            fighter={rightFighter}
                                            roleLabel={
                                                isDefend
                                                    ? rightIsAttacker
                                                        ? "⚔ ATTACKER"
                                                        : "🛡 BLOCKS"
                                                    : rightIsAttacker
                                                        ? "⚔ ATTACKER"
                                                        : "🎯 TARGET"
                                            }
                                            isTeamA={rightIsTeamA}
                                            isKO={rightIsKO}
                                            action={rightAction}
                                            showOverlay={rightIsAttacker || isDefend}
                                            badgeColorClass={
                                                isDefend && !rightIsAttacker
                                                    ? "text-cyan-400"
                                                    : undefined
                                            }
                                            activePower={activePower}
                                            damagePopup={rightDamagePopup}
                                            prevHp={rightFighter.prevHp}
                                            phase={phase}
                                            isDefender={!rightIsAttacker && !isDefend}
                                            isShielded={rightFighter.isShielded}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center Hub */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.08,
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                    }}
                    className="flex w-[80%] min-w-0 max-w-full flex-col items-center gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:max-w-[220px]"
                >
                    {/* Power Header */}
                    {log.powerName && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.25 }}
                            className={cn(
                                "relative flex w-full items-center justify-center overflow-hidden",
                                "rounded-lg border px-3 py-2",
                                "shadow-lg backdrop-blur-md",
                                isDefend
                                    ? "border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-cyan-500/20 shadow-cyan-500/10"
                                    : roleStyle
                                        ? `${roleStyle.bg} ${roleStyle.border} ${roleStyle.text}`
                                        : `${eventStyle.bg} ${eventStyle.border} ${eventStyle.text}`
                            )}
                        >
                            {/* Decorative glow */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                            <div className="relative flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-sm opacity-80">
                                    {isDefend ? "🛡️" : "⚡"}
                                </span>

                                <span className="truncate text-center text-sm font-black tracking-wide sm:text-base">
                                    {log.powerName}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Event Description */}
                    {log.text && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22, duration: 0.3 }}
                            className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-background/90 to-background/60 shadow-xl backdrop-blur-md"
                        >
                            {/* Top accent */}
                            <div
                                className={cn(
                                    "h-[2px] w-full",
                                    isDefend
                                        ? "bg-cyan-400" : `bg-${leftIsAttacker ? "primary" : "secondary"}`
                                    /* : roleStyle
                                        ? roleStyle.border.replace("border-", "bg-")
                                        : eventStyle.border.replace("border-", "bg-") */
                                )}
                            />

                            <div className="flex flex-col items-center gap-2 px-3 py-3">
                                {/* Event label */}
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            // isDefend ? "bg-cyan-400" : "bg-primary"
                                            isDefend
                                                ? "bg-cyan-400" : `bg-${leftIsAttacker ? "primary" : "secondary"}`
                                        )}
                                    />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        Combat Log
                                    </span>
                                    <span
                                        className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            // isDefend ? "bg-cyan-400" : "bg-primary"
                                            isDefend
                                                ? "bg-cyan-400" : `bg-${leftIsAttacker ? "primary" : "secondary"}`
                                        )}
                                    />
                                </div>

                                {/* Description */}
                                <p className="w-full whitespace-normal break-words text-center text-[11px] font-medium leading-relaxed tracking-wide text-foreground/90 sm:text-xs">
                                    {log.text}
                                </p>
                            </div>

                            {/* Bottom accent */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
