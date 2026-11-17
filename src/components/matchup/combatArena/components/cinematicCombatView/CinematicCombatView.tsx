"use client";

import { motion, AnimatePresence } from "framer-motion";

import type {
    CombatFighter,
    CombatEvent,
    Side,
} from "@/lib/matchup/combat/types";

import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import TeamColumn from "./components/teamColumn/TeamColumn";
import ClashCard from "./components/clashCard/ClashCard";
import { useCombatDialog } from "./hooks/useCombatDialog";
import { useCombatPresentation } from "./hooks/useCombatPresentation";
import CombatFeed from "./components/combatFeed/CombatFeed";
import { useEffect, useRef, useState } from "react";
import { LogsIcon, X, ChevronLeft, ChevronRight, SkipForward, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
};

export default function CinematicCombatView({
    fightersA,
    fightersB,
    events,
    teamAChars,
    teamBChars,
    playerSide,
    previousHpById,
    battleStarted,
    onStartBattle,
}: Props) {
    const [isRolling, setIsRolling] = useState(false);

    const [diceResult, setDiceResult] = useState<{
        a: number;
        b: number;
        winner: Side;
    } | null>(null);

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

    const {
        enrichedA,
        enrichedB,
        visibleLogs,
        allChars,
        currentActionEvent,
    } = useCombatPresentation({
        fightersA,
        fightersB,
        events,
        teamAChars,
        teamBChars,
        previousHpById,
    });

    const eventKey = currentActionEvent?.key;

    const {
        dialogEvent,
        hasImpacted,
        canReopen,
        eventPosition,
        totalEvents,
        canGoPrevious,
        canGoNext,
        isViewingLatest,
        handleImpact,
        handleClose,
        handleOpen,
        handlePrevious,
        handleNext,
        handleGoToLatest,
    } = useCombatDialog(currentActionEvent, playerSide);

    const isDialogOpen = dialogEvent !== null;

    const teamColumnProps = {
        actionEvent: currentActionEvent ?? undefined,
        eventKey,
        hasImpacted,
        isDialogOpen,
    };

    useEffect(() => {
        if (!dialogEvent) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [dialogEvent, handleClose]);

    useEffect(() => {
        if (!isDialogOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;
        const html = document.documentElement;

        const previousBodyOverflow = body.style.overflow;
        const previousBodyPosition = body.style.position;
        const previousBodyTop = body.style.top;
        const previousBodyWidth = body.style.width;
        const previousHtmlOverflow = html.style.overflow;

        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
        html.style.overflow = "hidden";

        return () => {
            body.style.overflow = previousBodyOverflow;
            body.style.position = previousBodyPosition;
            body.style.top = previousBodyTop;
            body.style.width = previousBodyWidth;
            html.style.overflow = previousHtmlOverflow;

            window.scrollTo(0, scrollY);
        };
    }, [isDialogOpen]);

    return (
        <div className="flex w-full max-w-full flex-col  overflow-hidden p-1 space-y-3">
            <div style={{ height: 300 }} className="flex w-full">
                <TeamColumn
                    className="flex-1 min-w-0 h-full"
                    fighters={enrichedA}
                    variant="primary"
                    isPlayerSide={playerSide === "A"}
                    {...teamColumnProps}
                />
                <Separator orientation="vertical" className={`w-3 text-white`} />
                <TeamColumn
                    className="flex-1 min-w-0 h-full"
                    fighters={enrichedB}
                    variant="secondary"
                    isPlayerSide={playerSide === "B"}
                    {...teamColumnProps}
                />
            </div>

            <CombatFeed logs={visibleLogs} />
            {!battleStarted ? (
                <div className="flex flex-col items-center gap-3 py-2">
                    <AnimatePresence mode="wait">
                        {isRolling && (
                            <motion.div
                                key="rolling"
                                className="flex items-center gap-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <motion.div
                                    className="flex size-16 items-center justify-center rounded-xl border border-primary/40 bg-card text-3xl font-bold shadow-lg"
                                    animate={{
                                        rotate: [0, 180, 360, 540, 720],
                                        scale: [1, 1.15, 1],
                                    }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>

                                <motion.div
                                    className="flex size-16 items-center justify-center rounded-xl border border-primary/40 bg-card text-3xl font-bold shadow-lg"
                                    animate={{
                                        rotate: [0, -180, -360, -540, -720],
                                        scale: [1, 1.15, 1],
                                    }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>
                            </motion.div>
                        )}

                        {/* {!isRolling && diceResult && (
                            <motion.div
                                key="result"
                                className="flex flex-col items-center gap-2"
                                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                            >
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-muted-foreground">
                                            Team A
                                        </span>
                                        <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-card text-2xl font-bold">
                                            {diceResult.a}
                                        </div>
                                    </div>

                                    <span className="text-sm font-bold text-muted-foreground">
                                        VS
                                    </span>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-muted-foreground">
                                            Team B
                                        </span>
                                        <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-card text-2xl font-bold">
                                            {diceResult.b}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm font-semibold">
                                    Team {diceResult.winner} goes first!
                                </p>
                            </motion.div>
                        )} */}
                    </AnimatePresence>

                    {!isRolling && !diceResult && (
                        <Button
                            style={{ width: 230 }}
                            className="mx-auto animate-bounce"
                            onClick={handleStartClick}
                        >
                            🎲 Start Battle
                        </Button>
                    )}
                </div>
            ) : (
                canReopen && (
                    <Button
                        style={{ width: 230 }}
                        className="mx-auto"
                        onClick={handleOpen}
                    >
                        <LogsIcon /> View Combat History
                    </Button>
                )
            )}

            {/* Combat Event Dialog */}
            <AnimatePresence>
                {dialogEvent && (
                    <motion.div
                        className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={handleClose}
                        />

                        {/* Dialog Panel */}
                        <motion.div
                            className="relative z-10 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-background/20 shadow-2xl sm:rounded-2xl"
                            style={{
                                width: "min(calc(90vw - 16px), 900px)",
                                height: "min(calc(70dvh - 16px), 800px)",
                            }}
                            initial={{
                                opacity: 0,
                                scale: 0.92,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.94,
                                y: 15,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 22,
                            }}
                        >
                            {/* Close Button */}
                            {/* <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close combat dialog"
                                className="absolute right-3 top-3 z-50 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
                            >
                                <X className="size-4" />
                            </button> */}

                            {/* Event Navigation */}
                            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-card/80 px-3 py-2 sm:px-4">

                                {/* Previous */}
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

                                {/* Event Counter */}
                                <div className="flex min-w-0 flex-col items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Combat History
                                    </span>

                                    <span className="text-xs font-bold tabular-nums">
                                        Event {eventPosition} of {totalEvents}
                                    </span>
                                </div>

                                {/* Next and Latest */}
                                <div className="flex items-center gap-1">
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
                                <ClashCard
                                    event={dialogEvent}
                                    allChars={allChars}
                                    teamAChars={teamAChars}
                                    playerSide={playerSide}
                                    onImpact={handleImpact}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}