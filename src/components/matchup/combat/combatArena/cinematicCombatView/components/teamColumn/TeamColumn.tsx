"use client";

import { useEffect, useMemo, useRef } from "react";
import type {
    ActionEvent,
    EnrichedFighter,
} from "@/lib/matchup/combat/adapters";
import CommandPanelPortal from "./components/commandPanelPortal/CommandPanelPortal";
import { useCombatContext } from "../../context/CombatContext";
import { useCombatTiming } from "./hooks/useCombatTiming";
import { useFighterScroll } from "./hooks/useFighterScroll";
import { useCommandDropdown } from "./hooks/useCommandDropdown";

import FighterCard from "./components/FighterCard";

export { HEALTH_DROP_DELAY, KO_VISUAL_DELAY } from "./hooks/useCombatTiming";

type Props = {
    fighters: EnrichedFighter[];
    variant: "primary" | "secondary";
    mvp?: string;
    actionEvent?: ActionEvent;
    eventKey?: number;
    isPlayerSide?: boolean;
    hasImpacted?: boolean;
    className?: string;
    isDialogOpen?: boolean;
};

export default function TeamColumn({
    fighters,
    variant,
    actionEvent,
    eventKey,
    isPlayerSide,
    hasImpacted,
    className,
    isDialogOpen = false,
}: Props) {
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
    } = useCombatContext();

    const event = actionEvent;
    const attackerId = actionEvent?.attacker?.id;

    const targetIds =
        actionEvent?.targets?.map((target) => target.id) ??
        (actionEvent?.defender ? [actionEvent.defender.id] : []);

    const involvedIds = new Set(
        [attackerId, ...targetIds].filter(
            (id): id is number => id !== undefined
        )
    );

    const eventType = event?.log.type;
    const eventTargetId = targetIds[0] ?? attackerId;

    const latestKO =
        eventType === "ko" || event?.log.isKO
            ? eventTargetId
            : undefined;

    const latestHeal =
        eventType === "heal" ? eventTargetId : undefined;

    const latestRevive =
        eventType === "revive" ? eventTargetId : undefined;

    const latestDefend =
        eventType === "defend" ? eventTargetId : undefined;

    const selectedActorId = state?.selectedActorId ?? null;
    const selectedTargetId = state?.selectedTargetId ?? null;

    const {
        scrollContainerRef,
        avatarRefsMap,
        programmaticScrollRef,
    } = useFighterScroll({
        eventKey,
        actionEvent,
        involvedIds,
        selectedActorId,
    });

    const isPlayerTurn = state?.isPlayerTurn ?? false;
    const availablePlayerIds = state?.availablePlayerIds ?? [];

    const isTargetSelectionActive = targetMode?.active ?? false;
    const validTargetIds = targetMode?.validIds ?? [];

    const {
        openCommandActorId,
        setOpenCommandActorId,
        dropdownPosition,
    } = useCommandDropdown({
        avatarRefsMap,
        scrollContainerRef,
        programmaticScrollRef,
        onDeselectActor,
        keepOpenOnTeamScroll: isTargetSelectionActive,
    });

    const { hpReady, koReady } = useCombatTiming({
        eventKey,
        latestHeal,
        latestRevive,
        latestKO,
        eventType,
        hasDefenderName: !!event?.log.defenderName,
        hasImpacted,
    });

    useEffect(() => {
        if (!isPlayerTurn) {
            setOpenCommandActorId(null);
        }
        if (isDialogOpen) {
            setOpenCommandActorId(null);
        }
    }, [isDialogOpen, isPlayerTurn, setOpenCommandActorId]);

    useEffect(() => {
        if (openCommandActorId === null) return;

        const handleScroll = (event: Event) => {
            // During target selection, allow scrolling inside either TeamColumn.
            if (isTargetSelectionActive) {
                const isTeamColumnScroll = event.composedPath().some(
                    (element) =>
                        element instanceof HTMLElement &&
                        element.hasAttribute("data-team-column-scroll")
                );

                if (isTeamColumnScroll) return;
            }

            // Preserve normal scrolling behavior inside the active TeamColumn.
            if (
                event.target instanceof Node &&
                scrollContainerRef.current?.contains(event.target)
            ) {
                return;
            }

            setOpenCommandActorId(null);
        };

        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [
        openCommandActorId,
        isTargetSelectionActive,
        scrollContainerRef,
        setOpenCommandActorId,
    ]);


    if (!state) return null;


    return (
        <div className={`h-full min-h-0 w-full ${className ?? ""}`}>
            <div
                ref={scrollContainerRef}
                data-team-column-scroll
                className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden p-1 pt-5  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex flex-wrap gap-1 justify-center w-full pb-10">
                    {sortedFighters.map((fighter) => {
                        const isValidTarget =
                            !isDialogOpen &&
                            isTargetSelectionActive &&
                            validTargetIds.includes(fighter.id);

                        const canSelectActor =
                            !isDialogOpen &&
                            !isTargetSelectionActive &&
                            isPlayerSide &&
                            isPlayerTurn &&
                            state?.winner === null &&
                            availablePlayerIds.includes(fighter.id);

                        const isSelectedActor =
                            selectedActorId === fighter.id;

                        const isSelectedTarget =
                            selectedTargetId === fighter.id;

                        return (
                            <FighterCard
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
                                eventType={
                                    involvedIds.has(fighter.id)
                                        ? eventType
                                        : undefined
                                }
                                eventRole={actionEvent?.activePower?.combatRole}
                                setAvatarRef={(node) => {
                                    if (node) {
                                        avatarRefsMap.current.set(fighter.id, node);
                                    } else {
                                        avatarRefsMap.current.delete(fighter.id);
                                    }
                                }}
                                onClick={() => {
                                    if (isDialogOpen) return;

                                    if (isValidTarget) {
                                        onSelectTarget(fighter.id);
                                        setOpenCommandActorId(null);
                                        return;
                                    }

                                    if (canSelectActor) {
                                        onSelectActor(fighter.id);

                                        setOpenCommandActorId((current) =>
                                            current === fighter.id
                                                ? null
                                                : fighter.id
                                        );
                                    }
                                }}
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