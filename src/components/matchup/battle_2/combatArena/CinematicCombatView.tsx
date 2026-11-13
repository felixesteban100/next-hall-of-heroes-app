"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatFighter, CombatEvent } from "@/lib/matchup/combat/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

// Your existing rich components
import {
    toEnrichedFighter,
    toLegacyLog,
    buildActionEvent,
} from "@/lib/matchup/combat/adapters";
import TeamColumn from "./cinematicCombatView/TeamColumn";
import ClashCard from "./cinematicCombatView/ClashCard";
import LogRow from "./cinematicCombatView/LogRow";

type Props = {
    fightersA: CombatFighter[];
    fightersB: CombatFighter[];
    events: CombatEvent[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA?: string;
    nameB?: string;
    // Selection
    playerSide: "A" | "B";
    availablePlayerIds: number[];
    availableAIIds: number[];
    selectedActorId: number | null;
    selectedTargetId: number | null;
    onSelectActor: (id: number) => void;
    onSelectTarget: (id: number) => void;
    isPlayerTurn: boolean;

    validTargetIds: number[];
    isTargetSelectionActive: boolean;
};

export default function CinematicCombatView({
    fightersA,
    fightersB,
    events,
    teamAChars,
    teamBChars,
    availablePlayerIds,
    availableAIIds,
    isPlayerTurn,
    onSelectActor,
    onSelectTarget,
    playerSide,
    selectedActorId,
    selectedTargetId,

    validTargetIds,
    isTargetSelectionActive,
}: Props) {
    const logRef = useRef<HTMLDivElement>(null);

    // Convert to the shapes your UI already understands
    const enrichedA = useMemo(
        () => fightersA.map((f) => toEnrichedFighter(f)),
        [fightersA]
    );
    const enrichedB = useMemo(
        () => fightersB.map((f) => toEnrichedFighter(f)),
        [fightersB]
    );

    const visibleLogs = useMemo(
        () => events.map(toLegacyLog),
        [events]
    );

    const allChars = useMemo(
        () => [...teamAChars, ...teamBChars],
        [teamAChars, teamBChars]
    );

    const latestEvent = events[events.length - 1] ?? null;

    const currentActionEvent = useMemo(
        () => buildActionEvent(latestEvent, fightersA, fightersB, allChars),
        [latestEvent, fightersA, fightersB, allChars]
    );

    // Auto-scroll feed
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTo({
                top: logRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [events.length]);

    // MVP = highest overall still alive
    const mvpA = enrichedA.find((f) => f.isAlive)?.name;
    const mvpB = enrichedB.find((f) => f.isAlive)?.name;

    const latestLog = visibleLogs[visibleLogs.length - 1];

    const activeAttacker =
        latestLog &&
            (latestLog.type === "attack" ||
                latestLog.type === "ko" ||
                latestLog.type === "defend")
            ? latestLog.attackerName
            : undefined;

    const activeDefender =
        latestLog?.type === "attack" ? latestLog.defenderName : undefined;
    const latestKO = latestLog?.type === "ko" ? latestLog.defenderName : undefined;
    const latestHeal =
        latestLog?.type === "heal"
            ? latestLog.defenderName
            : undefined;
    const latestRevive = latestLog?.type === "revive" ? latestLog.defenderName : undefined;
    const latestDefend = latestLog?.type === "defend" ? latestLog.defenderName : undefined;

    const eventKey = latestLog?.id;

    const teamColumnProps = {
        activeAttacker,
        activeDefender,
        latestKO,
        latestHeal,
        latestRevive,
        latestDefend,
        eventKey,

        availablePlayerIds,
        availableAIIds,
        selectedActorId,
        selectedTargetId,
        onSelectActor,
        onSelectTarget,
        isPlayerTurn,

        validTargetIds,
        isTargetSelectionActive,
    };

    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4 w-full max-w-full overflow-hidden">
            {/* Mobile */}
            <div className="flex flex-col gap-4 w-full md:hidden">
                <div className="w-full rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-hidden min-h-[180px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentActionEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <ClashCard
                                event={currentActionEvent}
                                allChars={allChars}
                                teamAChars={teamAChars}
                                playerSide={playerSide}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 w-full gap-3 items-start">
                    <TeamColumn
                        fighters={enrichedA}
                        variant="primary"
                        mvp={mvpA}
                        {...teamColumnProps}
                        isPlayerSide={playerSide === "A"}
                    />
                    <TeamColumn
                        fighters={enrichedB}
                        variant="secondary"
                        mvp={mvpB}
                        {...teamColumnProps}
                        isPlayerSide={playerSide === "B"}
                    />
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between gap-4 w-full">
                <TeamColumn
                    fighters={enrichedA}
                    variant="primary"
                    mvp={mvpA}
                    {...teamColumnProps}
                    isPlayerSide={playerSide === "A"}
                />

                <div
                    className={cn(
                        "shrink-0 rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-visible min-h-[200px] flex items-center justify-center",
                        "w-[340px] lg:w-[380px]"
                    )}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentActionEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full overflow-visible"
                        >
                            <ClashCard
                                event={currentActionEvent}
                                allChars={allChars}
                                teamAChars={teamAChars}
                                playerSide={playerSide}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <TeamColumn
                    fighters={enrichedB}
                    variant="secondary"
                    mvp={mvpB}
                    {...teamColumnProps}
                    isPlayerSide={playerSide === "B"}
                />
            </div>

            {/* Combat Feed */}
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    <span className="flex items-center gap-1.5">
                        <Activity className="size-3.5 animate-pulse text-amber-500" />
                        Combat Feed
                    </span>
                    <span className="text-muted-foreground/60 font-mono">
                        {visibleLogs.length} events
                    </span>
                </div>

                <div
                    ref={logRef}
                    className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth h-[120px]"
                >
                    {visibleLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/50 italic">
                            Waiting for combat to start…
                        </div>
                    ) : (
                        visibleLogs.map((log) => <LogRow key={log.id} log={log} />)
                    )}
                </div>
            </div>
        </div>
    );
}