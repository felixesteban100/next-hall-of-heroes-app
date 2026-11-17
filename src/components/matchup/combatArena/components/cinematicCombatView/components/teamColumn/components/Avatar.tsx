import { CharacterImage } from "@/components/shared/CharacterImage";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    Atom,
    Crosshair,
    HeartPlus,
    HeartPulse,
    Lock,
    RefreshCw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Skull,
    Sparkles,
    Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedFighter } from "@/lib/matchup/combat/adapters";
import { PowerRole } from "@/types";
import ScoreBadgeOnCard from "@/components/shared/ScoreBadgeOnCard";
import { MAX_SHIELDS_PER_FIGHTER } from "@/lib/matchup/combat/CombatEngine";

function getEventVisual(
    eventType?: string,
    isActor?: boolean,
    isTarget?: boolean,
    eventRole?: PowerRole
) {
    const iconClass = "size-2.5";

    const visual = (
        Icon: typeof Swords,
        text: string,
        badge: string
    ) => ({
        icon: <Icon className={cn(iconClass, text)} />,
        badge,
    });

    // Only show badges on characters involved in the current event.
    if (!isActor && !isTarget) return null;

    switch (eventType) {
        case "attack":
        case "ko":
            return isActor
                ? visual(Swords, "text-white", "bg-red-500 border-orange-500/40")
                : visual(ShieldAlert, "text-white", "bg-blue-500 border-blue-500/40");

        case "power": {
            if (isTarget && !isActor) {
                return visual(ShieldAlert, "text-white", "bg-purple-500 border-blue-500/40");
            }

            const roleStyles: Record<
                PowerRole,
                { Icon: typeof Swords; text: string; badge: string }
            > = {
                Offensive: {
                    Icon: Swords,
                    text: "text-white",
                    badge: "bg-red-500 border-red-500/40",
                },
                Defensive: {
                    Icon: Shield,
                    text: "text-white",
                    badge: "bg-cyan-500 border-cyan-500/40",
                },
                Control: {
                    Icon: Lock,
                    text: "text-white",
                    badge: "bg-violet-500 border-violet-500/40",
                },
                Utility: {
                    Icon: Sparkles,
                    text: "text-white",
                    badge: "bg-emerald-500 border-emerald-500/40",
                },
                "Hybrid / Versatile": {
                    Icon: Atom,
                    text: "text-white",
                    badge: "bg-amber-500 border-amber-500/40",
                },
            };

            const style = eventRole
                ? roleStyles[eventRole]
                : {
                    Icon: Swords,
                    text: "text-white",
                    badge: "bg-violet-500 border-violet-500/40",
                };

            return visual(style.Icon, style.text, style.badge);
        }

        case "defend":
            return isActor
                ? visual(Swords, "text-white", "bg-red-500 border-orange-500/40")
                : visual(Shield, "text-white", "bg-cyan-500 border-cyan-500/40");

        case "heal":
            return isActor
                ? visual(HeartPulse, "text-white", "bg-emerald-500 border-emerald-500/40")
                : visual(HeartPlus, "text-white", "bg-emerald-500 border-emerald-500/40");

        case "revive":
            return visual(RefreshCw, "text-white", "bg-purple-500 border-purple-500/40");

        case "status_applied":
            return visual(
                Sparkles,
                "text-white",
                "bg-purple-500 border-fuchsia-500/40"
            );

        case "status_tick":
            return visual(
                Activity,
                "text-white",
                "bg-sky-500 border-sky-500/40"
            );

        // case "ko":
        //     return isActor
        //         ? visual(Swords, "text-white", "bg-red-500 border-orange-500/40")
        //         : visual(Skull, "text-white", "bg-orange-500 border-orange-500/40");

        // case "finish":
        //     return isActor
        //         ? visual(Swords, "text-white", "bg-red-500 border-orange-500/40")
        //         : visual(Skull, "text-white", "bg-orange-500 border-orange-500/40");

        case "rout":
            return visual(Skull, "text-white", "bg-orange-500 border-orange-500/40")

        default:
            return null;
    }
}

