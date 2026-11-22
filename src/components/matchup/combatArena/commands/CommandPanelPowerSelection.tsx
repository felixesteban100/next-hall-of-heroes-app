"use client";

import { HeartPulse, Zap } from "lucide-react";
import type { Power, PowerRole } from "@/types";
import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { combatRoleConfig } from "@/lib/matchup/combat/utils/combatRole";
import { cn } from "@/lib/utils";

type Props = {
    actor: CombatFighter;
    availablePowers: Power[];
    compact: boolean;
    availableHeight?: number;
    hasHealingTargets: boolean;
    getPowerCost: (power: Power) => number;
    isHealingPower: (power: Power | null) => boolean;
    getValidTargets: (
        power: Power | null,
        role?: PowerRole | null
    ) => CombatFighter[];
    onSelectPower: (power: Power) => void;
    onBack: () => void;
};

export function CommandPanelPowerSelection({
    actor,
    availablePowers,
    compact,
    availableHeight,
    hasHealingTargets,
    getPowerCost,
    isHealingPower,
    getValidTargets,
    onSelectPower,
    onBack,
}: Props) {
    return (
        <div className="flex min-h-0 flex-col">
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
                    onClick={onBack}
                    className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    Back
                </button>
            </div>

            {/* Energy */}
            <div className="flex items-center justify-between px-2 py-1">
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
                data-command-panel-scroll
                className="hide-scrollbar min-h-0 overflow-y-auto overflow-x-hidden"
                style={{
                    maxHeight: compact
                        ? `max(0px, ${availableHeight ?? 400}px - 110px)`
                        : 260,
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
                            const hasHealingTarget = hasHealingTargets;

                            const isDefensive = power.combatRole === "Defensive";
                            const hasDefensiveTarget =
                                getValidTargets(power).length > 0;

                            const disabled =
                                (!actor.isAlive && !isHeal) ||
                                (isHeal && !hasHealingTarget) ||
                                (isDefensive && !hasDefensiveTarget) ||
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
                                    onClick={() => onSelectPower(power)}
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
                                            {power.statusEffects && power.statusEffects.length > 0 ? (
                                                power.statusEffects.map((effect) => (
                                                    <span
                                                        key={`${effect.type}-${effect.duration}-${effect.value}`}
                                                    >
                                                        {effect.type}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>{power.combatRole}</span>
                                            )}
                                            <span>·</span>
                                            <span>T-{power.tier ?? 1}</span>
                                            <span>·</span>
                                            <span>Target {power.targetType ?? "Single Target"}</span>
                                            <span>·</span>
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
    );
}
