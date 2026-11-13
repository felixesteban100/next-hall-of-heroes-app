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
    Skull,
    Sparkles,
    Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedFighter } from "@/lib/matchup/combat/adapters";
import { PowerRole } from "@/types";

// function getEventVisual(
//     eventType?: string,
//     isActor?: boolean,
//     isTarget?: boolean,
//     eventRole?: PowerRole
// ) {
//     const iconClass = "size-2.5";

//     const visual = (
//         Icon: typeof Swords,
//         text: string,
//         badge: string
//     ) => ({
//         icon: <Icon className={cn(iconClass, text)} />,
//         badge,
//     });

//     // Only show badges on characters involved in the current event.
//     if (!isActor && !isTarget) return null;

//     switch (eventType) {
//         case "attack":
//             return isActor
//                 ? visual(Swords, "text-orange-400", "bg-orange-500/15 border-orange-500/40")
//                 : visual(ShieldAlert, "text-blue-400", "bg-blue-500/15 border-blue-500/40");

//         case "power": {
//             if (isTarget && !isActor) {
//                 return visual(
//                     ShieldAlert,
//                     "text-violet-400",
//                     "bg-violet-500/15 border-violet-500/40"
//                 );
//             }

//             const roleStyles: Record<
//                 PowerRole,
//                 { Icon: typeof Swords; text: string; badge: string }
//             > = {
//                 Offensive: {
//                     Icon: Swords,
//                     text: "text-red-400",
//                     badge: "bg-red-500/15 border-red-500/40",
//                 },
//                 Defensive: {
//                     Icon: Shield,
//                     text: "text-cyan-400",
//                     badge: "bg-cyan-500/15 border-cyan-500/40",
//                 },
//                 Control: {
//                     Icon: Lock,
//                     text: "text-violet-400",
//                     badge: "bg-violet-500/15 border-violet-500/40",
//                 },
//                 Utility: {
//                     Icon: Sparkles,
//                     text: "text-emerald-400",
//                     badge: "bg-emerald-500/15 border-emerald-500/40",
//                 },
//                 "Hybrid / Versatile": {
//                     Icon: Atom,
//                     text: "text-amber-400",
//                     badge: "bg-amber-500/15 border-amber-500/40",
//                 },
//             };

//             const style = eventRole
//                 ? roleStyles[eventRole]
//                 : {
//                     Icon: Swords,
//                     text: "text-violet-400",
//                     badge: "bg-violet-500/15 border-violet-500/40",
//                 };

//             return visual(style.Icon, style.text, style.badge);
//         }

//         case "defend":
//             return visual(
//                 Shield,
//                 "text-cyan-400",
//                 "bg-cyan-500/15 border-cyan-500/40"
//             );

//         case "heal":
//             return isActor
//                 ? visual(HeartPulse, "text-emerald-400", "bg-emerald-500/15 border-emerald-500/40")
//                 : visual(HeartPlus, "text-emerald-400", "bg-emerald-500/15 border-emerald-500/40");

//         case "revive":
//             return visual(
//                 RefreshCw,
//                 "text-purple-400",
//                 "bg-purple-500/15 border-purple-500/40"
//             );

//         case "status_applied":
//             return visual(
//                 Sparkles,
//                 "text-fuchsia-400",
//                 "bg-fuchsia-500/15 border-fuchsia-500/40"
//             );

//         case "status_tick":
//             return visual(
//                 Activity,
//                 "text-sky-400",
//                 "bg-sky-500/15 border-sky-500/40"
//             );

//         case "ko":
//             return visual(
//                 Skull,
//                 "text-orange-400",
//                 "bg-orange-500/15 border-orange-500/40"
//             );

//         case "finish":
//             return isActor
//                 ? visual(Swords, "text-red-400", "bg-red-500/15 border-red-500/40")
//                 : visual(Skull, "text-red-400", "bg-red-500/15 border-red-500/40");

//         case "rout":
//             return visual(
//                 Skull,
//                 "text-red-400",
//                 "bg-red-500/15 border-red-500/40"
//             );

