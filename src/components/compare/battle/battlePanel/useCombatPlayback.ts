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
    const [accumulatedDamageA, setAccumulatedDamageA] = useState(0);
    const [accumulatedDamageB, setAccumulatedDamageB] = useState(0);

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

    // ── Replay roster state up to currentStepIndex ───────────────────────────
    useEffect(() => {
        if (combatScript.length === 0) return;

        const snapA = buildInitialRoster(teamAChars, nameA);
        const snapB = buildInitialRoster(teamBChars, nameB);
        let bonusA = 0;
        let bonusB = 0;
        let damageA = 0;
        let damageB = 0;

        for (let i = 0; i <= currentStepIndex && i < combatScript.length; i++) {
            const step = combatScript[i];

            // Handle K.O.
            if (step.isKO && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) target.isAlive = false;
            }

            // 🚀 Handle Revive (Bring character back to life & boost health!)
            if (step.isRevive && step.targetName) {
                const target = step.targetTeam === "A"
                    ? snapA.find((c) => c.name === step.targetName)
                    : snapB.find((c) => c.name === step.targetName);
                if (target) {
                    target.isAlive = true;
                    if (step.targetTeam === "A") bonusA += 15;
                    else bonusB += 15;
                }
            }

            // Handle Heals
            if (step.isHeal && step.healTeam) {
                if (step.healTeam === "A") bonusA = Math.min(40, bonusA + 15);
                else bonusB = Math.min(40, bonusB + 15);
            }

            // Accumulate minor chip damage
            if (step.damage !== undefined && step.targetTeam) {
                if (step.targetTeam === "A") damageA += step.damage;
                if (step.targetTeam === "B") damageB += step.damage;
            }
        }

        setRosterA(snapA);
        setRosterB(snapB);
        setDynamicHealthBonusA(bonusA);
        setDynamicHealthBonusB(bonusB);
        setAccumulatedDamageA(damageA);
        setAccumulatedDamageB(damageB);

        if (currentStepIndex >= combatScript.length - 1) setIsPlaying(false);
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
    const totalA = rosterA.length || 1;
    const aliveA = rosterA.filter((c) => c.isAlive).length;
    // Health is driven primarily by alive/total ratio, adjusted lightly by damage and heals/revives
    const healthA = aliveA > 0
        ? Math.min(100, Math.max(10, Math.round((aliveA / totalA) * 100) - Math.floor(accumulatedDamageA * 0.15) + dynamicHealthBonusA))
        : 0;

    const totalB = rosterB.length || 1;
    const aliveB = rosterB.filter((c) => c.isAlive).length;
    const healthB = aliveB > 0
        ? Math.min(100, Math.max(10, Math.round((aliveB / totalB) * 100) - Math.floor(accumulatedDamageB * 0.15) + dynamicHealthBonusB))
        : 0;


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