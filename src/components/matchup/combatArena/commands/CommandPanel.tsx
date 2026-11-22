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

    // ── Render ──────────────────────────────────────────────────

    return (
        <div
            className={cn(
                "mx-auto flex w-full min-h-0 flex-col",
                compact ? "max-w-none" : "mt-2 max-w-4xl"
            )}
            style={
                compact && availableHeight
                    ? { maxHeight: availableHeight }
                    : undefined
            }
        >
            <div
                className={cn(
                    "flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-card/95",
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

                {/* Command content */}
                <div
                    className={cn(
                        "min-h-0",
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
                            hasHealingTargets={healingTargets.length > 0}
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