import { useCallback, useEffect, useMemo, useState } from "react";
import type { Power, PowerRole } from "@/types";
import { useCombatContext } from "../context/CombatContext";
import type { CombatFighter } from "@/lib/matchup/combat/types/types";

type Step = "action" | "power" | "hybrid-role" | "target";

type UseCommandPanelOptions = {
    onClose?: () => void;
};

const getActiveShieldCount = (fighter: CombatFighter) => fighter.status.filter((status) => status.type === "shield" && status.duration > 0).length;

const hasShieldCapacity = (fighter: CombatFighter) => getActiveShieldCount(fighter) < 4;

const getPowerCost = (power: Power) => {
    const tier = Math.min(power.tier ?? 1, 10);
    const score = Math.min(power.score ?? 40, 100);
    return Math.round(14 + tier * 5 + score * 0.18);
};

const getAutomaticTargetIds = (
    actor: CombatFighter,
    targets: CombatFighter[],
    targetType: Power["targetType"]
): number[] => {
    switch (targetType) {
        case "Self":
            return targets
                .filter((fighter) => fighter.id === actor.id)
                .map((fighter) => fighter.id);

        case "Area of Effect (AoE)":
            return targets.map((fighter) => fighter.id);

        case "Self / AoE":
            return [
                ...new Set([
                    actor.id,
                    ...targets.map((fighter) => fighter.id),
                ]),
            ];

        default:
            return [];
    }
};

