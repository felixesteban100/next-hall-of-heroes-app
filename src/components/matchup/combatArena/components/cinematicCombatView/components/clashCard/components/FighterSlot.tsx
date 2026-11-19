
import { AnimatePresence, motion } from "framer-motion";
import type { Power, PowerRole } from "@/types";
import type { CombatPhase } from "../types";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { cn } from "@/lib/utils";
import { Skull, Lock } from "lucide-react";
import type { EnrichedFighter } from "@/lib/matchup/combat/adapters/adapters";
import PowerOverlay, {
    type CombatActionType,
} from "@/components/shared/powerOverlay/PowerOverlay";
import SyncedHealthBar from "./SyncedHealthBar";

function ImpactOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <motion.div
            className="pointer-events-none absolute inset-0 z-[25] overflow-hidden rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 0] }}
            transition={{
                duration: 0.55,
                times: [0, 0.12, 0.45, 1],
                ease: "easeOut",
            }}
        >
            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,120,50,0.5)_35%,transparent_70%)]" />

            <div className="absolute inset-0 rounded-lg border-2 border-white/80" />

            <motion.div
                className="absolute inset-x-0 top-0 h-full rounded-lg bg-gradient-to-b from-white/40 via-transparent to-transparent"
                initial={{ y: "-100%" }}
                animate={{ y: "200%" }}
                transition={{ duration: 0.3, ease: "easeIn" }}
            />
        </motion.div>
    );
}

interface FighterSlotProps {
    fighter?: EnrichedFighter;
    roleLabel: string;
    isTeamA: boolean;
    isKO?: boolean;
    action?: CombatActionType;
    showOverlay?: boolean;
    isDefender?: boolean;
    badgeColorClass?: string;
    activePower: Power | { name: string; combatRole: PowerRole } | undefined;
    damagePopup?: number | null;
    healPopup?: number | null;
    fatiguePopup?: number | null;
    prevHp?: number;
    phase: CombatPhase;
    isShielded?: boolean;
}

