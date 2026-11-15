
import { AnimatePresence, motion } from "framer-motion";
import type { Power, PowerRole } from "@/types";
import type { CombatPhase } from "../types";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { cn } from "@/lib/utils";
import { Skull, Lock } from "lucide-react";
import type { EnrichedFighter, FighterState } from "@/lib/matchup/combat/adapters";
import PowerOverlay, {
    type CombatActionType,
} from "@/components/shared/powerOverlay/PowerOverlay";
import SyncedHealthBar from "./SyncedHealthBar";
import ScoreBadgeOnCard from "@/components/shared/ScoreBadgeOnCard";

function ImpactOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <motion.div
            className="absolute inset-0 z-25 pointer-events-none rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 0] }}
            transition={{ duration: 0.55, times: [0, 0.12, 0.45, 1], ease: "easeOut" }}
        >
            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,120,50,0.5)_35%,transparent_70%)]" />
            <div className="absolute inset-0 rounded-lg border-2 border-white/80" />

            <motion.div
                className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-lg"
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
    activePower: Power | { name: string, combatRole: PowerRole } | undefined;
    damagePopup?: number | null;
    healPopup?: number | null;
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
    prevHp,
    phase,
    isShielded = false,
}: FighterSlotProps) {
    if (!fighter) return <div className="w-24 sm:w-28" />;

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

    return (
        <div className="relative flex min-w-24 flex-col items-center gap-1.5 sm:min-w-28 sm:gap-2">

            <AnimatePresence>
                {showDamagePopup && damagePopup != null && damagePopup > 0 && (
                    <motion.span
                        key="damage"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute z-40 pointer-events-none text-[8px] font-bold text-red-500 sm:text-[10px]"
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
                        className="absolute z-40 pointer-events-none text-[8px] font-bold text-emerald-400 sm:text-[10px]"
                    >
                        (+{healPopup} HP)
                    </motion.span>
                )}
            </AnimatePresence>

            <span
                className={cn(
                    "flex flex-col items-center justify-center text-[9px] font-black uppercase tracking-wider sm:text-[10px]",
                    badgeColorClass ?? (isTeamA ? "text-primary" : "text-secondary")
                )}
            >
                {roleLabel}
            </span>

            <div className="relative w-36 h-36 shrink-0 overflow-visible">
                <div
                    className={cn(
                        "relative z-0 h-full w-full overflow-hidden rounded-xl border-2 shadow-md transition-colors duration-300",
                        showKO ? "border-white shadow-black/60" : teamBorderClass
                    )}
                >
                    <motion.div
                        className="relative h-full w-full"
                        initial={{ filter: "grayscale(0%) contrast(100%)" }}
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

                    <AnimatePresence>
                        {showDamageFlash && (
                            <motion.div
                                key="damage-flash"
                                className="absolute inset-0 z-10 rounded-lg bg-red-400/50 pointer-events-none"
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

                {showOverlay && !isDefender && action && (
                    <div className="absolute inset-0 z-15 overflow-visible pointer-events-none transition-opacity duration-300">
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={true}
                        />
                    </div>
                )}

                <ScoreBadgeOnCard
                    entity={fighter.original}
                    score={fighter.overall}
                    side="front"
                />

                <ImpactOverlay visible={impactVisible} />

                <AnimatePresence>
                    {showKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                            animate={{ scale: 0.95, opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-lg bg-black/75 backdrop-blur-[2px]"
                        >
                            <Skull className="size-9 text-white/80 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] sm:size-10" />
                        </motion.div>
                    )}
                </AnimatePresence>

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
                            className="absolute inset-0 z-20 rounded-lg bg-purple-500 pointer-events-none"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="size-8 text-white sm:size-9" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span
                className={cn(
                    "max-w-24 truncate text-center text-[11px] font-bold sm:max-w-28 sm:text-xs",
                    teamTextClass
                )}
            >
                {fighter.name}
            </span>

            <SyncedHealthBar
                currentHp={fighter.currentHp}
                maxHp={fighter.maxHp}
                isTeamA={isTeamA}
                phase={phase}
                isAlive={!showKO}
                prevHp={prevHp}
            />
        </div>
    );
}
