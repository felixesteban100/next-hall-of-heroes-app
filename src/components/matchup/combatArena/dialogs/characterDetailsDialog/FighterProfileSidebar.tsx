"use client";

import { Activity, Gauge, Heart, Shield, User, Zap } from "lucide-react";

import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { isItHealingPower } from "@/lib/matchup/combat/utils/isItHealingPower";
import { useCombatContext } from "../../context/CombatContext";
import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CharacterImage } from "@/components/shared/CharacterImage";
import {
    clampPercent,
    formatDetailLabel,
    getFighterTheme,
} from "./characterDetailsUtils";
import ScoreBadgeOnCard from "@/components/shared/ScoreBadgeOnCard";

export default function FighterProfileSidebar({
    fighter,
}: {
    fighter: CombatFighter;
}) {
    const { state } = useCombatContext();
    const { isTeamA, badgeVariant, accentClasses } = getFighterTheme(fighter);

    const hpPct = clampPercent(fighter.currentHp, fighter.maxHp);
    const energyPct = clampPercent(fighter.energy, fighter.maxEnergy);
    const fatiguePct = Math.min(100, Math.max(0, fighter.fatigue));
    const activeEffects = fighter.status.filter((e) => e.duration > 0);
    const canRevive =
        !fighter.hasRevived &&
        fighter.powers.some((p) => isItHealingPower(p.name));

    const vitals = [
        {
            label: "Health",
            value: `${fighter.currentHp} / ${fighter.maxHp} (${Math.round(hpPct)}%)`,
            pct: hpPct,
            Icon: Heart,
        },
        {
            label: "Energy",
            value: `${fighter.energy} / ${fighter.maxEnergy} (${Math.round(energyPct)}%)`,
            pct: energyPct,
            Icon: Zap,
        },
        {
            label: "Fatigue",
            value: `${fighter.fatigue}%`,
            pct: fatiguePct,
            Icon: Gauge,
        },
    ];

    const badges = [
        {
            label: isTeamA ? state?.teamAName : state?.teamBName,
            variant: badgeVariant,
        },
        { label: fighter.isAlive ? "Alive" : "KO", variant: "outline" as const },
        // { label: `${fighter.row.toUpperCase()} ROW`, variant: "outline" as const },
    ];

    const stats = [
        // ["Overall", fighter.overall],
        ["Has Revived", fighter.hasRevived ? "Yes" : "No"],
        ["Can Revive", canRevive ? "Yes" : "No"],
        // ["Active Effects", activeEffects.length],
    ] as const;

    return (
        <div className="min-w-0 space-y-5 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
            {/* HEADER */}
            <div className="flex min-w-0 flex-col items-center gap-3.5 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
                <div className="relative size-55 sm:size-36 shrink-0 overflow-visible rounded-xl border bg-muted ">
                    <ScoreBadgeOnCard
                        entity={fighter.original}
                        score={fighter.overall}
                        side="front"
                    />
                    {fighter.image ? (
                        <CharacterImage
                            src={fighter.image}
                            alt={fighter.name}
                            className="size-full object-cover rounded-xl"
                            imageFocus={fighter.imageFocus}
                        />
                    ) : (
                        <User className="size-full p-6 text-muted-foreground" />
                    )}

                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <DialogTitle className="truncate text-xl font-bold sm:text-2xl flex gap-2 items-center justify-center">
                        {fighter.name} <span className="text-xs font-medium bg-background text-foreground px-2 rounded-xl">#{fighter.id}</span>
                    </DialogTitle>

                    <div className="pt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                        {badges.map((b, i) => (
                            <Badge key={i} variant={b.variant}>
                                {b.label}
                            </Badge>
                        ))}
                        {stats.map(([label, val]) => (
                            <Badge
                                key={label}
                                variant="outline"
                                className="bg-accent text-accent-foreground"
                            >
                                {label}: <span className="font-bold">{val}</span>
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            {/* COMBAT VITALS */}
            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    <Activity className="size-4" />
                    Combat Condition
                </h3>
                {vitals.map(({ label, value, pct, Icon }) => (
                    <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="flex items-center gap-2 font-medium">
                                <Icon className={`size-4 shrink-0 ${accentClasses.icon}`} />
                                {label}
                            </span>
                            <span className="font-bold tabular-nums text-xs sm:text-sm">
                                {value}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${accentClasses.bar}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                ))}
            </section>

            <Separator />

            {/* ACTIVE STATUS EFFECTS */}
            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    <Shield className="size-4" />
                    Active Status Effects ({activeEffects.length})
                </h3>

                {activeEffects.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        No active status effects.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {activeEffects.map((effect) => {
                            const source =
                                effect.sourceId != null
                                    ? state?.fighters.find((f) => f.id === effect.sourceId)
                                    : undefined;
                            const sourceLabel =
                                source?.name ??
                                (effect.sourceId != null
                                    ? `ID ${effect.sourceId}`
                                    : "Unknown");

                            return (
                                <div
                                    key={effect.id}
                                    className="min-w-0 rounded-lg border p-2.5 sm:p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate font-semibold text-sm">
                                            {effect.name}
                                        </p>
                                        <Badge variant={badgeVariant} className="shrink-0">
                                            {effect.duration} duration
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDetailLabel(effect.type)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span>
                                            Value:{" "}
                                            <strong className="text-foreground">
                                                {effect.value}
                                            </strong>
                                        </span>
                                        <span className="truncate">
                                            Source:{" "}
                                            <strong className="text-foreground">
                                                {sourceLabel}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}