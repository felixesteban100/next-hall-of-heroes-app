"use client";

import type { Power, PowerRole } from "@/types";
import type { TargetMode } from "../context/CombatContext";
import { cn } from "@/lib/utils";

type Props = {
    targetMode: TargetMode | null;
    selectedPower: Power | null;
    chosenRole: PowerRole | null;
    isProtecting: boolean;
    targetingChoice: "single" | "multiple";
    targetDescription: string;
    isUtilityPower: (
        power: Power | null,
        role?: PowerRole | null
    ) => boolean;
    isHealingPower: (power: Power | null) => boolean;
    onTargetingChoiceChange: (choice: "single" | "multiple") => void;
    onBack: () => void;
};

export function CommandPanelTargetSelection({
    targetMode,
    selectedPower,
    chosenRole,
    isProtecting,
    targetingChoice,
    targetDescription,
    isUtilityPower,
    isHealingPower,
    onTargetingChoiceChange,
    onBack,
}: Props) {
    const supportsSingleOrAoE = selectedPower?.targetType === "Single Target / AoE";

    const targetInstruction = isProtecting
        ? "Choose an ally to protect"
        : isUtilityPower(selectedPower, chosenRole) ||
            chosenRole === "Defensive" ||
            selectedPower?.combatRole === "Defensive" ||
            isHealingPower(selectedPower)
            ? "Select an ally"
            : "Select an enemy";

    const selectedTargetCount = targetMode?.selectedIds?.length ?? 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground">Target selection</p>
                    <h3 className="truncate text-xs font-semibold">
                        {isProtecting
                            ? "Protect an ally"
                            : selectedPower?.name ?? "Basic Attack"}
                    </h3>
                </div>

                {supportsSingleOrAoE && (
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => onTargetingChoiceChange("single")}
                            className={cn(
                                "rounded-md border px-2 py-1.5 text-[10px] font-bold transition",
                                targetingChoice === "single"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-white/10 bg-muted/20 text-muted-foreground"
                            )}
                        >
                            Single Target
                        </button>

                        <button
                            type="button"
                            onClick={() => onTargetingChoiceChange("multiple")}
                            className={cn(
                                "rounded-md border px-2 py-1.5 text-[10px] font-bold transition",
                                targetingChoice === "multiple"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-white/10 bg-muted/20 text-muted-foreground"
                            )}
                        >
                            Multiple Targets
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onBack}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                    Back
                </button>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                <div className="min-w-0">
                    <p className="text-xs font-medium">{targetInstruction}</p>
                    <p className="text-[10px] text-muted-foreground">{targetDescription}</p>
                </div>
            </div>

            {chosenRole && (
                <p className="text-[9px] text-center text-muted-foreground">
                    {chosenRole} ability
                </p>
            )}

            {supportsSingleOrAoE && targetingChoice === "multiple" && (
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">
                        {selectedTargetCount} targets selected
                    </span>

                    <button
                        type="button"
                        disabled={selectedTargetCount === 0}
                        onClick={() =>
                            targetMode?.onConfirmMultiple?.(targetMode.selectedIds ?? [])
                        }
                        className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Confirm targets
                    </button>
                </div>
            )}
        </div>
    );
}
