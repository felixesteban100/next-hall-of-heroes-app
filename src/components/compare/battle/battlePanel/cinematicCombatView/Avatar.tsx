import { CharacterImage } from "@/components/shared/CharacterImage";
import { EnrichedFighter } from "../CinematicCombatView";
import { motion } from "framer-motion";
import { Crown, Shield, Skull, Swords } from "lucide-react";
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
}) {
    const dead = !fighter.isAlive;

    const ringColor = dead ? "border-muted-foreground/20"
        : isKO ? "border-orange-500"
            : isReviving ? "border-purple-400"
                : isHealing ? "border-emerald-400"
                    : isDefending ? "border-cyan-400"
                        : isAttacking ? (variant === "primary" ? "border-primary" : "border-secondary")
                            : isBeingHit ? (variant === "primary" ? "border-secondary/70" : "border-primary/70")
                                : isMvp ? (variant === "primary" ? "border-primary/70" : "border-secondary/70")
                                    : (variant === "primary" ? "border-primary/25" : "border-secondary/25");

    const glowClass = dead ? ""
        : isKO ? "shadow-[0_0_12px_2px] shadow-orange-500/50"
            : isReviving ? "shadow-[0_0_14px_3px] shadow-purple-400/60"
                : isHealing ? "shadow-[0_0_10px_2px] shadow-emerald-400/50"
                    : isDefending ? "shadow-[0_0_8px_2px]  shadow-cyan-400/40"
                        : isAttacking ? (variant === "primary" ? "shadow-[0_0_12px_3px] shadow-primary/55" : "shadow-[0_0_12px_3px] shadow-secondary/55")
                            : "";

    return (
        <motion.div
            className="flex flex-col items-center gap-1 shrink-0"
            animate={
                isAttacking ? { scale: 1.12 }
                    : isBeingHit ? { scale: 0.88, x: variant === "primary" ? 4 : -4 }
                        : isKO ? { scale: 0.82, opacity: 0.55 }
                            : dead ? { scale: 0.88, opacity: 0.3 }
                                : { scale: 1, x: 0, y: 0, opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
        >
            <div
                className={cn(
                    "relative rounded-xl border-2 transition-colors duration-300 shrink-0",
                    ringColor, glowClass,
                    dead && "grayscale"
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

                {isAttacking && !dead && (
                    <div className={cn(
                        "absolute inset-0 rounded-xl ring-2 animate-ping pointer-events-none",
                        variant === "primary" ? "ring-primary/45" : "ring-secondary/45"
                    )} />
                )}

                {isBeingHit && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.35 }}
                    />
                )}

                {isHealing && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-xl"
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                )}

                {isReviving && (
                    <div className="absolute inset-0 bg-purple-400/30 animate-ping pointer-events-none rounded-xl" />
                )}

                {dead && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-lg">
                        <Skull className="size-3.5" />
                    </div>
                )}

                {isAttacking && !dead && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="absolute -top-1.5 -left-1.5 bg-red-600 p-0.5 rounded-full border border-background z-20"
                    >
                        <Swords className="size-2.5 text-white" />
                    </motion.div>
                )}

                {isDefending && !dead && (
                    <div className="absolute -top-1.5 -left-1.5 bg-cyan-500 p-0.5 rounded-full border border-background z-20">
                        <Shield className="size-2.5 text-white" />
                    </div>
                )}

                {isMvp && !dead && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-300 p-0.5 rounded-full border border-background z-20">
                        <Crown className="size-2.5 fill-black text-black" />
                    </div>
                )}
            </div>

            <span
                className={cn(
                    "text-center leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
                    dead ? "text-muted-foreground/35 line-through" : "text-foreground/85"
                )}
            >
                {fighter.name}
            </span>
        </motion.div>
    );
}