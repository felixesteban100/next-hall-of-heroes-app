import { CharacterImage } from "@/components/shared/CharacterImage";
import { EnrichedFighter } from "../CinematicCombatView";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, HeartPlus, Shield, ShieldAlert, Skull, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Avatar({
    fighter,
    size,
    variant,
    isMvp,
    isAttacking,
    isBeingHit,
    isKO,
    isHealing,
    isReviving,
    isDefending,
    isInvolved,
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
}) {
    const dead = !fighter.isAlive;

    const ringColor = isAttacking || isBeingHit || isInvolved ? (variant === "primary" ? "border-primary" : "border-secondary")
        : isReviving ? "border-purple-400"
            : isHealing ? "border-emerald-400"
                : isDefending ? "border-cyan-400"
                    : isMvp ? (variant === "primary" ? "border-primary/70" : "border-secondary/70")
                        : dead || isKO ? "border-white"
                            : (variant === "primary" ? "border-primary/25" : "border-secondary/25");

    const glowClass = isAttacking || isDefending || isInvolved ? (variant === "primary" ? "shadow-[0_0_12px_3px] shadow-primary/55" : "shadow-[0_0_12px_3px] shadow-secondary/55")
        : isReviving ? "shadow-[0_0_14px_3px] shadow-purple-400/60"
            : isHealing ? "shadow-[0_0_10px_2px] shadow-emerald-400/50"
                : dead || isKO ? "shadow-black/60"
                    : "";

    // Determine animate target. KO and dead states shrink + fade.
    // isKO is already phase-gated in TeamColumn (fires at KO_VISUAL_DELAY),
    // so by the time this prop flips true the health bar has already dropped.
    const animateTarget =
        /* isAttacking || isBeingHit || isDefending || isReviving || isKO ||  */isInvolved ? { scale: 1.1, opacity: 1 }
            // : isKO ? { scale: 0.82, opacity: 0.55 }
            // : dead ? { scale: 0.88, opacity: 0.3 }
            : { scale: 0.9, x: 0, y: 0, opacity: 0.9 };

    // KO transition gets a small extra delay so the shrink-fade settles
    // just after the health bar finishes its 700ms CSS animation.
    const transition =
        isKO || dead
            ? { type: "spring" as const, stiffness: 280, damping: 24, delay: 0.15 }
            : { type: "spring" as const, stiffness: 420, damping: 22 };

    console.log(fighter)

    return (
        <motion.div
            className="flex flex-col items-center gap-1 shrink-0"
            animate={animateTarget}
            transition={transition}
        >
            <div
                className={cn(
                    "relative rounded-xl border-2 transition-colors duration-300 shrink-0",
                    ringColor, glowClass
                )}
                style={{ width: size, height: size }}
            >
                <CharacterImage
                    src={fighter.image}
                    alt={fighter.name}
                    imageFocus={fighter.imageFocus}
                    fill
                    className="w-full h-full rounded-lg"
                />

                {(isAttacking || isBeingHit || isDefending || isReviving) && !dead && (
                    <div className={cn(
                        "absolute inset-2 rounded-xl ring-2 animate-ping pointer-events-none",
                        variant === "primary" ? "ring-primary/45" : "ring-secondary/45"
                    )} />
                )}

                {(isAttacking) && !dead && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="absolute -top-1.5 -left-1.5 bg-red-600 p-0.5 rounded-full border border-background z-20"
                    >
                        <Swords className="size-2.5 text-white" />
                    </motion.div>
                )}

                {(isBeingHit) && !dead && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="absolute -top-1.5 -left-1.5 bg-blue-600 p-0.5 rounded-full border border-background z-20"
                    >
                        <ShieldAlert className="size-2.5 text-white" />
                    </motion.div>
                )}

                {isBeingHit && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.35 }}
                    />
                )}

                {isDefending && !dead && (
                    <div className="absolute -top-1.5 -left-1.5 bg-cyan-500 p-0.5 rounded-full border border-background z-20">
                        <Shield className="size-2.5 text-white" />
                    </div>
                )}

                {(isReviving || isHealing) && !dead && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="absolute -top-1.5 -left-1.5 bg-green-600 p-0.5 rounded-full border border-background z-20"
                    >
                        <HeartPlus className="size-2.5 text-white" />
                    </motion.div>
                )}

                {isHealing && (
                    <motion.div
                        className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-xl"
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                )}

                {isReviving && (
                    <div className="absolute inset-0 bg-purple-400/30 animate-ping pointer-events-none rounded-xl" />
                )}

                {/* {isKO && (
                    <div className="absolute inset-0 bg-foreground/65 flex items-center justify-center rounded-lg">
                        <Skull className="size-3.5 text-background" />
                    </div>
                )} */}

                <AnimatePresence>
                    {isKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ ...transition, delay: 0.30 }/* { type: "spring", stiffness: 300, damping: 20, delay: 0.15 } */}
                            className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-lg"
                        >
                            <Skull className="size-3.7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isMvp && !dead && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-300 p-0.5 rounded-full border border-background z-20">
                        <Crown className="size-2.5 fill-black text-black" />
                    </div>
                )}
            </div>

            <span
                className={cn(
                    "text-center leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
                    !isInvolved && dead ? "text-muted-foreground/35 line-through" : "text-foreground/85"
                )}
            >
                {fighter.name}
            </span>
        </motion.div>
    );
}