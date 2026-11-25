"use client";

import { useEffect, useMemo } from "react";
import type { CombatEvent, CombatFighter } from "@/lib/matchup/combat/types/types";
type DisplayFighter = CombatFighter & { prevHp?: number };
import CommandPanelPortal from "../commands/CommandPanelPortal";
import { useCombatContext } from "../context/CombatContext";
import { useCombatTiming } from "./hooks/useCombatTiming";
import { useFighterScroll } from "./hooks/useFighterScroll";
import { useCommandDropdown } from "./hooks/useCommandDropdown";
import FighterCard from "./FighterCard";


export { HEALTH_DROP_DELAY, KO_VISUAL_DELAY } from "../combatTimingConstants";

type Props = {
    fighters: DisplayFighter[];
    variant: "primary" | "secondary";
    mvp?: string;
    actionEvent?: CombatEvent;
    eventKey?: number;
    isPlayerSide?: boolean;
    hasImpacted?: boolean;
    isDialogOpen?: boolean;
};

export default function TeamColumn({ fighters, variant, actionEvent, eventKey, isPlayerSide, hasImpacted, isDialogOpen = false }: Props) {
    const sortedFighters = useMemo(() => {
        return fighters
            .map((fighter, index) => ({ fighter, index }))
            .sort((a, b) => {
                // Living fighters always appear before KO'd fighters.
                if (a.fighter.isAlive !== b.fighter.isAlive) {
                    return a.fighter.isAlive ? -1 : 1;
                }

                // Stronger characters appear first.
                const powerDifference =
                    (b.fighter.overall ?? 0) - (a.fighter.overall ?? 0);

                // Preserve original order when power scores are equal.
                return powerDifference || a.index - b.index;
            })
            .map(({ fighter }) => fighter);
    }, [fighters]);


    const {
        state,
        targetMode,
        onSelectActor,
        onSelectTarget,
        onDeselectActor,
        onInspectCharacter,
    } = useCombatContext();

    const event = actionEvent;
    const attackerId = actionEvent?.actorId;

    const targetIds = actionEvent?.targetIds ?? [];

    const involvedIds = useMemo(
        () => new Set([attackerId, ...targetIds].filter((id): id is number => id !== undefined)),
        [attackerId, targetIds]
    );

    const eventType = event?.type;
    const eventTargetId = targetIds[0] ?? attackerId;

    const latestKO = eventType === "ko" || event?.isKO
        ? eventTargetId
        : undefined;

    const latestHeal = eventType === "heal" ? eventTargetId : undefined;

    const latestRevive = eventType === "revive" ? eventTargetId : undefined;

    const latestDefend = eventType === "defend" ? eventTargetId : undefined;

    const selectedActorId = state?.selectedActorId ?? null;
    const selectedTargetId = state?.selectedTargetId ?? null;

    const { scrollContainerRef, avatarRefsMap, programmaticScrollRef } = useFighterScroll({ eventKey: eventKey ?? actionEvent?.id, actionEvent, involvedIds, selectedActorId });

    const isPlayerTurn = state?.isPlayerTurn ?? false;
    const availablePlayerIds = state?.availablePlayerIds ?? [];

    const isTargetSelectionActive = targetMode?.active ?? false;
    const validTargetIds = targetMode?.validIds ?? [];

    const { openCommandActorId, setOpenCommandActorId, dropdownPosition } = useCommandDropdown({ avatarRefsMap, scrollContainerRef, programmaticScrollRef, onDeselectActor, keepOpenOnTeamScroll: isTargetSelectionActive });

    const { hpReady, koReady } = useCombatTiming({ eventKey: eventKey ?? actionEvent?.id, latestHeal, latestRevive, latestKO, eventType, hasDefenderName: !!event?.defenderName, hasImpacted });

    useEffect(() => {
        if (!isPlayerTurn) setOpenCommandActorId(null);
        if (isDialogOpen) setOpenCommandActorId(null);
    }, [isDialogOpen, isPlayerTurn, setOpenCommandActorId]);

    useEffect(() => {
        if (openCommandActorId === null) return;

        const handleScroll = (event: Event) => {
            const path = event.composedPath();

            // Keep the command panel open when scrolling inside the panel itself.
            const isCommandPanelScroll = path.some((element) => element instanceof HTMLElement && element.hasAttribute("data-command-panel-scroll"));
            if (isCommandPanelScroll) return;

            // During target selection, allow scrolling inside either TeamColumn.
            if (isTargetSelectionActive) {
                const isTeamColumnScroll = path.some((element) => element instanceof HTMLElement && element.hasAttribute("data-team-column-scroll"));
                if (isTeamColumnScroll) return;
            }

            // Preserve normal scrolling behavior inside the active TeamColumn.
            if (event.target instanceof Node && scrollContainerRef.current?.contains(event.target)) return;

            setOpenCommandActorId(null);
        };

        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [openCommandActorId, isTargetSelectionActive, scrollContainerRef, setOpenCommandActorId]);


    if (!state) return null;


    return (
        <div className={`h-full min-h-0 w-full flex-1`}>
            <div
                ref={scrollContainerRef}
                data-team-column-scroll
                className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden p-1 pt-5  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex flex-wrap gap-1 justify-center w-full pb-10">
                    {sortedFighters.map((fighter) => {
                        const isValidTarget = !isDialogOpen && isTargetSelectionActive && validTargetIds.includes(fighter.id);
                        const selectedTargetIds = targetMode?.selectedIds ?? [];
                        const isMultiTargetSelected = selectedTargetIds.includes(fighter.id);

                        const canSelectActor = !isDialogOpen && !isTargetSelectionActive && isPlayerSide && isPlayerTurn && state?.winner === null && availablePlayerIds.includes(fighter.id);

                        const isSelectedActor = selectedActorId === fighter.id;

                        const isSelectedTarget = selectedTargetId === fighter.id;

                        const isProtected = state.teamOrders.some(
                            (order) =>
                                order.type === "protect" &&
                                order.targetId === fighter.id &&
                                order.duration > 0
                        );

                        return (
                            <FighterCard
                                size={100}
                                key={fighter.id}
                                fighter={fighter}
                                variant={variant}
                                attackerId={attackerId}
                                targetIds={targetIds}
                                latestKO={latestKO}
                                latestHeal={latestHeal}
                                latestRevive={latestRevive}
                                latestDefend={latestDefend}
                                hpReady={hpReady}
                                koReady={koReady}
                                isSelectedActor={isSelectedActor}
                                isSelectedTarget={isSelectedTarget}
                                isValidTarget={isValidTarget}
                                canSelectActor={canSelectActor}
                                isProtected={isProtected}
                                isMultiTargetSelected={isMultiTargetSelected}
                                setAvatarRef={(node) => {
                                    if (node) {
                                        avatarRefsMap.current.set(fighter.id, node);
                                    } else {
                                        avatarRefsMap.current.delete(fighter.id);
                                    }
                                }}
                                onClick={() => {
                                    if (isDialogOpen) return;

                                    // Always open character inspection.
                                    onInspectCharacter(fighter.id);

                                    // Preserve existing combat target selection.
                                    if (isValidTarget) {
                                        onSelectTarget(fighter.id);

                                        if (targetMode?.selectionMode !== "multiple") {
                                            setOpenCommandActorId(null);
                                        }

                                        return;
                                    }

                                    // Preserve existing combat actor selection.
                                    if (canSelectActor) {
                                        onSelectActor(fighter.id);

                                        setOpenCommandActorId((current) =>
                                            current === fighter.id ? null : fighter.id
                                        );
                                    }
                                }}
                                onInspect={() => onInspectCharacter(fighter.id)}
                            />
                        );
                    })}
                </div>
            </div>

            {!isDialogOpen && openCommandActorId !== null &&
                openCommandActorId === selectedActorId &&
                isPlayerSide &&
                isPlayerTurn &&
                dropdownPosition && (
                    <CommandPanelPortal
                        actorId={selectedActorId}
                        position={dropdownPosition}
                        onClose={() => setOpenCommandActorId(null)}
                    />
                )}
        </div>
    );
}