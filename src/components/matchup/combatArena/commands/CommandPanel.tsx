"use client";

import { cn } from "@/lib/utils";
import { useCommandPanel } from "./useCommandPanel";
import { CommandPanelHeader } from "./CommandPanelHeader";
import { CommandPanelActions } from "./CommandPanelActions";
import { CommandPanelPowerSelection } from "./CommandPanelPowerSelection";
import { CommandPanelHybridSelection } from "./CommandPanelHybridSelection";
import { CommandPanelTargetSelection } from "./CommandPanelTargetSelection";

type Props = {
    onClose?: () => void;
    compact?: boolean;
    availableHeight?: number;
};


export function CommandPanel({
    onClose,
    compact = false,
    availableHeight,
}: Props) {
    const {
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
        availablePowers,
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
    } = useCommandPanel({ onClose });

    if (!state || !state.isPlayerTurn || state.winner) return null;

    if (!actor) {
        return (
            <div className="border border-muted-foreground/25 rounded-xl bg-card/60 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Click one of your characters above to act
                </p>
            </div>
        );
    }

    const activeStatuses = actor.status.filter(
        (status) => status.duration > 0
    );

    // ── Render ──────────────────────────────────────────────────

    return (
        <div
            className={cn(
                "mx-auto flex w-full min-h-0 flex-col",
                compact ? "max-w-none" : "mt-2 max-w-4xl"
            )}
            style={
                compact && availableHeight && step === "power"
                    ? {
                        height: availableHeight,
                        maxHeight: availableHeight,
                    }
                    : undefined
            }
        >
            <div
                className={cn(
                    "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-card/95",
                    compact ? "px-2 py-2" : "px-2.5 py-2"
                )}
            >
                {/* Fighter header */}
                {!compact && (
                    <CommandPanelHeader
                        actor={actor}
                        hpPercent={hpPercent}
                        energyPercent={energyPercent}
                    />
                )}

                {/* ACTIVE STATUS EFFECTS */}
                {/* make this scrollable with a limited height */}
                {/* show all the quialities of the character here not just the applied statuses but for example if it can revive and everything else */}
                {/* {compact && (
                    <div className="mb-2 rounded-lg border border-white/10 bg-background/50 p-2">
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Active Status Effects
                        </p>

                        {activeStatuses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {activeStatuses.map((status) => (
                                    <span
                                        key={status.id}
                                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium"
                                        title={`${status.name} — ${status.duration} turns remaining`}
                                    >
                                        {status.name}

                                        <span className="text-muted-foreground">
                                            {status.duration}T
                                        </span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-muted-foreground">
                                No active status effects
                            </p>
                        )}
                    </div>
                )} */}

                {/* Command content */}
                <div
                    className={cn(
                        "flex min-h-0 flex-1 flex-col overflow-hidden",
                        compact ? "p-2" : "p-3 sm:p-4"
                    )}
                >
                    {/* ACTION SELECTION */}
                    {step === "action" && (
                        <CommandPanelActions
                            actor={actor}
                            availablePowers={availablePowers}
                            hasMaxShields={hasMaxShields}
                            protectTargetCount={protectTargets.length}
                            onBasicAttack={handleBasicAttack}
                            onUsePower={handleUsePower}
                            onDefend={handleDefend}
                            onProtect={handleProtect}
                        />
                    )}

                    {/* POWER SELECTION */}
                    {step === "power" && (
                        <CommandPanelPowerSelection
                            actor={actor}
                            availablePowers={availablePowers}
                            compact={compact}
                            availableHeight={availableHeight}
                            // hasHealingTargets={healingTargets.length > 0}
                            getPowerCost={getPowerCost}
                            isHealingPower={isHealingPower}
                            getValidTargets={getValidTargets}
                            onSelectPower={handleSelectPower}
                            onBack={() => {
                                setStep("action");
                                setSelectedPowerId(null);
                            }}
                        />
                    )}

                    {/* HYBRID ROLE */}
                    {step === "hybrid-role" && selectedPower && (
                        <CommandPanelHybridSelection
                            selectedPower={selectedPower}
                            getValidTargets={getValidTargets}
                            onChooseRole={handleChooseHybridRole}
                            onBack={() => {
                                setStep("power");
                                setSelectedPowerId(null);
                            }}
                        />
                    )}

                    {/* TARGET SELECTION */}
                    {step === "target" && (
                        <CommandPanelTargetSelection
                            targetMode={targetMode}
                            selectedPower={selectedPower}
                            chosenRole={chosenRole}
                            isProtecting={isProtecting}
                            targetingChoice={targetingChoice}
                            targetDescription={targetDescription}
                            isUtilityPower={isUtilityPower}
                            isHealingPower={isHealingPower}
                            onTargetingChoiceChange={setTargetingChoice}
                            onBack={() => {
                                if (selectedPower?.combatRole === "Hybrid / Versatile") {
                                    setStep("hybrid-role");
                                } else {
                                    setStep(selectedPowerId ? "power" : "action");
                                }

                                setChosenRole(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}