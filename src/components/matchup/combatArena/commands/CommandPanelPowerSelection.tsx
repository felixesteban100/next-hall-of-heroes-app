
"use client";

import { HeartPulse, Zap, ShieldAlert } from "lucide-react";
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
        <div className="flex min-h-0 flex-col gap-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Ability Selection
                    </p>
                    <h3 className="text-xs font-bold">Choose a power</h3>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    Back
                </button>
            </div>

            {/* Energy */}
            <div className="flex items-center justify-between rounded-md border border-white/5 bg-muted/20 px-2.5 py-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                    Available energy
                </span>

                <span className="flex items-center text-xs font-bold tabular-nums text-sky-400">
                    <Zap className="mr-1 size-3" />
                    {actor.energy}/{actor.maxEnergy}
                </span>
            </div>

            {/* Power list */}
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
                {availablePowers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/10 p-4 text-center">
                        <Zap className="mx-auto mb-1.5 size-5 text-muted-foreground/50" />
                        <p className="text-xs font-semibold">
                            No powers available
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            There are no powers to select.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {availablePowers.map((power) => {
                            const cost = getPowerCost(power);
                            const canAfford = actor.energy >= cost;
                            const cooldown = actor.cooldowns[power.id] ?? 0;
                            const isHeal = isHealingPower(power);
                            const isUtility = power.combatRole === "Utility";
                            const isDefensive = power.combatRole === "Defensive";

                            const hasStatusEffects =
                                (power.statusEffects?.length ?? 0) > 0;

                            const hasDefensiveTarget =
                                !isDefensive || getValidTargets(power).length > 0;

                            const missingUtilityEffects =
                                isUtility && !hasStatusEffects;

                            const disabled =
                                (!actor.isAlive && !isHeal) ||
                                (isHeal && !hasHealingTargets) ||
                                !hasDefensiveTarget ||
                                missingUtilityEffects ||
                                cooldown > 0 ||
                                !canAfford;

                            const roleConfig = combatRoleConfig[power.combatRole];
                            const RoleIcon = isHeal
                                ? HeartPulse
                                : roleConfig.Icon;

                            const statusEffects = power.statusEffects ?? [];

                            let disabledReason = "";

                            if (missingUtilityEffects) {
                                disabledReason = "No status effects configured";
                            } else if (!actor.isAlive && !isHeal) {
                                disabledReason = "Fighter is unable to act";
                            } else if (isHeal && !hasHealingTargets) {
                                disabledReason = "No valid healing targets";
                            } else if (!hasDefensiveTarget) {
                                disabledReason = "No valid defensive targets";
                            } else if (cooldown > 0) {
                                disabledReason = `Cooldown: ${cooldown} turns`;
                            } else if (!canAfford) {
                                disabledReason = "Not enough energy";
                            }

                            return (
                                <button
                                    key={power.id}
                                    type="button"
                                    disabled={disabled}
                                    title={disabled ? disabledReason : power.description}
                                    onClick={() => onSelectPower(power)}
                                    className={cn(
                                        "group relative flex min-w-0 shrink-0 items-center gap-2.5 overflow-hidden rounded-lg border px-2.5 py-2 text-left transition-all duration-200",
                                        disabled
                                            ? "cursor-not-allowed border-white/5 bg-muted/10 opacity-45"
                                            : "border-white/10 bg-muted/30 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
                                    )}
                                >
                                    {/* Role icon */}
                                    <div
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                                            isHeal
                                                ? combatRoleConfig.Utility.className
                                                : roleConfig.className
                                        )}
                                    >
                                        <RoleIcon className="size-4" />
                                    </div>

                                    {/* Power details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <span className="truncate text-[11px] font-bold">
                                                {power.name}
                                            </span>

                                            {cooldown > 0 && (
                                                <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-400">
                                                    CD {cooldown}
                                                </span>
                                            )}

                                            {missingUtilityEffects && (
                                                <span className="shrink-0 rounded bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold text-rose-400">
                                                    Unavailable
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-muted-foreground">
                                            {hasStatusEffects ? (
                                                statusEffects.map((effect, index) => (
                                                    <span
                                                        key={`${effect.type}-${index}`}
                                                        className="capitalize"
                                                    >
                                                        {effect.type.replaceAll("_", " ")}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>
                                                    {missingUtilityEffects
                                                        ? "No status effects"
                                                        : power.combatRole}
                                                </span>
                                            )}

                                            <span className="text-muted-foreground/40">·</span>
                                            <span>T-{power.tier ?? 1}</span>

                                            <span className="text-muted-foreground/40">·</span>
                                            <span>
                                                {power.targetType ?? "Single Target"}
                                            </span>
                                        </div>

                                        {missingUtilityEffects && (
                                            <p className="mt-1 text-[9px] font-medium text-rose-400/80">
                                                This Utility power has no effects to apply.
                                            </p>
                                        )}

                                        {!missingUtilityEffects && disabledReason && (
                                            <p className="mt-1 text-[9px] text-amber-400/80">
                                                {disabledReason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Energy cost */}
                                    <div className="shrink-0 text-right">
                                        <div
                                            className={cn(
                                                "text-xs font-black tabular-nums",
                                                canAfford
                                                    ? "text-sky-400"
                                                    : "text-rose-400"
                                            )}
                                        >
                                            {cost}
                                        </div>
                                        <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            EN
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
