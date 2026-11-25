"use client";

import { useEffect, useRef, useState } from "react";
import { CombatEngine } from "@/lib/matchup/combat/engine/CombatEngine";
import type {
    CombatState,
    CombatEvent,
} from "@/lib/matchup/combat/types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CombatHeader } from "./CombatHeader";
import { useCombatPresentationQueue } from "./hooks/useCombatPresentationQueue";
import { useCombatAI } from "./hooks/useCombatAI";
import { useCombatTargeting } from "./hooks/useCombatTargeting";
import { useCombatActions } from "./hooks/useCombatActions";
import CinematicCombatView from "./CinematicCombatView";
import { CombatProvider } from "./context/CombatContext";

type Props = {
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA?: string;
    nameB?: string;
    playerSide?: "A" | "B";
};

export function CombatArena({
    teamAChars,
    teamBChars,
    nameA = "Team A",
    nameB = "Team B",
    playerSide = "A",
}: Props) {
    const engineRef = useRef<CombatEngine | null>(null);
    const [state, setState] = useState<CombatState | null>(null);
    const [visibleEvents, setVisibleEvents] = useState<CombatEvent[]>([]);
    const [previousHpById, setPreviousHpById] = useState<Record<number, number>>({});
    const [animationSpeed, setAnimationSpeed] = useState<1 | 2>(1);
    const [inspectedCharacterId, setInspectedCharacterId] = useState<number | null>(null);

    const {
        enqueueEvents,
        isPresentingRef,
        resetQueue,
        skipCurrentPresentation,
    } = useCombatPresentationQueue(setVisibleEvents, animationSpeed);

    const {
        targetMode,
        handleTargetModeChange,
        handleSelectActor,
        handleDeselectActor,
        handleSelectTarget,
    } = useCombatTargeting({ engineRef, setState });

    const { handleAction, handleStartBattle } = useCombatActions({
        engineRef,
        enqueueEvents,
        setState,
        setPreviousHpById,
    });

    useEffect(() => {
        if (teamAChars.length === 0 || teamBChars.length === 0) return;

        // Clear any previous presentation
        resetQueue();

        const engine = new CombatEngine();

        engine.initialize(teamAChars, teamBChars, playerSide, nameA, nameB);

        engineRef.current = engine;

        setState({ ...engine.getState() });
        setVisibleEvents([]);

        return resetQueue;
    }, [teamAChars, teamBChars, playerSide, nameA, nameB, resetQueue]);

    useCombatAI({
        state,
        engineRef,
        isPresentingRef,
        enqueueEvents,
        setState,
        setPreviousHpById,
    });

    if (teamAChars.length === 0 || teamBChars.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Select fighters for both sides to begin combat
            </p>
        );
    } else if (!state) {
        return (
            <div className="text-center text-sm text-muted-foreground py-10">
                Preparing combat...
            </div>
        );
    }

    // Temporary mapping helpers until we adapt CinematicCombatView
    const rosterA = state.fighters.filter((f) => f.side === "A");
    const rosterB = state.fighters.filter((f) => f.side === "B");

    return (
        <div className="flex flex-col gap-3 relative border border-muted-foreground/20 rounded-xl p-3 mb-3">
            <CombatHeader state={state} nameA={nameA} nameB={nameB} />
            <CombatProvider
                value={{
                    state,
                    targetMode,
                    onAction: handleAction,
                    onSelectActor: handleSelectActor,
                    onSelectTarget: handleSelectTarget,
                    onDeselectActor: handleDeselectActor,
                    onTargetModeChange: handleTargetModeChange,
                    inspectedCharacterId,
                    onInspectCharacter: setInspectedCharacterId,
                }}
            >
                <CinematicCombatView
                    fightersA={rosterA}
                    fightersB={rosterB}
                    events={visibleEvents}
                    teamAChars={teamAChars}
                    teamBChars={teamBChars}
                    playerSide={state.playerSide}
                    previousHpById={previousHpById}
                    battleStarted={state.battleStarted}
                    onStartBattle={handleStartBattle}
                    onSkipPresentation={skipCurrentPresentation}
                    animationSpeed={animationSpeed}
                    onAnimationSpeedChange={setAnimationSpeed}
                />
            </CombatProvider>
        </div>
    );
}