export function useCommandPanel({ onClose }: UseCommandPanelOptions = {}) {
    const { state, targetMode, onAction, onTargetModeChange } = useCombatContext();
    const [step, setStep] = useState<Step>("action");
    const [selectedPowerId, setSelectedPowerId] = useState<number | null>(null);
    const [chosenRole, setChosenRole] = useState<PowerRole | null>(null);
    const [isProtecting, setIsProtecting] = useState(false);
    const [targetingChoice, setTargetingChoice] = useState<"single" | "multiple">("single");

    const actor = useMemo(() => {
        if (!state) return null;

        return (
            state.fighters.find(
                (fighter) => fighter.id === state.selectedActorId
            ) ?? null
        );
    }, [state]);

    const selectedPower = useMemo(() => {
        if (!actor || selectedPowerId == null) return null;

        return actor.powers.find((power) => power.id === selectedPowerId) ?? null;
    }, [actor, selectedPowerId]);

    const enemies = useMemo(() => {
        if (!actor || !state) return [];

        return state.fighters.filter(
            (fighter) => fighter.side !== actor.side && fighter.isAlive
        );
    }, [state, actor]);

    const allies = useMemo(() => {
        if (!actor || !state) return [];

        return state.fighters.filter(
            (fighter) => fighter.side === actor.side && fighter.isAlive
        );
    }, [state, actor]);

    const protectTargets = useMemo(() => {
        if (!actor) return [];

        return allies.filter((fighter) => fighter.id !== actor.id);
    }, [allies, actor]);

    const healingTargets = useMemo(() => {
        if (!actor || !state) return [];

        return state.fighters.filter((fighter) => {
            if (fighter.side !== actor.side) return false;

            if (actor.isAlive) {
                return fighter.isAlive && fighter.currentHp < fighter.maxHp;
            }

            return (
                fighter.id === actor.id &&
                !fighter.isAlive &&
                !fighter.hasRevived
            );
        });
    }, [state, actor]);

    const isUtilityPower = useCallback(
        (power: Power | null, role?: PowerRole | null) =>
            role === "Utility" || power?.combatRole === "Utility",
        []
    );

    const isHealingPower = useCallback((power: Power | null) => {
        if (!power) return false;

        const name = power.name.toLowerCase();

        return (
            name.includes("heal") ||
            name.includes("regen") ||
            name.includes("healing factor") ||
            name.includes("recovery") ||
            name.includes("immort")
        );
    }, []);

    const getValidTargets = useCallback(
        (power: Power | null, role?: PowerRole | null) => {
            if (!actor) return [];

            if (isHealingPower(power)) return healingTargets;

            const effectiveRole = role ?? power?.combatRole;
            if (effectiveRole === "Defensive") {
                return allies.filter(hasShieldCapacity);
            }
            if (effectiveRole === "Utility") return allies;
            if (effectiveRole === "Control") {
                return enemies.filter(
                    (fighter) =>
                        !(power?.statusEffects?.length
                            ? power.statusEffects.every((effect) => effect.type === "stun")
                            : true) ||
                        !fighter.status.some(
                            (status) =>
                                status.type === "stun_immune" && status.duration > 0
                        )
                );
            }

            return enemies;
        },
        [actor, allies, enemies, healingTargets, isHealingPower]
    );

    // Reset the command flow whenever the selected fighter changes.
    useEffect(() => {
        setStep("action");
        setSelectedPowerId(null);
        setChosenRole(null);
        setIsProtecting(false);
        setTargetingChoice("single");
    }, [state?.selectedActorId]);

    const resetSelection = useCallback(() => {
        setStep("action");
        setSelectedPowerId(null);
        setChosenRole(null);
        setIsProtecting(false);
        setTargetingChoice("single");
    }, []);

    const handleSelectTarget = useCallback(
        (targetId: number) => {
            if (!actor) return;

            if (isProtecting) {
                onAction({
                    type: "team_order",
                    actorId: actor.id,
                    teamOrderType: "protect",
                    targetIds: [targetId],
                });
            } else if (selectedPowerId != null) {
                onAction({
                    type: "use_power",
                    actorId: actor.id,
                    powerId: selectedPowerId,
                    targetIds: [targetId],
                    chosenRole: chosenRole ?? undefined,
                });
            } else {
                onAction({
                    type: "basic_attack",
                    actorId: actor.id,
                    targetIds: [targetId],
                });
            }

            resetSelection();
            onClose?.();
        },
        [actor, isProtecting, selectedPowerId, chosenRole, onAction, resetSelection, onClose]
    );

    const handleSelectMultipleTargets = useCallback(
        (targetIds: number[]) => {
            if (!actor || targetIds.length === 0 || selectedPowerId == null) {
                return;
            }

            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: selectedPowerId,
                targetIds,
                chosenRole: chosenRole ?? undefined,
            });

            resetSelection();
            onClose?.();
        },
        [actor, selectedPowerId, chosenRole, onAction, resetSelection, onClose]
    );

    useEffect(() => {
        if (!state) {
            onTargetModeChange(null);
            return;
        }

        if (step === "target" && actor) {
            const validTargets = isProtecting
                ? protectTargets
                : getValidTargets(selectedPower, chosenRole);

            onTargetModeChange({
                active: true,
                validIds: validTargets.map((fighter) => fighter.id),
                selectionMode:
                    selectedPower?.targetType === "Single Target / AoE" &&
                        targetingChoice === "multiple"
                        ? "multiple"
                        : "single",
                onConfirm: handleSelectTarget,
                onConfirmMultiple: handleSelectMultipleTargets,
            });
        } else {
            onTargetModeChange(null);
        }
    }, [
        state,
        step,
        actor,
        isProtecting,
        protectTargets,
        selectedPower,
        chosenRole,
        targetingChoice,
        getValidTargets,
        handleSelectTarget,
        handleSelectMultipleTargets,
        onTargetModeChange,
    ]);

    const handleBasicAttack = () => {
        setSelectedPowerId(null);
        setChosenRole(null);
        setStep("target");
    };

    const handleProtect = () => {
        if (!actor?.isAlive || protectTargets.length === 0) return;

        setSelectedPowerId(null);
        setChosenRole(null);
        setIsProtecting(true);
        setStep("target");
    };

    const handleUsePower = () => setStep("power");

    const handleSelectPower = (power: Power) => {
        if (!actor) return;

        setSelectedPowerId(power.id);
        setChosenRole(null);

        // Knocked-out fighters can only use healing/regeneration powers to revive themselves.
        if (!actor.isAlive && isHealingPower(power)) {
            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: power.id,
                targetIds: [actor.id],
            });
            setStep("action");
            setSelectedPowerId(null);
            return;
        }

        if (power.combatRole === "Hybrid / Versatile") {
            setStep("hybrid-role");
            return;
        }

        if (
            power.targetType === "Self" ||
            power.targetType === "Area of Effect (AoE)" ||
            power.targetType === "Self / AoE"
        ) {
            const targets = getValidTargets(power, power.combatRole);
            const targetIds = getAutomaticTargetIds(
                actor,
                targets,
                power.targetType
            );

            if (targetIds.length === 0) return;

            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: power.id,
                targetIds,
            });
            setStep("action");
            setSelectedPowerId(null);
            return;
        }

        setStep("target");
    };

    const handleChooseHybridRole = (role: PowerRole) => {
        if (!actor || selectedPowerId === null || !selectedPower) return;

        setChosenRole(role);

        if (
            (role === "Defensive" || role === "Utility") &&
            selectedPower.targetType === "Self"
        ) {
            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: selectedPowerId,
                targetIds: [actor.id],
                chosenRole: role,
            });
            setStep("action");
            setSelectedPowerId(null);
            setChosenRole(null);
            setTargetingChoice("single");
            return;
        }

        if (
            selectedPower.targetType === "Self" ||
            selectedPower.targetType === "Area of Effect (AoE)" ||
            selectedPower.targetType === "Self / AoE"
        ) {
            const targets = getValidTargets(selectedPower, role);
            const targetIds = getAutomaticTargetIds(
                actor,
                targets,
                selectedPower.targetType
            );

            if (targetIds.length === 0) return;

            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: selectedPowerId,
                targetIds,
                chosenRole: role,
            });
            setStep("action");
            setSelectedPowerId(null);
            setChosenRole(null);
            setTargetingChoice("single");
            return;
        }

        setStep("target");
    };

    const handleDefend = () => {
        if (!actor || getActiveShieldCount(actor) >= 4) return;
        onAction({ type: "defend", actorId: actor.id });
        setStep("action");
        onClose?.();
    };

    const activeShieldCount = actor ? getActiveShieldCount(actor) : 0;
    const hasMaxShields = activeShieldCount >= 4;
    const hpPercent = actor?.maxHp
        ? Math.max(0, Math.min(100, (actor.currentHp / actor.maxHp) * 100))
        : 0;
    const energyPercent = actor?.maxEnergy
        ? Math.max(0, Math.min(100, (actor.energy / actor.maxEnergy) * 100))
        : 0;

    const isStunPower =
        chosenRole === "Control" || selectedPower?.combatRole === "Control";
    const isDefensivePower =
        chosenRole === "Defensive" || selectedPower?.combatRole === "Defensive";

    const targetDescription = isProtecting
        ? "Choose a living teammate other than yourself"
        : isDefensivePower || isUtilityPower(selectedPower, chosenRole)
            ? "Choose yourself or a living ally"
            : isHealingPower(selectedPower)
                ? "Choose an injured ally in the arena"
                : isStunPower
                    ? "Choose an opponent without stun immunity"
                    : "Choose an opponent in the arena";

    return {
        state,
        targetMode,
        actor,
        step,
        setStep,
        selectedPowerId,
        setSelectedPowerId,
        selectedPower,
        chosenRole,
        setChosenRole,
        isProtecting,
        targetingChoice,
        setTargetingChoice,
        protectTargets,
        healingTargets,
        availablePowers: actor?.powers ?? [],
        hasMaxShields,
        hpPercent,
        energyPercent,
        targetDescription,
        isUtilityPower,
        isHealingPower,
        getValidTargets,
        getPowerCost,
        handleBasicAttack,
        handleProtect,
        handleUsePower,
        handleSelectPower,
        handleChooseHybridRole,
        handleDefend,
    };
}
