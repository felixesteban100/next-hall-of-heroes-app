"use client";

import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

import type { CombatEvent, CombatFighter } from "@/lib/matchup/combat/types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

import ClashCard from "../clash/ClashCard";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

type CombatHistoryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogEvent: CombatEvent | null;
    fighters: CombatFighter[];
    allChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: "A" | "B";
    eventPosition: number;
    totalEvents: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
    isViewingLatest: boolean;
    animationSpeed: 1 | 2;
    skipSignal: number;
    onPrevious: () => void;
    onNext: () => void;
    onGoToLatest: () => void;
    onAnimationSpeedChange: (speed: 1 | 2) => void;
    onSkip: () => void;
    onImpact: () => void;
};

export default function CombatHistoryDialog({
    open,
    onOpenChange,
    dialogEvent,
    fighters,
    allChars,
    teamAChars,
    playerSide,
    eventPosition,
    totalEvents,
    canGoPrevious,
    canGoNext,
    isViewingLatest,
    animationSpeed,
    skipSignal,
    onPrevious,
    onNext,
    onGoToLatest,
    onAnimationSpeedChange,
    onSkip,
    onImpact,
}: CombatHistoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-foreground bg-card/80 px-3 py-2 sm:px-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!canGoPrevious}
                        onClick={onPrevious}
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
                                onAnimationSpeedChange(animationSpeed === 1 ? 2 : 1)
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
                            onClick={onSkip}
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
                                onClick={onGoToLatest}
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
                            onClick={onNext}
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
                            fighters={fighters}
                            allChars={allChars}
                            teamAChars={teamAChars}
                            playerSide={playerSide}
                            onImpact={onImpact}
                            animationSpeed={animationSpeed}
                            skipSignal={skipSignal}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}