//         default:
//             return null;
//     }
// }

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
    isStunned,
    isFocused,
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
    isStunned?: boolean;
    isFocused?: boolean;
    isInvolved?: boolean;
    eventType?: string;
    eventRole?: PowerRole;
}) {
    const dead = !fighter.isAlive;

    const shieldCount = (fighter.status ?? []).filter(
        (s) => s.type === "shield" && s.duration > 0
    ).length;

    // const eventVisual = getEventVisual(
    //     eventType,
    //     isAttacking,
    //     isBeingHit,
    //     eventRole
    // );

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
                {/* <AnimatePresence mode="wait">
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
                </AnimatePresence> */}

                {/* Damage flash */}
                {/* {isBeingHit && !dead && (
                    <motion.div
                        className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.35 }}
                    />
                )} */}

                {/* Active shield count */}
                {shieldCount > 0 && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1.5 -right-1.5 bg-blue-600 px-1 py-0.5 rounded-full border border-background z-20 flex items-center gap-0.5 shadow-md"
                    >
                        <Shield className="size-2.5 text-white" />
                        <span className="text-[7px] font-bold text-white leading-none">
                            {shieldCount}
                        </span>
                    </motion.div>
                )}

                {/* Healing animation */}
                {/* {isHealing && (
                    <motion.div
                        className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-lg"
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                )} */}

                {/* Revive animation */}
                {/* {isReviving && (
                    <div className="absolute inset-0 bg-purple-400/30 animate-ping pointer-events-none rounded-lg" />
                )} */}

                {isStunned && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 z-30 flex items-center justify-center size-5 rounded-full bg-purple-500"
                    >
                        <Lock className="size-3 text-white" />
                    </motion.div>
                )}

                {isFocused && !dead && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 z-30 flex items-center justify-center size-5 rounded-full bg-green-500"
                    >
                        <Crosshair className="size-3 text-white" />
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
                    "text-center leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
                    /* !isInvolved && dead
                        ? "text-muted-foreground/35 line-through"
                        :  */"text-foreground/85"
                )}
            >
                {fighter.name}
            </span>
        </motion.div>
    );
}


// import { CharacterImage } from "@/components/shared/CharacterImage";
// import { AnimatePresence, motion } from "framer-motion";
// import { Crown, HeartPlus, Shield, ShieldAlert, Skull, Swords } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { EnrichedFighter } from "@/lib/matchup/combat/adapters";

// export default function Avatar({
//     fighter,
//     size,
//     variant,
//     isMvp,
//     isAttacking,
//     isBeingHit,
//     isKO,
//     isHealing,
//     isReviving,
//     isDefending,
//     isInvolved,
// }: {
//     fighter: EnrichedFighter;
//     size: number;
//     variant: "primary" | "secondary";
//     isMvp?: boolean;
//     isAttacking?: boolean;
//     isBeingHit?: boolean;
//     isKO?: boolean;
//     isHealing?: boolean;
//     isReviving?: boolean;
//     isDefending?: boolean;
//     isInvolved?: boolean;
// }) {
//     const dead = !fighter.isAlive;

//     // const ringColor = isAttacking || isBeingHit || isInvolved ? (variant === "primary" ? "border-primary" : "border-secondary")
//     //     : isReviving ? "border-purple-400"
//     //         : isHealing ? "border-emerald-400"
//     //             : isDefending ? "border-cyan-400"
//     //                 : isMvp ? (variant === "primary" ? "border-primary/70" : "border-secondary/70")
//     //                     : dead || isKO ? "border-white"
//     //                         : (variant === "primary" ? "border-primary/25" : "border-secondary/25");

//     const shieldCount = (fighter.status ?? []).filter((s) => s.type === "shield" && s.duration > 0).length;

//     const glowClass = isAttacking || isDefending || isInvolved ? (variant === "primary" ? "shadow-[0_0_12px_3px] shadow-primary/55" : "shadow-[0_0_12px_3px] shadow-secondary/55")
//         : isReviving ? "shadow-[0_0_14px_3px] shadow-purple-400/60"
//             : isHealing ? "shadow-[0_0_10px_2px] shadow-emerald-400/50"
//                 : dead || isKO ? "shadow-black/60"
//                     : "";

//     // Determine animate target. KO and dead states shrink + fade.
//     // isKO is already phase-gated in TeamColumn (fires at KO_VISUAL_DELAY),
//     // so by the time this prop flips true the health bar has already dropped.
//     const animateTarget =
//         /* isAttacking || isBeingHit || isDefending || isReviving || isKO ||  */isInvolved ? { scale: 1.1, opacity: 1 }
//             // : isKO ? { scale: 0.82, opacity: 0.55 }
//             // : dead ? { scale: 0.88, opacity: 0.3 }
//             : { scale: 0.9, x: 0, y: 0, opacity: 0.9 };

//     // KO transition gets a small extra delay so the shrink-fade settles
//     // just after the health bar finishes its 700ms CSS animation.
//     const transition =
//         isKO || dead
//             ? { type: "spring" as const, stiffness: 280, damping: 24, delay: 0.15 }
//             : { type: "spring" as const, stiffness: 420, damping: 22 };

