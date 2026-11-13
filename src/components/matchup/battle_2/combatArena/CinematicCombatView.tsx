"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatFighter, CombatEvent } from "@/lib/matchup/combat/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";
import { CommandPanel } from "../CommandPanel";

// Your existing rich components
import {
    toEnrichedFighter,
    toLegacyLog,
    buildActionEvent,
} from "@/lib/matchup/combat/adapters";
import TeamColumn from "./cinematicCombatView/TeamColumn";
import ClashCard from "./cinematicCombatView/ClashCard";
import LogRow from "./cinematicCombatView/LogRow";

type CommandPanelProps = ComponentProps<typeof CommandPanel>;

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
    renderCommandPanel: (onClose: () => void) => ReactNode;
    validTargetIds: number[];
    isTargetSelectionActive: boolean;
    commandPanelProps: CommandPanelProps;
    onDeselectActor: () => void;
    previousHpById: Record<number, number>;
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
    commandPanelProps,
    validTargetIds,
    isTargetSelectionActive,
    renderCommandPanel,
    onDeselectActor,
    previousHpById,
}: Props) {
    const logRef = useRef<HTMLDivElement>(null);

    const enrichedA = useMemo(
        () =>
            fightersA.map((f) =>
                toEnrichedFighter(f, previousHpById[f.id] ?? f.currentHp)
            ),
        [fightersA, previousHpById]
    );

    const enrichedB = useMemo(
        () =>
            fightersB.map((f) =>
                toEnrichedFighter(f, previousHpById[f.id] ?? f.currentHp)
            ),
        [fightersB, previousHpById]
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
        () =>
            buildActionEvent(
                latestEvent,
                fightersA,
                fightersB,
                allChars,
                previousHpById
            ),
        [latestEvent, fightersA, fightersB, allChars, previousHpById]
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

    const eventKey = currentActionEvent?.key;

    const [impactedEventKey, setImpactedEventKey] = useState<number | null>(null);

    const hasImpacted =
        eventKey !== undefined && impactedEventKey === eventKey;

    const teamColumnProps = {
        actionEvent: currentActionEvent ?? undefined,
        eventKey,
        hasImpacted,
        availablePlayerIds,
        availableAIIds,
        selectedActorId,
        selectedTargetId,
        onSelectActor,
        onSelectTarget,
        isPlayerTurn,
        validTargetIds,
        isTargetSelectionActive,
        commandPanelProps,
        renderCommandPanel,
        onDeselectActor,
    };

    return (
        <div className="flex w-full max-w-full flex-col gap-2 overflow-hidden p-1">
            {/* Mobile */}
            <div className="flex flex-col gap-2 w-full md:hidden">
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
                                onImpact={() => {
                                    if (eventKey !== undefined) {
                                        setImpactedEventKey(eventKey);
                                    }
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 w-full gap-3 items-start">
                    <TeamColumn
                        fighters={enrichedA}
                        variant="primary"
                        mvp={mvpA}
                        isPlayerSide={playerSide === "A"}
                        {...teamColumnProps}
                    />
                    <TeamColumn
                        fighters={enrichedB}
                        variant="secondary"
                        mvp={mvpB}
                        isPlayerSide={playerSide === "B"}
                        {...teamColumnProps}
                    />
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between gap-4 w-full">
                <TeamColumn
                    fighters={enrichedA}
                    variant="primary"
                    mvp={mvpA}
                    isPlayerSide={playerSide === "A"}
                    {...teamColumnProps}
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
                                onImpact={() => {
                                    if (eventKey !== undefined) {
                                        setImpactedEventKey(eventKey);
                                    }
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <TeamColumn
                    fighters={enrichedB}
                    variant="secondary"
                    mvp={mvpB}
                    isPlayerSide={playerSide === "B"}
                    {...teamColumnProps}
                />
            </div>

            {/* Combat Feed */}
            <div className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth h-[80px]">
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