"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    LogsIcon,
    SkipForward,
} from "lucide-react";

import type {
    CombatFighter,
    CombatEvent,
    Side,
} from "@/lib/matchup/combat/types/types";
import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import TeamColumn from "./team/TeamColumn";
import ClashCard from "./clash/ClashCard";
import { useCombatDialog } from "./hooks/useCombatDialog";
import { useCombatPresentation } from "./hooks/useCombatPresentation";
import CombatFeed from "./feed/CombatFeed";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

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
};

export default function CinematicCombatView({ fightersA, fightersB, events, teamAChars, teamBChars, playerSide, previousHpById, battleStarted, onStartBattle, onSkipPresentation }: Props) {
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<{ a: number; b: number; winner: Side; } | null>(null);
    const [animationSpeed, setAnimationSpeed] = useState<1 | 2>(1);
    const [skipSignal, setSkipSignal] = useState(0);

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

    const teamColumnProps = {
        actionEvent: currentActionEvent ?? undefined,
        eventKey,
        hasImpacted,
        isDialogOpen,
    };

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

            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="flex max-w-none! flex-col gap-0 overflow-hidden rounded-xl border border-white/10 bg-background p-0 shadow-2xl outline-none sm:rounded-2xl"
                    style={{
                        width: "min(calc(90vw - 16px), 900px)",
                        height: "min(calc(70dvh - 16px), 800px)",
                    }}
                >
                    <DialogTitle className="sr-only">Combat History</DialogTitle>
                    <DialogDescription className="sr-only">
                        Browse the events from this battle using the previous and next controls.
                    </DialogDescription>

                    {/* Event Navigation */}
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-card/80 px-3 py-2 sm:px-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canGoPrevious}
                            onClick={handlePrevious}
                            className="h-8 gap-1 px-2 text-xs"
                        >
                            <ChevronLeft className="size-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <div className="flex min-w-0 flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Combat History
                            </span>
                            <span className="text-xs font-bold tabular-nums">
                                Event {eventPosition} of {totalEvents}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setAnimationSpeed((previous) =>
                                        previous === 1 ? 2 : 1
                                    )
                                }
                                className="h-8 min-w-12 px-2 text-xs"
                                title="Toggle animation speed"
                            >
                                {animationSpeed}×
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!isViewingLatest}
                                onClick={handleSkip}
                                className="h-8 gap-1 px-2 text-xs"
                                title="Skip current animation"
                            >
                                <SkipForward className="size-3.5" />
                                <span className="hidden sm:inline">Skip</span>
                            </Button>

                            {!isViewingLatest && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGoToLatest}
                                    className="h-8 gap-1 px-2 text-xs"
                                    title="Go to latest event"
                                >
                                    <SkipForward className="size-3.5" />
                                    <span className="hidden sm:inline">Latest</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!canGoNext}
                                onClick={handleNext}
                                className="h-8 gap-1 px-2 text-xs"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Event Content */}
                    <div className="min-h-0 w-full flex-1 overflow-hidden">
                        {dialogEvent && (
                            <ClashCard
                                event={dialogEvent}
                                fighters={[...enrichedA, ...enrichedB]}
                                allChars={allChars}
                                teamAChars={teamAChars}
                                playerSide={playerSide}
                                onImpact={handleImpact}
                                animationSpeed={animationSpeed}
                                skipSignal={skipSignal}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}