//     return (
//         <motion.div
//             className="flex flex-col items-center gap-1 shrink-0"
//             animate={animateTarget}
//             transition={transition}
//         >
//             <div
//                 className={cn(
//                     "relative rounded-lg  transition-all duration-300 shrink-0",
//                     /* ringColor, */ glowClass
//                 )}
//                 style={{ width: size, height: size }}
//             >
//                 <CharacterImage
//                     src={fighter.image}
//                     alt={fighter.name}
//                     imageFocus={fighter.imageFocus}
//                     fill
//                     className="w-full h-full rounded-lg"
//                 />

//                 {(isInvolved/* isAttacking || isBeingHit || isDefending || isReviving */) && !dead && (
//                     <div className={cn(
//                         "absolute inset-2 rounded-lg ring-2 animate-ping pointer-events-none",
//                         variant === "primary" ? "ring-primary/45" : "ring-secondary/45"
//                     )} />
//                 )}

//                 {(isAttacking) && !dead && (
//                     <motion.div
//                         initial={{ scale: 0 }} animate={{ scale: 1 }}
//                         transition={{ type: "spring", stiffness: 500 }}
//                         className="absolute -top-1.5 -left-1.5 bg-red-600 p-0.5 rounded-full border border-background z-20"
//                     >
//                         <Swords className="size-2.5 text-white" />
//                     </motion.div>
//                 )}

//                 {(isBeingHit) && !dead && (
//                     <motion.div
//                         initial={{ scale: 0 }} animate={{ scale: 1 }}
//                         transition={{ type: "spring", stiffness: 500 }}
//                         className="absolute -top-1.5 -left-1.5 bg-blue-600 p-0.5 rounded-full border border-background z-20"
//                     >
//                         <ShieldAlert className="size-2.5 text-white" />
//                     </motion.div>
//                 )}

//                 {isBeingHit && !dead && (
//                     <motion.div
//                         className="absolute inset-0 bg-red-400/30 pointer-events-none rounded-lg"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: [0, 1, 0] }}
//                         transition={{ duration: 0.35 }}
//                     />
//                 )}

//                 {isDefending && !dead && (
//                     <div className="absolute -top-1.5 -left-1.5 bg-cyan-500 p-0.5 rounded-full border border-background z-20">
//                         <Shield className="size-2.5 text-white" />
//                     </div>
//                 )}

//                 {shieldCount > 0 && !dead && (
//                     <motion.div
//                         initial={{ scale: 0 }} animate={{ scale: 1 }}
//                         className="absolute -bottom-1.5 -right-1.5 bg-blue-600 px-1 py-0.5 rounded-full border border-background z-20 flex items-center gap-0.5 shadow-md"
//                     >
//                         <Shield className="size-2.5 text-white" />
//                         <span className="text-[7px] font-bold text-white leading-none">{shieldCount}</span>
//                     </motion.div>
//                 )}

//                 {(isReviving || isHealing) && !dead && (
//                     <motion.div
//                         initial={{ scale: 0 }} animate={{ scale: 1 }}
//                         transition={{ type: "spring", stiffness: 500 }}
//                         className="absolute -top-1.5 -left-1.5 bg-green-600 p-0.5 rounded-full border border-background z-20"
//                     >
//                         <HeartPlus className="size-2.5 text-white" />
//                     </motion.div>
//                 )}

//                 {isHealing && (
//                     <motion.div
//                         className="absolute inset-0 bg-emerald-400/20 pointer-events-none rounded-lg"
//                         animate={{ opacity: [0.15, 0.55, 0.15] }}
//                         transition={{ duration: 1.1, repeat: Infinity }}
//                     />
//                 )}

//                 {isReviving && (
//                     <div className="absolute inset-0 bg-purple-400/30 animate-ping pointer-events-none rounded-lg" />
//                 )}

//                 <AnimatePresence>
//                     {isKO && (
//                         <motion.div
//                             key="ko-overlay"
//                             initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
//                             animate={{ scale: 1, opacity: 1, rotate: 0 }}
//                             exit={{ opacity: 0 }}
//                             transition={{ ...transition, delay: 0.30 }/* { type: "spring", stiffness: 300, damping: 20, delay: 0.15 } */}
//                             className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-lg"
//                         >
//                             <Skull className="size-3.7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] text-white/80" />
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* {isMvp && !dead && (
//                     <div className="absolute -top-1.5 -right-1.5 bg-yellow-300 p-0.5 rounded-full border border-background z-20">
//                         <Crown className="size-2.5 fill-black text-black" />
//                     </div>
//                 )} */}
//             </div>

//             <span
//                 className={cn(
//                     "text-center leading-tight truncate font-medium text-[9px] sm:text-[10px] transition-all max-w-[48px] sm:max-w-[64px]",
//                     !isInvolved && dead ? "text-muted-foreground/35 line-through" : "text-foreground/85"
//                 )}
//             >
//                 {fighter.name}
//             </span>
//         </motion.div>
//     );
// }