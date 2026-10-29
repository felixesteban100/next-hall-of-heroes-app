import { useCallback, useEffect, useRef, useState } from "react";
import { FighterState, ScriptItem } from "../BattlePanel";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare";

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
        image: c.images.md
    }));
}

/**
 * Manages all playback state: play/pause, step index, roster snapshots,
 * and the derived health values.
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
    const [dynamicHealthBonusA, setDynamicHealthBonusA] = useState(0);
    const [dynamicHealthBonusB, setDynamicHealthBonusB] = useState(0);

    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // ── Reset rosters when characters change ─────────────────────────────────
    useEffect(() => {
        setRosterA(buildInitialRoster(teamAChars, nameA));
        setRosterB(buildInitialRoster(teamBChars, nameB));
        setDynamicHealthBonusA(0);
        setDynamicHealthBonusB(0);
        setCombatScript([]);
        setCurrentStepIndex(-1);
        setIsPlaying(false);
    }, [teamAChars, teamBChars, nameA, nameB]);

    // ── Delayed roster updates so health drops AFTER clash animation ──────────
    useEffect(() => {
        if (combatScript.length === 0) return;

        const snapA = buildInitialRoster(teamAChars, nameA);
        const snapB = buildInitialRoster(teamBChars, nameB);
        let bonusA = 0;
        let bonusB = 0;

        for (let i = 0; i <= currentStepIndex && i < combatScript.length; i++) {
            const step = combatScript[i];

            if (step.isKO && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) target.isAlive = false;
            }

            if (step.isRevive && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) target.isAlive = true;
            }

            if (step.isHeal && step.healTeam) {
                if (step.healTeam === "A") bonusA = Math.min(30, bonusA + 15);
                else bonusB = Math.min(30, bonusB + 15);
            }
        }

        // 🚀 Wait 400ms into the step animation before applying the roster state change (HP drop)
        const timer = setTimeout(() => {
            setRosterA(snapA);
            setRosterB(snapB);
            setDynamicHealthBonusA(bonusA);
            setDynamicHealthBonusB(bonusB);
        }, 1500);

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
            setDynamicHealthBonusA(0);
            setDynamicHealthBonusB(0);
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
    }, [combatScript.length, currentStepIndex]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((p) => !p);
    }, []);

    // ── Derived health values ─────────────────────────────────────────────────
    // ── Pure, Reliable Roster-Ratio Health ────────────────────────────────────
    const totalA = rosterA.length || 1;
    const aliveA = rosterA.filter((c) => c.isAlive).length;
    const healthA = Math.min(100, Math.max(0, Math.round((aliveA / totalA) * 100) + dynamicHealthBonusA));

    const totalB = rosterB.length || 1;
    const aliveB = rosterB.filter((c) => c.isAlive).length;
    const healthB = Math.min(100, Math.max(0, Math.round((aliveB / totalB) * 100) + dynamicHealthBonusB));


    const visibleLogs = combatScript.slice(0, currentStepIndex + 1).map((s) => s.log);

    return {
        // state
        combatScript,
        currentStepIndex,
        isPlaying,
        rosterA,
        rosterB,
        healthA,
        healthB,
        visibleLogs,
        // actions
        loadScript,
        handleNextStep,
        handlePrevStep,
        togglePlayPause,
    };
}