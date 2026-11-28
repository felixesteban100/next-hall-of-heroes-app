"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LogsIcon } from "lucide-react";

import type {
    CombatFighter,
    CombatEvent,
    Side,
} from "@/lib/matchup/combat/types/types";

import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import TeamColumn from "./team/TeamColumn";
import { useCombatDialog } from "./hooks/useCombatDialog";
import { useCombatPresentation } from "./hooks/useCombatPresentation";
import CombatFeed from "./feed/CombatFeed";
import { useCombatContext } from "./context/CombatContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CombatHistoryDialog from "./dialogs/CombatHistoryDialog";
import CharacterDetailsDialog from "./dialogs/CharacterDetailsDialog";

type Props = {
    fightersA: CombatFighter[];
    fightersB: CombatFighter[];
    events: CombatEvent[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: "A" | "B";
    previousHpById: Record<number, number>;
    battleStarted: boolean;
    onStartBattle: (firstSide: Side) => void;
    onSkipPresentation: () => void;
    animationSpeed: 1 | 2;
    onAnimationSpeedChange: (speed: 1 | 2) => void;
};

export default function CinematicCombatView({ fightersA, fightersB, events, teamAChars, teamBChars, playerSide, previousHpById, battleStarted, onStartBattle, onSkipPresentation, animationSpeed, onAnimationSpeedChange }: Props) {
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<{ a: number; b: number; winner: Side; } | null>(null);
    const [skipSignal, setSkipSignal] = useState(0);

    const { state, inspectedCharacterId, onInspectCharacter } = useCombatContext();

    const inspectedFighter =
        state?.fighters.find((fighter) => fighter.id === inspectedCharacterId) ?? null;

    const handleSkip = () => {
        setSkipSignal((previous) => previous + 1);
        onSkipPresentation();
    };
    const diceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (diceTimerRef.current) {
                clearTimeout(diceTimerRef.current);
            }
        };
    }, []);

    const handleStartClick = () => {
        if (isRolling || battleStarted) return;

        setIsRolling(true);
        setDiceResult(null);

        let diceA = 0;
        let diceB = 0;

        // Reroll automatically if both dice tie.
        do {
            diceA = Math.floor(Math.random() * 6) + 1;
            diceB = Math.floor(Math.random() * 6) + 1;
        } while (diceA === diceB);

        const winner: Side = diceA > diceB ? "A" : "B";

        diceTimerRef.current = setTimeout(() => {
            setDiceResult({
                a: diceA,
                b: diceB,
                winner,
            });

            setIsRolling(false);
            onStartBattle(winner);
        }, 1300);
    };

    const { enrichedA, enrichedB, visibleLogs, allChars, currentActionEvent, } = useCombatPresentation({ fightersA, fightersB, events, teamAChars, teamBChars, previousHpById, });

    const eventKey = currentActionEvent?.id;

    const { dialogEvent, hasImpacted, eventPosition, totalEvents, canGoPrevious, canGoNext, isViewingLatest, handleImpact, handleClose, handleOpen, handlePrevious, handleNext, handleGoToLatest, } = useCombatDialog(currentActionEvent, playerSide);

    const isDialogOpen = dialogEvent !== null;

    const teamColumnProps = { actionEvent: currentActionEvent ?? undefined, eventKey, hasImpacted, isDialogOpen };

    return (
        <div className="flex w-full max-w-full flex-col space-y-3 overflow-hidden p-1">
            <div className="flex h-[400px] w-full">
                <TeamColumn
                    fighters={enrichedA}
                    variant="primary"
                    isPlayerSide={playerSide === "A"}
                    {...teamColumnProps}
                />

                <Separator orientation="vertical" className="w-3 text-white" />

                <TeamColumn
                    fighters={enrichedB}
                    variant="secondary"
                    isPlayerSide={playerSide === "B"}
                    {...teamColumnProps}
                />
            </div>

            <CombatFeed logs={visibleLogs} />

            {/* Reserve a fixed height so dice, start button, and history button never resize the layout */}
            <div className="relative flex h-12  w-full shrink-0 items-center justify-center overflow-visible">
                {!battleStarted ? (
                    <AnimatePresence mode="wait">
                        {isRolling ? (
                            <motion.div
                                key="rolling"
                                className="flex items-center justify-center gap-x-8"
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <motion.div
                                    className="text-5xl leading-none"
                                    animate={{ rotate: [0, 180, 360, 540, 720] }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>

                                <motion.div
                                    className="text-5xl leading-none"
                                    animate={{ rotate: [0, -180, -360, -540, -720] }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>
                            </motion.div>
                        ) : !diceResult ? (
                            <motion.div
                                key="start-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Button
                                    style={{ width: 230 }}
                                    className="mx-auto animate-bounce"
                                    onClick={handleStartClick}
                                >
                                    🎲 Start Battle
                                </Button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                ) : (
                    <Button
                        style={{ width: 230 }}
                        className="mx-auto"
                        onClick={handleOpen}
                    >
                        <LogsIcon /> View Combat History
                    </Button>
                )}
            </div>

            <CombatHistoryDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                dialogEvent={dialogEvent}
                fighters={[...enrichedA, ...enrichedB]}
                allChars={allChars}
                teamAChars={teamAChars}
                playerSide={playerSide}
                eventPosition={eventPosition}
                totalEvents={totalEvents}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isViewingLatest={isViewingLatest}
                animationSpeed={animationSpeed}
                skipSignal={skipSignal}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onGoToLatest={handleGoToLatest}
                onAnimationSpeedChange={onAnimationSpeedChange}
                onSkip={handleSkip}
                onImpact={handleImpact}
            />

            <CharacterDetailsDialog
                fighter={inspectedFighter}
                onClose={() => onInspectCharacter(null)}
            />
        </div>
    );
}