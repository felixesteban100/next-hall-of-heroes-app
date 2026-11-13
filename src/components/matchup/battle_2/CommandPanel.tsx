"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { CombatState, CombatAction, Row } from "@/lib/matchup/combat/types";
import type { Power, PowerRole } from "@/types";
import { cn } from "@/lib/utils";
import { Swords, Shield, ArrowLeftRight, SkipForward, Zap, HeartPulse, Lock } from "lucide-react";
import { combatRoleConfig } from "@/lib/matchup/combat/combatRole";

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
    onClose?: () => void;
    compact?: boolean;
};

type Step = "action" | "power" | "hybrid-role" | "target";


export function CommandPanel({ state, onAction, onTargetModeChange, onClose, compact = false, }: Props) {
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

        return state.fighters.filter((fighter) => {
            if (fighter.side !== actor.side) return false;

            // Living fighters can heal injured living allies.
            if (actor.isAlive) {
                return fighter.isAlive && fighter.currentHp < fighter.maxHp;
            }

            // A KO'd fighter can only select themselves for revival.
            return (
                fighter.id === actor.id &&
                !fighter.isAlive &&
                !fighter.hasRevived
            );
        });
    }, [state.fighters, actor]);

    const isUtilityPower = useCallback(
        (power: Power | null) => power?.combatRole === "Utility",
        []
    );

    const isHealingPower = useCallback(
        (power: Power | null) => {
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
        },
        []
    );

    const isSupportPower =
        isHealingPower(selectedPower) ||
        isUtilityPower(selectedPower);

    const showAllies = isSupportPower;

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
        onClose?.();
    }, [actor, selectedPowerId, chosenRole, onAction, onClose]);


    useEffect(() => {
        if (!onTargetModeChange) return;

        if (step === "target" && actor) {
            const validTargets = isUtilityPower(selectedPower)
                ? allies
                : showAllies
                    ? healingTargets
                    : enemies;

            const validIds = validTargets.map((fighter) => fighter.id);

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
        allies,
        enemies,
        selectedPower,
        isUtilityPower,
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

        // KO'd characters can only use healing/regeneration
        // powers on themselves to revive.
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

        // Hybrid powers require a role selection.
        if (power.combatRole === "Hybrid / Versatile") {
            setStep("hybrid-role");
            return;
        }

        // Defensive powers execute once, targeting themselves.
        if (power.combatRole === "Defensive") {
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

        setStep("target");
    };

    const handleChooseHybridRole = (role: PowerRole) => {
        setChosenRole(role);

        if (role === "Defensive") {
            onAction({
                type: "use_power",
                actorId: actor.id,
                powerId: selectedPowerId!,
                targetIds: [actor.id],
                chosenRole: "Defensive",
            });

            setStep("action");
            setSelectedPowerId(null);
            setChosenRole(null);
            return;
        }

        // Offensive → go to target selection.
        setStep("target");
    };


    /* const handleSwap = () => {
        const newRow: Row = actor.row === "front" ? "back" : "front";
        onAction({ type: "swap_row", actorId: actor.id, newRow });
        setStep("action");
    onClose?.();
    }; */

    const handleDefend = () => {
        onAction({ type: "defend", actorId: actor.id });
        setStep("action");
        onClose?.();
    };

    const handlePass = () => {
        onAction({ type: "pass", actorId: actor.id });
        setStep("action");
        onClose?.();
    };

    const getPowerCost = (power: Power) => {
        const tier = Math.min(power.tier ?? 1, 10);
        const score = Math.min(power.score ?? 40, 100);
        return Math.round(14 + tier * 5 + score * 0.18);
    };

    const hpPercent = actor
        ? Math.max(0, Math.min(100, (actor.currentHp / actor.maxHp) * 100))
        : 0;

    const energyPercent = actor
        ? Math.max(0, Math.min(100, (actor.energy / actor.maxEnergy) * 100))
        : 0;

    const targetDescription = showAllies
        ? isUtilityPower(selectedPower)
            ? "Choose yourself or a living ally"
            : "Choose an injured ally in the arena"
        : "Choose an opponent in the arena";



    // ── Render ──────────────────────────────────────────────────

    return (
        <div className={cn(
            "mx-auto w-full",
            compact
                ? "max-w-none"
                : "mt-2 max-w-4xl"
        )}>
            <div className={cn(
                "overflow-hidden rounded-xl border border-white/10 bg-card/95",
                compact ? "px-2 py-2" : "px-2.5 py-2"
            )}>
                {/* Fighter header */}
                {!compact && (
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
                        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-muted">
                            {actor.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={actor.image}
                                    alt={actor.name}
                                    className="h-full w-full object-cover"
                                    style={{ objectPosition: actor.imageFocus }}
                                />
                            )}
                            {!actor.isAlive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-[9px] font-black text-red-400">
                                    K.O.
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 w-28 shrink-0">
                            <p className="truncate text-xs font-bold">{actor.name}</p>
                            <p className="text-[9px] text-muted-foreground">
                                {actor.isAlive ? "Ready to fight" : "Knocked Out"}
                            </p>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex justify-between text-[9px]">
                                    <span className="font-bold text-emerald-400">HP</span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {actor.currentHp}/{actor.maxHp}
                                    </span>
                                </div>
                                <div className="h-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full bg-emerald-500 transition-all"
                                        style={{ width: `${hpPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex justify-between text-[9px]">
                                    <span className="font-bold text-sky-400">EN</span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {actor.energy}/{actor.maxEnergy}
                                    </span>
                                </div>
                                <div className="h-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full bg-sky-500 transition-all"
                                        style={{ width: `${energyPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Command content */}
                <div className={compact ? "p-2" : "p-3 sm:p-4"}>
                    {/* ACTION SELECTION */}
                    {step === "action" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {/* Combat Commands */}
                                    {actor.name}
                                </span>
                                <span className="text-[9px] font-bold text-primary">
                                    YOUR TURN
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                                <ActionButton
                                    icon={<Swords className="size-4" />}
                                    label="Attack"
                                    onClick={handleBasicAttack}
                                    disabled={!actor.isAlive}
                                    variant="attack"
                                />

                                <ActionButton
                                    icon={<Zap className="size-4" />}
                                    label="Power"
                                    onClick={handleUsePower}
                                    disabled={availablePowers.length === 0}
                                    variant="power"
                                />

                                <ActionButton
                                    icon={<Shield className="size-4" />}
                                    label="Defend"
                                    onClick={handleDefend}
                                    disabled={!actor.isAlive}
                                    variant="defend"
                                />

                                {/* <ActionButton
                                    icon={<SkipForward className="size-4" />}
                                    label="Pass"
                                    onClick={handlePass}
                                    disabled={!actor.isAlive}
                                    variant="muted"
                                /> */}
                            </div>
                        </div>
                    )}

                    {/* POWER SELECTION */}
                    {step === "power" && (
                        <div className="flex max-h-[260px] min-h-0 flex-col gap-1.5 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Ability Selection
                                    </p>
                                    <h3 className="text-xs font-bold">Choose a power</h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("action");
                                        setSelectedPowerId(null);
                                    }}
                                    className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    Back
                                </button>
                            </div>

                            {/* Energy */}
                            <div className="flex items-center justify-between rounded-md bg-sky-500/5 px-2 py-1">
                                <span className="text-[10px] text-muted-foreground">
                                    Available energy
                                </span>
                                <span className="text-xs font-bold tabular-nums text-sky-400">
                                    <Zap className="mr-1 inline size-3" />
                                    {actor.energy}/{actor.maxEnergy}
                                </span>
                            </div>

                            {/* Scrollable power list */}
                            <div
                                className="hide-scrollbar"
                                style={{
                                    height: "80px",
                                    minHeight: "80px",
                                    maxHeight: "80px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    overscrollBehavior: "contain",
                                }}
                            >
                                <div className="flex flex-col gap-1">
                                    {availablePowers.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-white/10 p-3 text-center">
                                            <Zap className="mx-auto mb-1 size-4 text-muted-foreground/50" />
                                            <p className="text-xs font-semibold">
                                                No powers available
                                            </p>
                                        </div>
                                    ) : (
                                        availablePowers.map((power) => {
                                            const cost = getPowerCost(power);
                                            const canAfford = actor.energy >= cost;
                                            const cd = actor.cooldowns[power.id] ?? 0;
                                            const isHeal = isHealingPower(power);
                                            const hasHealingTarget = healingTargets.length > 0;

                                            const disabled =
                                                (!actor.isAlive && !isHeal) ||
                                                (isHeal && !hasHealingTarget) ||
                                                cd > 0 ||
                                                !canAfford;

                                            const roleConfig = combatRoleConfig[power.combatRole];
                                            const RoleIcon = isHeal
                                                ? HeartPulse
                                                : roleConfig.Icon;

                                            return (
                                                <button
                                                    key={power.id}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => handleSelectPower(power)}
                                                    className={cn(
                                                        "group relative flex min-w-0 shrink-0 items-center gap-2 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-all duration-200",
                                                        disabled
                                                            ? "cursor-not-allowed border-white/5 bg-muted/20 opacity-40"
                                                            : "border-white/10 bg-muted/30 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                                                    )}
                                                >
                                                    {/* Power icon */}
                                                    <div
                                                        className={cn(
                                                            "flex size-6 shrink-0 items-center justify-center rounded-md border",
                                                            isHeal
                                                                ? combatRoleConfig.Utility.className
                                                                : roleConfig.className
                                                        )}
                                                    >
                                                        <RoleIcon className="size-3.5" />
                                                    </div>

                                                    {/* Power information */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="truncate text-[11px] font-bold">
                                                                {power.name}
                                                            </span>

                                                            {cd > 0 && (
                                                                <span className="shrink-0 rounded bg-amber-500/10 px-1 py-0.5 text-[8px] font-bold text-amber-400">
                                                                    CD {cd}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                                            <span>{power.combatRole}</span>
                                                            <span>·</span>
                                                            <span>Tier {power.tier ?? 1}</span>
                                                        </div>
                                                    </div>

                                                    {/* Energy cost */}
                                                    <div className="shrink-0 text-right">
                                                        <div
                                                            className={cn(
                                                                "text-[11px] font-black tabular-nums",
                                                                canAfford
                                                                    ? "text-sky-400"
                                                                    : "text-rose-400"
                                                            )}
                                                        >
                                                            {cost}
                                                        </div>
                                                        <div className="text-[8px] font-semibold text-muted-foreground">
                                                            EN
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                    )}

                    {/* HYBRID ROLE */}
                    {step === "hybrid-role" && selectedPower && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[9px] text-muted-foreground">Choose combat style</p>
                                    <h3 className="truncate text-xs font-semibold">{selectedPower.name}</h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("power");
                                        setSelectedPowerId(null);
                                    }}
                                    className="text-[10px] text-muted-foreground hover:text-foreground"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleChooseHybridRole("Offensive")}
                                    className="flex items-center justify-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-2 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Swords className="size-3.5" />
                                    Offensive
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleChooseHybridRole("Defensive")}
                                    className="flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                                >
                                    <Shield className="size-3.5" />
                                    Defensive
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TARGET SELECTION */}
                    {step === "target" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[9px] text-muted-foreground">Target selection</p>
                                    <h3 className="truncate text-xs font-semibold">
                                        {selectedPower?.name ?? "Basic Attack"}
                                    </h3>
                                </div>

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
                                    className="text-[10px] text-muted-foreground hover:text-foreground"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                                {showAllies ? (
                                    <HeartPulse className="size-4 shrink-0 text-primary" />
                                ) : (
                                    <Swords className="size-4 shrink-0 text-primary" />
                                )}

                                <div className="min-w-0">
                                    <p className="text-xs font-medium">
                                        {showAllies ? "Select an ally" : "Select an enemy"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{targetDescription}</p>
                                </div>
                            </div>

                            {chosenRole && (
                                <p className="text-[9px] text-center text-muted-foreground">
                                    {chosenRole} ability
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
    variant?: "default" | "attack" | "power" | "defend" | "muted";
}) {
    const styles = {
        default: "border-white/10 bg-muted/30 hover:bg-muted/50",
        attack: "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10",
        power: "border-violet-500/20 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10",
        defend: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10",
        muted: "border-white/10 bg-muted/20 text-muted-foreground hover:bg-muted/40",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex h-5 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-1.5",
                "text-[11px] font-bold transition-all active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-30",
                styles[variant]
            )}
        >
            {icon}
            <span className="truncate">{label}</span>
        </button>
    );
}