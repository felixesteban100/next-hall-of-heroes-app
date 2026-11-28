"use client";

import { Sparkles } from "lucide-react";

import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { Badge } from "@/components/ui/badge";
import {
    formatDetailLabel,
    formatDetailValue,
    getFighterTheme,
} from "./characterDetailsUtils";

export default function FighterPowersGrid({
    fighter,
}: {
    fighter: CombatFighter;
}) {
    const { badgeVariant } = getFighterTheme(fighter);

    return (
        <section className="min-w-0 space-y-3 lg:col-span-7 xl:col-span-8">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-4" />
                Powers & Abilities ({fighter.powers.length})
            </h3>

            {fighter.powers.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No combat powers available.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {fighter.powers.map((power) => {
                        const cooldown = fighter.cooldowns[power.id] ?? 0;
                        const specs = [
                            ["Role", power.combatRole],
                            ["Activation", power.activationType],
                            ["Range", power.range],
                            ["Target", power.targetType],
                            ["Tier", power.tier],
                            ["Score", power.score],
                            ["Duration", power.duration],
                        ] as const;

                        return (
                            <div
                                key={power.id}
                                className="flex min-w-0 flex-col justify-between space-y-3 rounded-xl border bg-card p-3.5 sm:p-4"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="truncate font-bold">
                                                {power.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Power ID: {power.id}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={cooldown > 0 ? "destructive" : badgeVariant}
                                            className="shrink-0"
                                        >
                                            {cooldown > 0
                                                ? `${cooldown} Turn CD`
                                                : "Ready"}
                                        </Badge>
                                    </div>

                                    {power.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            {power.description}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-3">
                                        {specs.map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="min-w-0 rounded-md bg-muted/60 px-2 py-1.5"
                                            >
                                                <p className="truncate text-[11px] text-muted-foreground">
                                                    {label}
                                                </p>
                                                <p className="truncate text-xs font-semibold">
                                                    {formatDetailValue(value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {power.statusEffects && power.statusEffects.length > 0 && (
                                    <div className="space-y-1.5 border-t pt-2.5">
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            Effects Applied
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {power.statusEffects.map((effect, index) => (
                                                <Badge
                                                    key={`${power.id}-effect-${index}`}
                                                    variant={badgeVariant}
                                                    className="text-xs"
                                                >
                                                    {formatDetailLabel(effect.type)} · {effect.duration}t · {effect.value}%
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}