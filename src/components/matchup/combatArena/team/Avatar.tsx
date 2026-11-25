import { CharacterImage } from "@/components/shared/CharacterImage";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Info, Lock, Shield, ShieldCheck, Skull, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import ScoreBadgeOnCard from "@/components/shared/ScoreBadgeOnCard";
import { MAX_SHIELDS_PER_FIGHTER } from "@/lib/matchup/combat/engine/CombatEngine";

type AvatarProps = {
    fighter: CombatFighter;
    size: number;
    variant: "primary" | "secondary";
    isAttacking?: boolean;
    isKO?: boolean;
    isHealing?: boolean;
    isReviving?: boolean;
    isDefending?: boolean;
    isInvolved?: boolean;
    isProtected?: boolean;
    onInspect?: () => void;
}

export default function Avatar({ fighter, size, variant, isAttacking, isKO, isHealing, isReviving, isDefending, isInvolved, isProtected = false, onInspect }: AvatarProps) {
    const dead = !fighter.isAlive;

    const shieldCount = (fighter.status ?? []).filter((s) => s.type === "shield" && s.duration > 0).length;

    const utilityCount = (fighter.status ?? []).filter((s) => s.type === "focus" && s.duration > 0).length;

    const stunStatus = (fighter.status ?? []).find((s) => s.type === "stun" && s.duration > 0);

    const stunImmunityStatus = (fighter.status ?? []).find((s) => s.type === "stun_immune" && s.duration > 0);

    const isStunned = !!stunStatus;
    const isStunImmune = !!stunImmunityStatus;

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

    const transition = isKO || dead
        ? { type: "spring" as const, stiffness: 280, damping: 24, delay: 0.15 }
        : { type: "spring" as const, stiffness: 420, damping: 22 };

    type FighterBadgeConfig = {
        id: string;
        show: boolean;
        icon: LucideIcon;
        iconClassName: string;
        badgeClassName: string;
        label?: string | number;
        title?: string;
    }

    const badges: FighterBadgeConfig[] = [
        {
            id: "shield",
            show: shieldCount > 0,
            icon: Shield,
            iconClassName: "size-2.5 text-white",
            badgeClassName: "-bottom-1.5 -right-1.5 z-20 bg-blue-600",
            label: `${shieldCount}/${MAX_SHIELDS_PER_FIGHTER}`,
        },
        {
            id: "protected",
            show: isProtected,
            icon: ShieldCheck,
            iconClassName: "size-2.5 text-white",
            badgeClassName: "bottom-3 -right-1.5 z-20 bg-amber-500",
            title: "Protected by an ally",
        },
        {
            id: "stunned",
            show: isStunned,
            icon: Lock,
            iconClassName: "size-3 text-white",
            badgeClassName: "-top-1.5 -right-1.5 z-31 bg-purple-600",
            label: stunStatus !== undefined ? `${stunStatus.duration}T` : undefined,
        },
        {
            id: "stun-immune",
            show: isStunImmune,
            icon: ShieldCheck,
            iconClassName: "size-3 text-white",
            badgeClassName: "-top-1.5 -right-1.5 z-30 bg-emerald-600",
            label: stunImmunityStatus !== undefined ? `${stunImmunityStatus.duration}T` : undefined,
        },
        {
            id: "utility",
            show: utilityCount > 0,
            icon: Crosshair,
            iconClassName: "size-2.5 text-white",
            badgeClassName: "-bottom-1.5 -left-1.5 z-20 bg-green-600",
            label: utilityCount,
        },
    ];

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
                    <div className={cn("absolute inset-2 rounded-lg ring-2 animate-ping pointer-events-none", variant === "primary" ? "ring-primary/45" : "ring-secondary/45")} />
                )}

                <>
                    {badges
                        .filter((badge) => badge.show)
                        .map(({ id, icon: Icon, iconClassName, badgeClassName, label, title }) => (
                            <motion.div
                                key={id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                title={title}
                                className={`absolute px-1 py-0.5 rounded-full border border-background flex items-center gap-0.5 shadow-md ${badgeClassName}`}
                            >
                                <Icon className={iconClassName} />
                                {label !== undefined && (
                                    <span className="text-[7px] font-bold text-white leading-none">
                                        {label}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                </>

                {/* KO overlay */}
                <AnimatePresence>
                    {isKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ ...transition, delay: 0.3 }}
                            className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-lg"
                        >
                            <Skull className="size-3.7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] text-white/80" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`flex max-w-full items-center justify-center gap-0.5 transition-colors hover:bg-${variant}/15 text-${variant} rounded-md px-2`}
                onClick={(event) => {
                    event.stopPropagation();
                    onInspect?.();
                }}
            >
                {/* text-foreground/85 */}
                <span className="max-w-[48px] truncate text-center text-[12px] font-bold  sm:max-w-[100px] sm:text-[15px]">
                    {fighter.name}
                </span>

                <button
                    type="button"
                    title={`Inspect ${fighter.name}`}
                    aria-label={`Inspect ${fighter.name}`}

                    className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground `}
                >
                    <Info className="size-3" />
                </button>
            </div>
        </motion.div>
    );
}