export default function Avatar({
    fighter,
    size,
    variant,
    isAttacking,
    isBeingHit,
    isKO,
    isHealing,
    isReviving,
    isDefending,
    isInvolved,
    eventType,
    eventRole,
}: {
    fighter: EnrichedFighter;
    size: number;
    variant: "primary" | "secondary";
    isMvp?: boolean;
    isAttacking?: boolean;
    isBeingHit?: boolean;
    isKO?: boolean;
    isHealing?: boolean;
    isReviving?: boolean;
    isDefending?: boolean;
    isInvolved?: boolean;
    eventType?: string;
    eventRole?: PowerRole;
}) {
    const dead = !fighter.isAlive;

    const shieldCount = (fighter.status ?? []).filter(
        (s) => s.type === "shield" && s.duration > 0
    ).length;

    const utilityCount = (fighter.status ?? []).filter(
        (s) => s.type === "focus" && s.duration > 0
    ).length;

    const stunStatus = (fighter.status ?? []).find(
        (s) => s.type === "stun" && s.duration > 0
    );

    const stunImmunityStatus = (fighter.status ?? []).find(
        (s) => s.type === "stun_immune" && s.duration > 0
    );

    const isStunned = !!stunStatus;
    const isStunImmune = !!stunImmunityStatus;

    const eventVisual = getEventVisual(
        eventType,
        isAttacking,
        isBeingHit,
        eventRole
    );

    const glowClass =
        isAttacking || isDefending || isInvolved
            ? variant === "primary"
                ? "shadow-[0_0_12px_3px] shadow-primary/55"
                : "shadow-[0_0_12px_3px] shadow-secondary/55"
            : isReviving
                ? "shadow-[0_0_14px_3px] shadow-purple-400/60"
                : isHealing
                    ? "shadow-[0_0_10px_2px] shadow-emerald-400/50"
                    : dead || isKO
                        ? "shadow-black/60"
                        : "";

    const animateTarget = isInvolved
        ? { scale: 1.1, opacity: 1 }
        : { scale: 0.9, x: 0, y: 0, opacity: 0.9 };

    const transition =
        isKO || dead
            ? {
                type: "spring" as const,
                stiffness: 280,
                damping: 24,
                delay: 0.15,
            }
            : {
                type: "spring" as const,
                stiffness: 420,
                damping: 22,
            };

    return (
        <motion.div
            className="flex flex-col items-center gap-1 shrink-0"
            animate={animateTarget}
            transition={transition}
        >
            <div
                className={cn(
                    "relative rounded-lg transition-all duration-300 shrink-0",
                    glowClass
                )}
                style={{ width: size, height: size }}
            >
                <ScoreBadgeOnCard
                    entity={fighter.original}
                    score={fighter.overall}
                    side="front"
                />
                <CharacterImage
                    src={fighter.image}
                    alt={fighter.name}
                    imageFocus={fighter.imageFocus}
                    fill
                    className="w-full h-full rounded-lg"
                />

                {isInvolved && !dead && (
                    <div
                        className={cn(
                            "absolute inset-2 rounded-lg ring-2 animate-ping pointer-events-none",
                            variant === "primary"
                                ? "ring-primary/45"
                                : "ring-secondary/45"
                        )}
                    />
                )}

                {/* Combat log event badge */}
                <AnimatePresence mode="wait">
                    {eventVisual && (
                        <motion.div
                            key={eventType}
                            initial={{ scale: 0, opacity: 0, rotate: -25 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 22,
                            }}
                            className={cn(
                                "absolute -top-1.5 -left-1.5 z-20",
                                "flex items-center justify-center",
                                "rounded-full border p-1",
                                "shadow-md backdrop-blur-sm",
                                eventVisual.badge
                            )}
                        >
                            {eventVisual.icon}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Damage flash */}
                {isBeingHit && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.35 }}
                    />
                )}



                {/* Healing animation */}
                {isHealing && (
                    <motion.div
                        className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-lg"
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                )}

                {/* Revive animation */}
                {isReviving && (
                    <div className="absolute inset-0 bg-yellow-400/30 animate-ping pointer-events-none rounded-lg" />
                )}

                {/* Active shield count */}
                {shieldCount > 0 && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1.5 -right-1.5 z-20 bg-blue-600 px-1 py-0.5 rounded-full border border-background flex items-center gap-0.5 shadow-md"
                    >
                        <Shield className="size-2.5 text-white" />
                        <span className="text-[7px] font-bold text-white leading-none">
                            {shieldCount}/{MAX_SHIELDS_PER_FIGHTER}
                        </span>
                    </motion.div>
                )}

                {isStunned && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 z-30 bg-purple-600 px-1 py-0.5 rounded-full border border-background flex items-center gap-0.5 shadow-md"
                    >
                        <Lock className="size-3 text-white" />
                        <span className="text-[7px] font-bold text-white leading-none">
                            {stunStatus.duration}T
                        </span>
                    </motion.div>
                )}

                {isStunImmune && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 z-30 bg-emerald-600 px-1 py-0.5 rounded-full border border-background flex items-center gap-0.5 shadow-md"
                    >
                        <ShieldCheck className="size-3 text-white" />
                        <span className="text-[7px] font-bold text-white leading-none">
                            {stunImmunityStatus.duration}T
                        </span>
                    </motion.div>
                )}

                {utilityCount > 0 && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1.5 -left-1.5 z-20 bg-green-600 px-1 py-0.5 rounded-full border border-background flex items-center gap-0.5 shadow-md"
                    >
                        <Crosshair className="size-2.5 text-white" />
                        <span className="text-[7px] font-bold text-white leading-none">
                            {utilityCount}
                        </span>
                    </motion.div>
                )}


                {/* KO overlay */}
                <AnimatePresence>
                    {isKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{
                                scale: 2.2,
                                opacity: 0,
                                rotate: -15,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                ...transition,
                                delay: 0.3,
                            }}
                            className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-lg"
                        >
                            <Skull className="size-3.7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] text-white/80" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span
                className={cn(
                    "text-center text-foreground/85 leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
                )}
            >
                {fighter.name}
            </span>
        </motion.div>
    );
}