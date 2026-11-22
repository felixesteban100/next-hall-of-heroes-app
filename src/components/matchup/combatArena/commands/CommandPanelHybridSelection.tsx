"use client";

import { Key, Lock, Shield, Swords } from "lucide-react";
import type { Power, PowerRole } from "@/types";
import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { cn } from "@/lib/utils";

type Props = {
    selectedPower: Power;
    getValidTargets: (
        power: Power | null,
        role?: PowerRole | null
    ) => CombatFighter[];
    onChooseRole: (role: PowerRole) => void;
    onBack: () => void;
};

export function CommandPanelHybridSelection({
    selectedPower,
    getValidTargets,
    onChooseRole,
    onBack,
}: Props) {
    const hasDefensiveTargets =
        getValidTargets(selectedPower, "Defensive").length > 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground">
                        Choose combat style
                    </p>
                    <h3 className="truncate text-xs font-semibold">
                        {selectedPower.name}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                    Back
                </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
                <button
                    type="button"
                    onClick={() => onChooseRole("Offensive")}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-2 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                >
                    <Swords className="size-3.5" />
                    Offensive
                </button>

                <button
                    type="button"
                    onClick={() => onChooseRole("Defensive")}
                    disabled={!hasDefensiveTargets}
                    className={cn(
                        "flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10",
                        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cyan-500/5"
                    )}
                >
                    <Shield className="size-3.5" />
                    Defensive
                </button>

                <button
                    type="button"
                    onClick={() => onChooseRole("Control")}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-purple-500/20 bg-purple-500/5 px-2 py-2 text-xs font-medium text-purple-400 transition hover:bg-purple-500/10"
                >
                    <Lock className="size-3.5" />
                    Control
                </button>

                <button
                    type="button"
                    onClick={() => onChooseRole("Utility")}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/5 px-2 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/10"
                >
                    <Key className="size-3.5" />
                    Utility
                </button>
            </div>
        </div>
    );
}
