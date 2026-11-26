"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    LogsIcon,
    SkipForward,
} from "lucide-react";

import {
    Activity,
    Heart,
    Zap,
    Shield,
    Swords,
    User,
    BookOpen,
    Sparkles,
    Clock,
    Gauge,
    Info,
} from "lucide-react";

import type {
    CombatFighter,
    CombatEvent,
    Side,
} from "@/lib/matchup/combat/types/types";

import type {
    CharacterWithJoinTeamUniversePowerEnemies,
} from "@/types";

import TeamColumn from "./team/TeamColumn";
import ClashCard from "./clash/ClashCard";
import { useCombatDialog } from "./hooks/useCombatDialog";
import { useCombatPresentation } from "./hooks/useCombatPresentation";
import CombatFeed from "./feed/CombatFeed";
import { useCombatContext } from "./context/CombatContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { isItHealingPower } from "@/lib/matchup/combat/utils/isItHealingPower";



function formatDetailLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDetailValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "Not available";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

type Props = {
    fightersA: CombatFighter[];
    fightersB: CombatFighter[];
    events: CombatEvent[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    playerSide: "A" | "B";
    previousHpById: Record<number, number>;
    battleStarted: boolean;
    onStartBattle: (firstSide: Side) => void;
    onSkipPresentation: () => void;
    animationSpeed: 1 | 2;
    onAnimationSpeedChange: (speed: 1 | 2) => void;
};

export default function CinematicCombatView({ fightersA, fightersB, events, teamAChars, teamBChars, playerSide, previousHpById, battleStarted, onStartBattle, onSkipPresentation, animationSpeed, onAnimationSpeedChange }: Props) {
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<{ a: number; b: number; winner: Side; } | null>(null);
    const [skipSignal, setSkipSignal] = useState(0);

    const { state, inspectedCharacterId, onInspectCharacter } = useCombatContext();

    const inspectedFighter =
        state?.fighters.find((fighter) => fighter.id === inspectedCharacterId) ?? null;

    const handleSkip = () => {
        setSkipSignal((previous) => previous + 1);
        onSkipPresentation();
    };
    const diceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (diceTimerRef.current) {
                clearTimeout(diceTimerRef.current);
            }
        };
    }, []);

    const handleStartClick = () => {
        if (isRolling || battleStarted) return;

        setIsRolling(true);
        setDiceResult(null);

        let diceA = 0;
        let diceB = 0;

        // Reroll automatically if both dice tie.
        do {
            diceA = Math.floor(Math.random() * 6) + 1;
            diceB = Math.floor(Math.random() * 6) + 1;
        } while (diceA === diceB);

        const winner: Side = diceA > diceB ? "A" : "B";

        diceTimerRef.current = setTimeout(() => {
            setDiceResult({
                a: diceA,
                b: diceB,
                winner,
            });

            setIsRolling(false);
            onStartBattle(winner);
        }, 1300);
    };

    const { enrichedA, enrichedB, visibleLogs, allChars, currentActionEvent, } = useCombatPresentation({ fightersA, fightersB, events, teamAChars, teamBChars, previousHpById, });

    const eventKey = currentActionEvent?.id;

    const { dialogEvent, hasImpacted, eventPosition, totalEvents, canGoPrevious, canGoNext, isViewingLatest, handleImpact, handleClose, handleOpen, handlePrevious, handleNext, handleGoToLatest, } = useCombatDialog(currentActionEvent, playerSide);

    const isDialogOpen = dialogEvent !== null;

    const teamColumnProps = {
        actionEvent: currentActionEvent ?? undefined,
        eventKey,
        hasImpacted,
        isDialogOpen,
    };

    return (
        <div className="flex w-full max-w-full flex-col space-y-3 overflow-hidden p-1">
            <div className="flex h-[400px] w-full">
                <TeamColumn
                    fighters={enrichedA}
                    variant="primary"
                    isPlayerSide={playerSide === "A"}
                    {...teamColumnProps}
                />

                <Separator orientation="vertical" className="w-3 text-white" />

                <TeamColumn
                    fighters={enrichedB}
                    variant="secondary"
                    isPlayerSide={playerSide === "B"}
                    {...teamColumnProps}
                />
            </div>

            <CombatFeed logs={visibleLogs} />

            {/* Reserve a fixed height so dice, start button, and history button never resize the layout */}
            <div className="relative flex h-12  w-full shrink-0 items-center justify-center overflow-visible">
                {!battleStarted ? (
                    <AnimatePresence mode="wait">
                        {isRolling ? (
                            <motion.div
                                key="rolling"
                                className="flex items-center justify-center gap-x-8"
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <motion.div
                                    className="text-5xl leading-none"
                                    animate={{ rotate: [0, 180, 360, 540, 720] }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>

                                <motion.div
                                    className="text-5xl leading-none"
                                    animate={{ rotate: [0, -180, -360, -540, -720] }}
                                    transition={{
                                        duration: 1.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    🎲
                                </motion.div>
                            </motion.div>
                        ) : !diceResult ? (
                            <motion.div
                                key="start-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Button
                                    style={{ width: 230 }}
                                    className="mx-auto animate-bounce"
                                    onClick={handleStartClick}
                                >
                                    🎲 Start Battle
                                </Button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                ) : (
                    <Button
                        style={{ width: 230 }}
                        className="mx-auto"
                        onClick={handleOpen}
                    >
                        <LogsIcon /> View Combat History
                    </Button>
                )}
            </div>

            {/* COMBAT HISTORY */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="flex max-w-none! flex-col gap-0 overflow-hidden rounded-xl border border-white/10 bg-background p-0 shadow-2xl outline-none sm:rounded-2xl"
                    style={{
                        width: "min(calc(90vw - 16px), 900px)",
                        height: "min(calc(70dvh - 16px), 800px)",
                    }}
                >
                    <DialogTitle className="sr-only">Combat History</DialogTitle>
                    <DialogDescription className="sr-only">
                        Browse the events from this battle using the previous and next controls.
                    </DialogDescription>

                    {/* Event Navigation */}
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-foreground bg-card/80 px-3 py-2 sm:px-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canGoPrevious}
                            onClick={handlePrevious}
                            className="h-8 gap-1 px-2 text-xs"
                        >
                            <ChevronLeft className="size-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <div className="flex min-w-0 flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Combat History
                            </span>
                            <span className="text-xs font-bold tabular-nums">
                                Event {eventPosition} of {totalEvents}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onAnimationSpeedChange(animationSpeed === 1 ? 2 : 1)
                                }
                                className="h-8 min-w-12 px-2 text-xs"
                                title="Toggle animation speed"
                            >
                                {animationSpeed}×
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!isViewingLatest}
                                onClick={handleSkip}
                                className="h-8 gap-1 px-2 text-xs"
                                title="Skip current animation"
                            >
                                <SkipForward className="size-3.5" />
                                <span className="hidden sm:inline">Skip</span>
                            </Button>

                            {!isViewingLatest && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGoToLatest}
                                    className="h-8 gap-1 px-2 text-xs"
                                    title="Go to latest event"
                                >
                                    <SkipForward className="size-3.5" />
                                    <span className="hidden sm:inline">Latest</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!canGoNext}
                                onClick={handleNext}
                                className="h-8 gap-1 px-2 text-xs"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Event Content */}
                    <div className="min-h-0 w-full flex-1 overflow-hidden">
                        {dialogEvent && (
                            <ClashCard
                                event={dialogEvent}
                                fighters={[...enrichedA, ...enrichedB]}
                                allChars={allChars}
                                teamAChars={teamAChars}
                                playerSide={playerSide}
                                onImpact={handleImpact}
                                animationSpeed={animationSpeed}
                                skipSignal={skipSignal}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* CHARACTER DETAILS */}
            <Dialog
                open={!!inspectedFighter}
                onOpenChange={(open) => {
                    if (!open) onInspectCharacter(null);
                }}
            >
                <DialogContent className="!w-[90vw] !max-w-[90vw] lg:!max-w-[90rem] h-[70dvh] max-h-[70dvh] flex flex-col overflow-hidden gap-0 p-0 rounded-xl border border-foreground/10">
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-3 sm:p-6 lg:p-7">
                        {inspectedFighter && (() => {
                            const fighter = inspectedFighter;

                            const hpPercent = fighter.maxHp > 0
                                ? Math.min(100, Math.max(0, (fighter.currentHp / fighter.maxHp) * 100))
                                : 0;

                            const energyPercent = fighter.maxEnergy > 0
                                ? Math.min(100, Math.max(0, (fighter.energy / fighter.maxEnergy) * 100))
                                : 0;

                            const fatiguePercent = Math.min(100, Math.max(0, fighter.fatigue));

                            const activeEffects = fighter.status.filter(
                                (effect) => effect.duration > 0
                            );

                            const isTeamA = fighter.side === "A";
                            const badgeVariant = isTeamA ? "default" : "secondary";
                            const accentClasses = isTeamA
                                ? { icon: "text-primary", bar: "bg-primary" }
                                : { icon: "text-secondary-foreground", bar: "bg-secondary" };

                            const canRevive =
                                !fighter.hasRevived &&
                                fighter.powers.some((power) => isItHealingPower(power.name));

                            const vitals = [
                                {
                                    label: "Health",
                                    value: `${fighter.currentHp} / ${fighter.maxHp} (${Math.round(hpPercent)}%)`,
                                    percent: hpPercent,
                                    Icon: Heart,
                                },
                                {
                                    label: "Energy",
                                    value: `${fighter.energy} / ${fighter.maxEnergy} (${Math.round(energyPercent)}%)`,
                                    percent: energyPercent,
                                    Icon: Zap,
                                },
                                {
                                    label: "Fatigue",
                                    value: `${fighter.fatigue}%`,
                                    percent: fatiguePercent,
                                    Icon: Gauge,
                                },
                            ];

                            const summaryStats = [
                                { label: "Overall", value: fighter.overall },
                                { label: "Has Revived", value: fighter.hasRevived ? "Yes" : "No" },
                                { label: "Can Revive", value: canRevive ? "Yes" : "No" },
                                { label: "Active Effects", value: activeEffects.length },
                            ];

                            return (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                                    {/* LEFT COLUMN: IDENTITY, VITALS & ACTIVE EFFECTS */}
                                    <div className="min-w-0 space-y-5 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
                                        {/* HEADER */}
                                        <div className="flex min-w-0 flex-col items-center gap-3.5 text-center sm:flex-row sm:items-center sm:justify-start sm:gap-4 sm:text-left">
                                            <div className="size-32 sm:size-36 shrink-0 overflow-hidden rounded-xl border bg-muted">
                                                {fighter.image ? (
                                                    <CharacterImage
                                                        src={fighter.image}
                                                        alt={fighter.name}
                                                        className="size-full object-cover"
                                                        imageFocus={fighter.imageFocus}
                                                    />
                                                ) : (
                                                    <User className="size-full p-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <DialogTitle className="truncate text-xl font-bold sm:text-2xl">
                                                    {fighter.name}
                                                </DialogTitle>

                                                <p className="text-xs text-muted-foreground">
                                                    Character ID: {fighter.id}
                                                </p>

                                                <div className="pt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                                                    <Badge variant={badgeVariant}>
                                                        {isTeamA ? state?.teamAName : state?.teamBName}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {fighter.isAlive ? "Alive" : "KO"}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {fighter.row.toUpperCase()} ROW
                                                    </Badge>
                                                    {summaryStats.map((stat) => (
                                                        <Badge variant="outline" className="bg-accent text-accent-foreground">
                                                            {stat.label}: <span className="font-bold">{stat.value}</span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* COMBAT VITALS */}
                                        <section className="space-y-3.5">
                                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                                <Activity className="size-4" />
                                                Combat Condition
                                            </h3>

                                            <div className="space-y-3">
                                                {vitals.map(({ label, value, percent, Icon }) => (
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
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4 lg:grid-cols-2">
                                                {summaryStats.map((stat) => (
                                                    <div
                                                        key={stat.label}
                                                        className="min-w-0 rounded-lg border bg-card p-2.5"
                                                    >
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {stat.label}
                                                        </p>
                                                        <p className="mt-0.5 text-lg font-bold tabular-nums">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div> */}
                                        </section>

                                        <Separator />

                                        {/* ACTIVE STATUS EFFECTS */}
                                        <section className="space-y-3">
                                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                                <Shield className="size-4" />
                                                Active Status Effects ({activeEffects.length})
                                            </h3>

                                            {activeEffects.length > 0 ? (
                                                <div className="space-y-2">
                                                    {activeEffects.map((effect) => {
                                                        const source = effect.sourceId != null
                                                            ? state?.fighters.find((f) => f.id === effect.sourceId)
                                                            : undefined;

                                                        return (
                                                            <div
                                                                key={effect.id}
                                                                className="min-w-0 rounded-lg border p-2.5 sm:p-3"
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="truncate font-semibold text-sm">
                                                                        {effect.name}
                                                                    </p>
                                                                    {/* this is needs more explanation because some effects get added twice and also have the duration as twice */}
                                                                    <Badge variant={badgeVariant} className="shrink-0">
                                                                        {effect.duration} duration
                                                                    </Badge>
                                                                </div>

                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDetailLabel(effect.type)}
                                                                </p>

                                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                                                    <span>Value: <strong className="text-foreground">{effect.value}</strong></span>
                                                                    <span className="truncate">
                                                                        Source:{" "}
                                                                        <strong className="text-foreground">
                                                                            {source?.name ?? (
                                                                                effect.sourceId != null
                                                                                    ? `ID ${effect.sourceId}`
                                                                                    : "Unknown"
                                                                            )}
                                                                        </strong>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                                    No active status effects.
                                                </p>
                                            )}
                                        </section>
                                    </div>

                                    {/* RIGHT COLUMN: POWERS & ABILITIES */}
                                    <section className="min-w-0 space-y-3 lg:col-span-7 xl:col-span-8">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                                <Sparkles className="size-4" />
                                                Powers & Abilities ({fighter.powers.length})
                                            </h3>
                                        </div>

                                        {fighter.powers.length > 0 ? (
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
                                                    ];

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
                                        ) : (
                                            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                                No combat powers available.
                                            </p>
                                        )}
                                    </section>
                                </div>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}


// const character = fighter.original;
// const stats = fighter.powerstats;

// const originalEntries = Object.entries(character).filter(
//     ([key]) => ![
//         "powerstats",
//         "powers",
//         "id",
//         "name",
//         "images",
//     ].includes(key)
// );

// const statEntries = stats
//     ? Object.entries(stats)
//     : [];



{/* POWERSTATS */ }
{/* <Separator /> */ }
{/* <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-bold">
                                            <Swords className="size-4" />
                                            Powerstats
                                        </h3>

                                        {statEntries.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                                {statEntries.map(([key, value]) => {
                                                    const numericValue =
                                                        typeof value === "number" ? value : null;

                                                    return (
                                                        <div
                                                            key={key}
                                                            className="min-w-0 rounded-lg border p-2.5 sm:p-3"
                                                        >
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDetailLabel(key)}
                                                            </p>

                                                            <p className="text-xl font-bold tabular-nums">
                                                                {formatDetailValue(value)}
                                                            </p>

                                                            {numericValue !== null && (
                                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                                                    <div
                                                                        className="h-full rounded-full bg-primary"
                                                                        style={{
                                                                            width: `${Math.min(100, Math.max(0, numericValue))}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No powerstats available.
                                            </p>
                                        )}
                                    </section> */}

{/* POWER ACTIONS */ }
{/* {power.actions && power.actions.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm font-semibold">
                                                                        Available Actions
                                                                    </p>

                                                                    {power.actions.map((action, index) => (
                                                                        <div
                                                                            key={`${power.id}-action-${index}`}
                                                                            className="rounded-lg border p-3"
                                                                        >
                                                                            <p className="text-sm font-medium">
                                                                                {action.name}
                                                                            </p>

                                                                            {action.description && (
                                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                                    {action.description}
                                                                                </p>
                                                                            )}

                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                {action.activationType && (
                                                                                    <Badge variant="outline">
                                                                                        {action.activationType}
                                                                                    </Badge>
                                                                                )}

                                                                                {action.range && (
                                                                                    <Badge variant="outline">
                                                                                        {action.range}
                                                                                    </Badge>
                                                                                )}

                                                                                {action.targetType && (
                                                                                    <Badge variant="outline">
                                                                                        {action.targetType}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )} */}


{/* ORIGINAL CHARACTER INFORMATION */ }
{/* <Separator /> */ }
{/* <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-bold">
                                            <BookOpen className="size-4" />
                                            Character Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {originalEntries.map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="min-w-0 rounded-lg border p-3"
                                                >
                                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {formatDetailLabel(key)}
                                                    </p>

                                                    {typeof value === "object" && value !== null ? (
                                                        <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs">
                                                            {formatDetailValue(value)}
                                                        </pre>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap break-words text-sm">
                                                            {formatDetailValue(value)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section> */}