export default function FighterSlot({
    fighter,
    roleLabel,
    isTeamA,
    isKO = false,
    action,
    showOverlay = false,
    isDefender = false,
    badgeColorClass,
    activePower,
    damagePopup,
    healPopup,
    fatiguePopup,
    prevHp,
    phase,
    isShielded = false,
}: FighterSlotProps) {
    if (!fighter) return <div className="w-full max-w-36" />;

    const isStunned =
        fighter.status?.some(
            (status) => status.type === "stun" && status.duration > 0
        ) ?? false;

    const teamTextClass = isTeamA ? "text-primary" : "text-secondary";

    const teamBorderClass = isTeamA
        ? "border-primary shadow-primary/40"
        : "border-secondary shadow-secondary/40";

    const impactVisible = isDefender && phase === 2;
    const showDamageFlash = isDefender && phase >= 2;
    const showKO = isKO && phase >= 3;

    const showDamagePopup = phase >= 2 && !isShielded;
    const showHealPopup = phase >= 2;
    const showFatiguePopup = phase >= 2 && !isDefender;

    return (
        <div className="relative flex w-full min-w-0 max-w-36 flex-col items-center gap-1.5 sm:gap-2">

            {/* Damage / Healing Popups */}
            <AnimatePresence>
                {showDamagePopup && damagePopup != null && damagePopup > 0 && (
                    <motion.span
                        key="damage"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="pointer-events-none absolute left-1/2  z-[40] -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-red-500 drop-shadow-md sm:text-xs"
                    >
                        (-{damagePopup} HP)
                    </motion.span>
                )}

                {showHealPopup && healPopup != null && healPopup > 0 && (
                    <motion.span
                        key="heal"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="pointer-events-none absolute left-1/2  z-[40] -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-emerald-400 drop-shadow-md sm:text-xs"
                    >
                        (+{healPopup} HP)
                    </motion.span>
                )}

                {showFatiguePopup &&
                    fatiguePopup != null &&
                    fatiguePopup > 0 && (
                        <motion.span
                            key="fatigue"
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: -10, scale: 1 }}
                            exit={{ opacity: 0, y: -35, scale: 0.8 }}
                            transition={{ duration: 1 }}
                            className="pointer-events-none absolute left-1/2 z-[40] -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-orange-400 drop-shadow-md sm:text-xs"
                        >
                            (+{fatiguePopup} FAT)
                        </motion.span>
                    )}
            </AnimatePresence>

            {/* Fighter Role */}
            <span
                className={cn(
                    "flex min-h-4 max-w-full items-center justify-center text-center",
                    "text-[8px] font-black uppercase tracking-wider sm:text-[10px]",
                    badgeColorClass ?? teamTextClass
                )}
            >
                {roleLabel}
            </span>

            {/* Character Image */}
            <div className="relative aspect-square w-full shrink-0 overflow-visible">

                <div
                    className={cn(
                        "relative z-0 h-full w-full overflow-hidden rounded-lg border-2 shadow-md",
                        "transition-colors duration-300 sm:rounded-xl",
                        showKO
                            ? "border-white shadow-black/60"
                            : teamBorderClass
                    )}
                >
                    <motion.div
                        className="relative h-full w-full"
                        initial={{
                            filter: "grayscale(0%) contrast(100%)",
                        }}
                        animate={
                            showKO
                                ? {
                                    filter: "grayscale(100%) contrast(125%)",
                                }
                                : isStunned
                                    ? {
                                        filter: [
                                            "saturate(100%)",
                                            "saturate(60%)",
                                            "saturate(100%)",
                                        ],
                                        x: [0, -2, 2, -2, 2, 0],
                                    }
                                    : {
                                        filter: "grayscale(0%) contrast(100%)",
                                        x: 0,
                                    }
                        }
                        transition={
                            isStunned && !showKO
                                ? {
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }
                                : { duration: 0.35 }
                        }
                    >
                        <CharacterImage
                            src={fighter.image}
                            alt={fighter.name}
                            imageFocus={fighter.imageFocus}
                            height={500}
                            width={500}
                            fill
                            className="h-full w-full object-cover"
                        />
                    </motion.div>

                    {/* Damage Flash */}
                    <AnimatePresence>
                        {showDamageFlash && (
                            <motion.div
                                key="damage-flash"
                                className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-red-400/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.6, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.55,
                                    times: [0, 0.15, 0.5, 1],
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Power Overlay */}
                {showOverlay && !isDefender && action && (
                    <div className="pointer-events-none absolute inset-0 z-[15] overflow-visible">
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={true}
                        />
                    </div>
                )}

                {/* Impact Effect */}
                <ImpactOverlay visible={impactVisible} />

                {/* Knockout Overlay */}
                <AnimatePresence>
                    {showKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{
                                scale: 2.2,
                                opacity: 0,
                                rotate: -15,
                            }}
                            animate={{
                                scale: 0.95,
                                opacity: 1,
                                rotate: 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="absolute inset-0 z-[30] flex flex-col items-center justify-center rounded-lg bg-black/75 backdrop-blur-[2px]"
                        >
                            <Skull className="size-8 text-white/80 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] sm:size-10" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stun Overlay */}
                <AnimatePresence>
                    {isStunned && !showKO && (
                        <motion.div
                            key="stun-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="pointer-events-none absolute inset-0 z-[20] rounded-lg bg-purple-500"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="size-7 text-white sm:size-9" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fighter Name */}
            <span
                title={fighter.name}
                className={cn(
                    "w-full min-w-0 truncate text-center",
                    "text-[10px] font-bold sm:text-xs",
                    teamTextClass
                )}
            >
                {fighter.name}
            </span>

            {/* Health Bar */}
            <div className="w-full min-w-0">
                <SyncedHealthBar
                    currentHp={fighter.currentHp}
                    maxHp={fighter.maxHp}
                    isTeamA={isTeamA}
                    phase={phase}
                    isAlive={!showKO}
                    prevHp={prevHp}
                />
            </div>
        </div>
    );
}
