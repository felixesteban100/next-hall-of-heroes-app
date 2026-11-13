"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { CombatState, CombatAction, Row } from "@/lib/matchup/combat/types";
import type { Power, PowerRole } from "@/types";
import { cn } from "@/lib/utils";
import { Swords, Shield, ArrowLeftRight, SkipForward, Zap, HeartPulse } from "lucide-react";

type Props = {
    state: CombatState;
    onAction: (action: CombatAction) => void;
    onTargetModeChange?: (
        targetState: {
            active: boolean;
            validIds: number[];
            onConfirm: (targetId: number) => void;
        } | null
    ) => void;
};

type Step = "action" | "power" | "hybrid-role" | "target";


export function CommandPanel({ state, onAction, onTargetModeChange }: Props) {
    const [step, setStep] = useState<Step>("action");
    const [selectedPowerId, setSelectedPowerId] = useState<number | null>(null);
    const [chosenRole, setChosenRole] = useState<PowerRole | null>(null);

    const actor = useMemo(() => {
        return state.fighters.find((f) => f.id === state.selectedActorId) ?? null;
    }, [state.fighters, state.selectedActorId]);

    const selectedPower = useMemo(() => {
        if (!actor || selectedPowerId == null) return null;
        return actor.powers.find((p) => p.id === selectedPowerId) ?? null;
    }, [actor, selectedPowerId]);

    const enemies = useMemo(() => {
        if (!actor) return [];
        return state.fighters.filter((f) => f.side !== actor.side && f.isAlive);
    }, [state.fighters, actor]);

    const allies = useMemo(() => {
        if (!actor) return [];

        return state.fighters.filter(
            (fighter) =>
                fighter.side === actor.side &&
                fighter.isAlive
        );
    }, [state.fighters, actor]);

    const healingTargets = useMemo(() => {
        if (!actor) return [];

        return state.fighters.filter(
            (fighter) =>
                fighter.side === actor.side &&
                (
                    // Living allies who can receive healing
                    (fighter.isAlive && fighter.currentHp < fighter.maxHp) ||

                    // KO'd allies who haven't used their revival
                    (!fighter.isAlive && !fighter.hasRevived)
                )
        );
    }, [state.fighters, actor]);


    const showAllies = isHealingPower(selectedPower);

    // Reset when selected character changes
    useEffect(() => {
        setStep("action");
        setSelectedPowerId(null);
        setChosenRole(null);
    }, [state.selectedActorId]);

    const handleSelectTarget = useCallback((targetId: number) => {
        if (!actor) return;

        if (selectedPowerId != null) {
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

        setStep("action");
        setSelectedPowerId(null);
        setChosenRole(null);
    }, [actor, selectedPowerId, chosenRole, onAction]);


    useEffect(() => {
        if (!onTargetModeChange) return;

        if (step === "target" && actor) {
            const validIds = (
                showAllies ? healingTargets : enemies
            ).map((fighter) => fighter.id);

            onTargetModeChange({
                active: true,
                validIds,
                onConfirm: handleSelectTarget,
            });
        } else {
            onTargetModeChange(null);
        }
    }, [
        step,
        actor,
        showAllies,
        healingTargets,
        enemies,
        handleSelectTarget,
        onTargetModeChange,
    ]);

    if (!state.isPlayerTurn || state.winner) return null;

    if (!actor) {
        return (
            <div className="border border-muted-foreground/25 rounded-xl bg-card/60 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Click one of your characters above to act
                </p>
            </div>
        );
    }

    // const availablePowers = actor.powers.filter((p) => {
    //     const cd = actor.cooldowns[p.id] ?? 0;
    //     return cd <= 0; // ← This completely hides powers on cooldown!
    // });
    const availablePowers = actor.powers;

    // ── Handlers ────────────────────────────────────────────────

    const handleBasicAttack = () => {
        setSelectedPowerId(null);
        setChosenRole(null);
        setStep("target");
    };

    const handleUsePower = () => {
        setStep("power");
    };


    const handleSelectPower = (power: Power) => {
        setSelectedPowerId(power.id);
        setChosenRole(null);

        // KO'd characters can only use a healing/regeneration
        // power on themselves to revive.
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

        // Existing hybrid handling
        if (power.combatRole === "Hybrid / Versatile") {
            setStep("hybrid-role");
            return;
        }

        // Existing defensive handling
        if (power.combatRole === "Defensive") {
            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: power.id,
                targetIds: [actor.id],
            });

            onAction({ type: "defend", actorId: actor.id });

            setStep("action");
            setSelectedPowerId(null);
            return;
        }

        setStep("target");
    };


    const handleChooseHybridRole = (role: PowerRole) => {
        setChosenRole(role);

        if (role === "Defensive") {
            // Auto-cast on self
            // onAction({
            //     type: "use_power",
            //     actorId: actor.id,
            //     powerId: selectedPowerId!,
            //     targetIds: [actor.id],
            //     chosenRole: "Defensive",
            // });
            onAction({ type: "defend", actorId: actor.id });
            setStep("action");
            setSelectedPowerId(null);
            setChosenRole(null);
            return;
        }

        // Offensive → go to target selection
        setStep("target");
    };



    const handleDefend = () => {
        onAction({ type: "defend", actorId: actor.id });
        setStep("action");
    };

    /* const handleSwap = () => {
        const newRow: Row = actor.row === "front" ? "back" : "front";
        onAction({ type: "swap_row", actorId: actor.id, newRow });
        setStep("action");
    }; */

    const handlePass = () => {
        onAction({ type: "pass", actorId: actor.id });
        setStep("action");
    };

    const getPowerCost = (power: Power) => {
        const tier = Math.min(power.tier ?? 1, 10);
        const score = Math.min(power.score ?? 40, 100);
        return Math.round(14 + tier * 5 + score * 0.18);
    };

    function isHealingPower(power: Power | null) {
        if (!power) return false;
        const name = power.name.toLowerCase();
        return (
            name.includes("heal") ||
            name.includes("regeneration") ||
            name.includes("healing factor") ||
            name.includes("recovery")
            ||
            name.includes("immort")
        );
    };

    // ── Render ──────────────────────────────────────────────────

    return (
        /* border border-muted-foreground/25 rounded-xl bg-card/60 p-3  */
        <div className="space-y-3 mt-2">
            {/* Header */}
            {/* <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Commanding
                    </div>
                    <div className="text-base font-bold text-primary">{actor.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>
                            HP {actor.currentHp}/{actor.maxHp}
                        </span>
                        <span>·</span>
                        <span className="text-sky-400 font-medium">
                            Energy {actor.energy}/{actor.maxEnergy}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{actor.row}</span>
                    </div>
                </div>
            </div> */}

            {/* Step: Action */}
            {step === "action" && (
                <div className="flex flex-row flex-wrap gap-2">
                    <ActionButton
                        icon={<Swords className="size-4" />}
                        label="Basic"
                        onClick={handleBasicAttack}
                    />
                    <ActionButton
                        icon={<Zap className="size-4" />}
                        label="Power"
                        onClick={handleUsePower}
                        disabled={availablePowers.length === 0}
                    />
                    <ActionButton
                        icon={<Shield className="size-4" />}
                        label="Defend"
                        onClick={handleDefend}
                    />
                    {/* <ActionButton
                        icon={<ArrowLeftRight className="size-4" />}
                        label={`Swap (${actor.row === "front" ? "→ Back" : "→ Front"})`}
                        onClick={handleSwap}
                    /> */}
                    <ActionButton
                        icon={<SkipForward className="size-4" />}
                        label="Pass"
                        onClick={handlePass}
                        variant="muted"
                    />
                </div>
            )}

            {/* Step: Select Power */}
            {step === "power" && (
                <div className="space-y-3 w-full">
                    <span className="text-sky-400 font-medium my-3">
                        Energy {actor.energy}/{actor.maxEnergy}
                    </span>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Power
                        </span>
                        <button
                            type="button"
                            onClick={() => setStep("action")}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Back
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
                        {availablePowers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No powers available.</p>
                        ) : (
                            availablePowers.map((power) => {
                                const cost = getPowerCost(power);
                                const canAfford = actor.energy >= cost;

                                // 🌟 2. Robust lookup checking both number and string keys
                                const cd = actor.cooldowns[power.id] ?? actor.cooldowns[power.id] ?? 0;

                                const isHeal = isHealingPower(power);
                                const hasHealingTarget = healingTargets.length > 0;

                                const disabled =
                                    (isHeal && !hasHealingTarget) ||
                                    cd > 0 ||
                                    !canAfford;

                                return (
                                    <button
                                        key={power.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleSelectPower(power)}
                                        className={cn(
                                            "flex flex-col items-start gap-0.5 p-2.5 rounded-lg border text-left transition-all min-w-[150px]",
                                            disabled
                                                ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                                                : "border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="font-semibold text-sm truncate">{power.name}</span>
                                            {/* 🌟 4. Display CD badge when cooldown is active */}
                                            {cd > 0 && (
                                                <span className="text-[10px] font-bold text-amber-500">CD {cd}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span>{power.combatRole}</span>
                                            <span>·</span>
                                            <span>Tier {power.tier}</span>
                                            <span>·</span>
                                            <span className={canAfford ? "text-emerald-500" : "text-rose-400"}>
                                                {cost} EN
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Step: Hybrid Role Selection */}
            {step === "hybrid-role" && selectedPower && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Choose how to use [{selectedPower.name}]
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setStep("power");
                                setSelectedPowerId(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Back
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleChooseHybridRole("Offensive")}
                            className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border/60 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                        >
                            <Swords className="size-5 text-red-400" />
                            <span className="text-sm font-semibold">Offensive</span>
                            <span className="text-[11px] text-muted-foreground">Deal damage</span>
                        </button>

                        <button
                            onClick={() => handleChooseHybridRole("Defensive")}
                            className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border/60 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                        >
                            <Shield className="size-5 text-cyan-400" />
                            <span className="text-sm font-semibold">Defensive</span>
                            <span className="text-[11px] text-muted-foreground">Gain shield</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Step: Select Target */}
            {step === "target" && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Target
                            {selectedPower && ` • ${selectedPower.name}`}
                            {chosenRole && ` (${chosenRole})`}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedPower?.combatRole === "Hybrid / Versatile") {
                                    setStep("hybrid-role");
                                } else {
                                    setStep(selectedPowerId ? "power" : "action");
                                }
                                setChosenRole(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Back
                        </button>
                    </div>

                    <p>Choose the target</p>

                    {/* <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
                        {
                        // For healing / utility we show allies + self, otherwise enemies 
                        (showAllies ? allies : enemies).map((target) => (
                            <button
                                key={target.id}
                                type="button"
                                onClick={() => handleSelectTarget(target.id)}
                                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-secondary/15 hover:border-secondary transition-all"
                            >
                                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-background bg-muted">
                                    {target.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={target.image}
                                            alt={target.name}
                                            className="w-full h-full object-cover"
                                            style={{ objectPosition: target.imageFocus }}
                                        />
                                    )}
                                </div>
                                <span className="text-xs font-semibold truncate w-full text-center">
                                    {target.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {target.currentHp}/{target.maxHp}
                                </span>
                            </button>
                        ))}
                    </div> */}
                </div>
            )}
        </div>
    );
}

function ActionButton({
    icon,
    label,
    onClick,
    disabled,
    variant = "default",
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "muted";
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                variant === "default"
                    ? "border-muted-foreground/25 hover:bg-primary/10 hover:border-primary"
                    : "border-muted-foreground/15 text-muted-foreground hover:bg-muted",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {icon}
            {label}
        </button>
    );
}