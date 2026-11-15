"use client";

import { motion, AnimatePresence } from "framer-motion";

import type {
    CombatFighter,
    CombatEvent,
} from "@/lib/matchup/combat/types";

import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import TeamColumn from "./components/teamColumn/TeamColumn";
import ClashCard from "../clashCard/ClashCard";
import { useCombatDialog } from "./hooks/useCombatDialog";
import { useCombatPresentation } from "./hooks/useCombatPresentation";
import CombatFeed from "./components/CombatFeed";
import { useEffect } from "react";
import { LogsIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@base-ui/react";

type Props = {
    fightersA: CombatFighter[];
    fightersB: CombatFighter[];
    events: CombatEvent[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: "A" | "B";
    previousHpById: Record<number, number>;
};

export default function CinematicCombatView({
    fightersA,
    fightersB,
    events,
    teamAChars,
    teamBChars,
    playerSide,
    previousHpById,
}: Props) {
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
        handleImpact,
        handleClose,
        handleOpen,
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
                <Separator orientation="vertical" className={`size-2 text-foreground`} />
                <TeamColumn
                    className="flex-1 min-w-0 h-full"
                    fighters={enrichedB}
                    variant="secondary"
                    isPlayerSide={playerSide === "B"}
                    {...teamColumnProps}
                />
            </div>

            <CombatFeed logs={visibleLogs} />
            {canReopen && (
                <Button
                    style={{ width: 230 }}
                    className="mx-auto"
                    onClick={handleOpen}
                >
                    <LogsIcon /> View Last Event
                </Button>
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
                            className="relative z-10 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-background/95 shadow-2xl sm:rounded-2xl"
                            style={{
                                width: "min(calc(90vw - 16px), 900px)",
                                height: "min(calc(90dvh - 16px), 800px)",
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
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close combat dialog"
                                className="absolute right-3 top-3 z-50 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
                            >
                                <X className="size-4" />
                            </button>

                            {/* Event Content */}
                            <div className="h-full min-h-0 w-full flex-1">
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