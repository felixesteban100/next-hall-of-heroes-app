import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare";
import { FighterState, ScriptItem } from "./useCombatScript";

const STEP_INTERVAL_MS = 4500;

function buildInitialRoster(
    chars: CharacterWithJoinTeamUniversePowerEnemies[],
    fallbackName: string
): FighterState[] {
    return chars.map((c) => ({
        name: c.name ?? fallbackName,
        overall: c.powerstats ? (computeMatchScore(c as any).overall ?? 50) : 50,
        isAlive: true,
        powers: c.powers ?? [],
        hasRevived: false,
        imageFocus: c.imageFocus,
        image: c.images.md,
        maxHp: c.powerstats.durability * 2,
        currentHp: c.powerstats.durability * 2
    }));
}

/**
 * Manages all playback state: play/pause, step index, and roster snapshots.
 */
export function useCombatPlayback(
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[],
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[],
    nameA: string,
    nameB: string
) {
    const [combatScript, setCombatScript] = useState<ScriptItem[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    const [rosterA, setRosterA] = useState<FighterState[]>([]);
    const [rosterB, setRosterB] = useState<FighterState[]>([]);

    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // ── Reset rosters when characters change ─────────────────────────────────
    useEffect(() => {
        setRosterA(buildInitialRoster(teamAChars, nameA));
        setRosterB(buildInitialRoster(teamBChars, nameB));
        setCombatScript([]);
        setCurrentStepIndex(-1);
        setIsPlaying(false);
    }, [teamAChars, teamBChars, nameA, nameB]);

    // ── Delayed roster updates so health drops AFTER clash animation ──────────
    useEffect(() => {
        if (combatScript.length === 0) return;

        const snapA = buildInitialRoster(teamAChars, nameA);
        const snapB = buildInitialRoster(teamBChars, nameB);

        for (let i = 0; i <= currentStepIndex && i < combatScript.length; i++) {
            const step = combatScript[i];

            if (step.isKO && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) {
                    target.isAlive = false;
                    target.currentHp = 0;
                }
            }

            if (step.isRevive && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) {
                    target.isAlive = true;
                    target.currentHp = Math.round(target.maxHp * 0.45);
                }
            }
        }

        // Wait 500ms into the step animation before applying roster changes
        const timer = setTimeout(() => {
            setRosterA(snapA);
            setRosterB(snapB);
        }, 500);

        if (currentStepIndex >= combatScript.length - 1) setIsPlaying(false);

        return () => clearTimeout(timer);
    }, [currentStepIndex, combatScript, teamAChars, teamBChars, nameA, nameB]);

    // ── Auto-play interval ────────────────────────────────────────────────────
    useEffect(() => {
        if (isPlaying) {
            autoPlayRef.current = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    if (prev < combatScript.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, STEP_INTERVAL_MS);
        } else {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        }
        return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
    }, [isPlaying, combatScript.length]);

    // ── Public API ────────────────────────────────────────────────────────────
    const loadScript = useCallback(
        (script: ScriptItem[], initialA: FighterState[], initialB: FighterState[]) => {
            setCombatScript(script);
            setCurrentStepIndex(-1);
            setRosterA(initialA);
            setRosterB(initialB);
            setIsPlaying(false);
        },
        []
    );

    const handleNextStep = useCallback(() => {
        setCurrentStepIndex((prev) =>
            prev < combatScript.length - 1 ? prev + 1 : prev
        );
        if (currentStepIndex >= combatScript.length - 1) setIsPlaying(false);
    }, [combatScript.length, currentStepIndex]);

    const handlePrevStep = useCallback(() => {
        setCurrentStepIndex((prev) =>
            prev > 0 ? prev - 1 : prev
        );
        if (currentStepIndex <= 1) setIsPlaying(false);
    }, [currentStepIndex]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((p) => !p);
    }, []);

    const visibleLogs = combatScript.slice(0, currentStepIndex + 1).map((s) => s.log);

    return {
        // state
        combatScript,
        currentStepIndex,
        isPlaying,
        rosterA,
        rosterB,
        visibleLogs,
        // actions
        loadScript,
        handleNextStep,
        handlePrevStep,
        togglePlayPause,
    };
}