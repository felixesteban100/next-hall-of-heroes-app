import { AnimatePresence, motion } from "framer-motion";
import { Power } from "@/types";
import { CombatPhase } from "../ClashCard";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { cn } from "@/lib/utils";
import { Skull, Lock, Crosshair } from "lucide-react";
import { FighterState } from "@/lib/matchup/combat/adapters";
import PowerOverlay, { CombatActionType } from "./PowerOverlay";
import SyncedHealthBar from "./SyncedHealthBar";


function ImpactOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <motion.div
            className="absolute inset-0 z-25 pointer-events-none rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 0] }}
            transition={{ duration: 0.55, times: [0, 0.12, 0.45, 1], ease: "easeOut" }}
        >
            {/* Radial white shockwave */}
            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,120,50,0.5)_35%,transparent_70%)]" />
            {/* Hard rim flash */}
            <div className="absolute inset-0 rounded-lg border-2 border-white/80" />
            {/* Scan line sweep */}
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
    fighter?: FighterState;
    roleLabel: string;
    isTeamA: boolean;
    isKO?: boolean;
    action?: CombatActionType;
    // Whether this slot should show the main (attacker) PowerOverlay
    showOverlay?: boolean;
    // Whether this slot is the defender (shows impact burst at phase 2)
    isDefender?: boolean;
    badgeColorClass?: string;
    activePower: Power | undefined;
    damagePopup?: number | null;
    healPopup?: number | null;
    // HP before this event fired — holds the bar at the pre-hit value until phase 2
    prevHp?: number;
    // Timeline-driven props
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
    if (!fighter) return <div className="w-17" />;
    const isStunned = fighter.status?.some(
        (status) => status.type === "stun" && status.duration > 0
    ) ?? false;
    const isFocused = fighter.status?.some(
        (status) => status.type === "focus" && status.duration > 0
    ) ?? false;
    const teamTextClass = isTeamA ? "text-primary" : "text-secondary";
    const teamBorderClass = isTeamA ? "border-primary shadow-primary/40" : "border-secondary shadow-secondary/40";

    // ── Dual overlay visibility ───────────────────────────────────────────────
    // Attacker charge aura: active at phase 0, fades once phase 1 fires
    // (PowerOverlay handles its own fade via po-fade CSS class)
    const chargeOverlayVisible = showOverlay && !isDefender && phase === 0;
    // Attacker main overlay: visible from phase 1 onward (plays sound)
    const mainOverlayVisible = showOverlay && !isDefender && phase >= 1;
    // Defender impact burst: fires exactly at phase 2
    const impactVisible = isDefender && phase === 2;
    // Damage flash: also fires at phase 2 on defender
    const showDamageFlash = isDefender && phase >= 2;
    // KO skull: only at phase 3
    const showKO = isKO && phase >= 3;

    const showDamagePopup = phase >= 2 && !isShielded;
    const showHealPopup = phase >= 2;

    return (
        <div className="flex flex-col items-center gap-1 min-w-18 relative">

            <AnimatePresence>
                {showDamagePopup && damagePopup != null && damagePopup > 0 && (
                    <motion.span
                        key="damage"
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: -35, scale: 0.8 }}
                        transition={{ duration: 1 }}
                        className="absolute text-red-500 text-[6px] z-40 pointer-events-none"
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
                        className="absolute text-emerald-400 text-[6px] z-40 pointer-events-none"
                    >
                        (+{healPopup} HP)
                    </motion.span>
                )}
            </AnimatePresence>

            <span className={cn("text-[8px] font-black uppercase tracking-wider flex flex-col items-center justify-center", badgeColorClass ?? (isTeamA ? "text-primary" : "text-secondary"))}>
                <span>{roleLabel}</span>
            </span>

            <div className="relative w-17 h-17 shrink-0 overflow-visible">
                {/* 1. Character Image Container */}
                <div className={cn(
                    "w-full h-full rounded-lg overflow-hidden border-2 shadow-md relative transition-colors duration-300 z-0",
                    showKO ? "border-white shadow-black/60" : teamBorderClass
                )}>
                    <motion.div
                        className="w-full h-full relative"
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
                            fill
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Damage flash — fires at phase 2, only on defender */}
                    <AnimatePresence>
                        {showDamageFlash && (
                            <motion.div
                                key="damage-flash"
                                className="absolute inset-0 bg-red-400/50 pointer-events-none rounded-lg z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.6, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.55, times: [0, 0.15, 0.5, 1] }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* 2a. Attacker charge aura — shows at phase 0 before the main overlay fires.
                        Uses PowerOverlay with visible=false so it renders the themed backdrop
                        at low opacity as a "winding up" effect, no sound. */}
                {showOverlay && !isDefender && action && (
                    <div className={cn(
                        "absolute inset-0 z-15 pointer-events-none overflow-visible transition-opacity duration-300"/* ,
                        chargeOverlayVisible ? "opacity-40" : "opacity-0" */
                    )}>
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={true}
                        />
                    </div>
                )}

                {/* 2b. Attacker main overlay — fires at phase 1, plays sound */}
                {/* {showOverlay && !isDefender && action && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                        <PowerOverlay
                            action={action}
                            powerName={activePower?.name}
                            side={isTeamA ? "left" : "right"}
                            visible={mainOverlayVisible}
                        />
                    </div>
                )} */}

                {/* 2c. Defender impact burst — fires at phase 2 */}
                <ImpactOverlay visible={impactVisible} />

                {/* 3. Dramatic K.O. Overlay — fires at phase 3 */}
                <AnimatePresence>
                    {showKO && (
                        <motion.div
                            key="ko-overlay"
                            initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                            animate={{ scale: 0.95, opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg z-30"
                        >
                            <Skull className="size-7 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] text-white/80" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. Stun effect */}
                <AnimatePresence>
                    {isStunned && !showKO && (
                        <motion.div
                            key="stun-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.15, 0.4, 0.2, 0.4, 0.15] }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 z-20 pointer-events-none rounded-lg border-2 border-purple-400 bg-purple-400/20 shadow-[inset_0_0_18px_rgba(168,85,247,0.65)]"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="size-6 text-purple-500 drop-shadow-[0_0_8px_rgba(192,132,252,1)]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 5. Focus effect */}
                <AnimatePresence>
                    {isFocused && !showKO && (
                        <motion.div
                            key="focus-overlay"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{
                                opacity: [0.25, 0.55, 0.3, 0.55, 0.25],
                                scale: [1, 1.015, 1],
                            }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 z-15 pointer-events-none rounded-lg border-2 border-green-400 bg-green-400/10 shadow-[inset_0_0_18px_rgba(251,191,36,0.55),0_0_12px_rgba(251,191,36,0.35)]"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Crosshair className="size-7 text-green-500 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span className={cn("font-bold text-[9.5px] truncate text-center max-w-[72px]", teamTextClass)}>
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