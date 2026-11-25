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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
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
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-card/80 px-3 py-2 sm:px-4">
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

            {/* CHARACTER DETAILS */}
            <Dialog
                open={!!inspectedFighter}
                onOpenChange={(open) => {
                    if (!open) onInspectCharacter(null);
                }}
            >
                <DialogContent
                    className=" !w-[96vw] !max-w-[96vw] lg:!max-w-[90rem] h-[88dvh] max-h-[88dvh] flex flex-col overflow-hidden gap-0 p-0 rounded-xl"
                >
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-3 sm:p-6 lg:p-8">
                        {inspectedFighter && (() => {
                            const fighter = inspectedFighter;
                            // const character = fighter.original;
                            // const stats = fighter.powerstats;

                            const hpPercent = fighter.maxHp > 0
                                ? (fighter.currentHp / fighter.maxHp) * 100
                                : 0;

                            const energyPercent = fighter.maxEnergy > 0
                                ? (fighter.energy / fighter.maxEnergy) * 100
                                : 0;

                            const activeEffects = fighter.status.filter(
                                effect => effect.duration > 0
                            );

                            const variant = fighter.side == "A" ? "default" : "secondary"
                            const colorVariant = fighter.side == "A" ? "primary" : "secondary"

                            const canRevive =
                                !fighter.hasRevived &&
                                fighter.powers.some(power => isItHealingPower(power.name));

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

                            return (
                                <div className="space-y-4 sm:space-y-6">
                                    {/* HEADER */}
                                    <div className="flex min-w-0 flex-col sm:flex-row gap-3 justify-center items-center  sm:gap-5">
                                        <div className="size-60 sm:size-60 shrink-0 overflow-hidden rounded-xl border bg-muted ">
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

                                        <div className="min-w-0 flex-1">
                                            <DialogTitle className="text-xl font-bold sm:text-2xl lg:text-3xl">
                                                {fighter.name}
                                            </DialogTitle>

                                            <p className="text-sm text-muted-foreground">
                                                Character ID: {fighter.id}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                                                <Badge variant={variant}>
                                                    {fighter.side == "A" ? state?.teamAName : state?.teamBName}
                                                </Badge>

                                                <Badge
                                                    variant={"outline"}
                                                >
                                                    {fighter.isAlive ? "Alive" : "KO"}
                                                </Badge>

                                                <Badge variant="outline">
                                                    {fighter.row.toUpperCase()} ROW
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* COMBAT VITALS */}
                                    <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-bold">
                                            <Activity className="size-4" />
                                            Combat Condition
                                        </h3>

                                        {/* HP */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Heart className={`size-4 text-${colorVariant}`} />
                                                    Health
                                                </span>

                                                <span className="font-bold tabular-nums">
                                                    {fighter.currentHp} / {fighter.maxHp}
                                                    {" "}({Math.round(hpPercent)}%)
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full bg-${colorVariant} transition-all`}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, hpPercent))}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* ENERGY */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Zap className={`size-4 text-${colorVariant}`} />
                                                    Energy
                                                </span>

                                                <span className="font-bold tabular-nums">
                                                    {fighter.energy} / {fighter.maxEnergy}
                                                    {" "}({Math.round(energyPercent)}%)
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full bg-${colorVariant} transition-all`}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, energyPercent))}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* FATIGUE */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Gauge className={`size-4 text-${colorVariant}`} />
                                                    Fatigue
                                                </span>

                                                <span className="font-bold tabular-nums">
                                                    {fighter.fatigue}%
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full bg-${colorVariant}`}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, fighter.fatigue))}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 text-sm sm:grid-cols-3 lg:gap-3">
                                            <div className="min-w-0 rounded-lg border p-2.5 sm:p-3">
                                                <p className="text-muted-foreground">Overall</p>
                                                <p className="text-xl font-bold">
                                                    {fighter.overall}
                                                </p>
                                            </div>

                                            <div className="min-w-0 rounded-lg border p-2.5 sm:p-3">
                                                <p className="text-muted-foreground">Has Revived</p>
                                                <p className="text-xl font-bold">
                                                    {fighter.hasRevived ? "Yes" : "No"}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border p-3">
                                                <p className="text-muted-foreground">Can Revive</p>
                                                <p className="text-xl font-bold">
                                                    {canRevive ? "Yes" : "No"}
                                                </p>
                                            </div>

                                            <div className="min-w-0 rounded-lg border p-2.5 sm:p-3">
                                                <p className="text-muted-foreground">Active Effects</p>
                                                <p className="text-xl font-bold">
                                                    {activeEffects.length}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* ACTIVE STATUS EFFECTS */}
                                    <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-bold">
                                            <Shield className="size-4" />
                                            Active Status Effects ({activeEffects.length})
                                        </h3>

                                        {activeEffects.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                                                {activeEffects.map((effect) => {
                                                    const source = effect.sourceId != null
                                                        ? state?.fighters.find(
                                                            fighter => fighter.id === effect.sourceId
                                                        )
                                                        : undefined;

                                                    return (
                                                        <div
                                                            key={effect.id}
                                                            className="min-w-0 rounded-lg border p-3"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <p className="font-semibold">
                                                                    {effect.name}
                                                                </p>

                                                                <Badge variant={variant}>
                                                                    {effect.duration} turns
                                                                </Badge>
                                                            </div>

                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDetailLabel(effect.type)}
                                                            </p>

                                                            <div className="mt-2 flex justify-between text-xs">
                                                                <span>
                                                                    Value: {effect.value}
                                                                </span>

                                                                <span>
                                                                    Source: {source?.name ?? (
                                                                        effect.sourceId != null
                                                                            ? `ID ${effect.sourceId}`
                                                                            : "Unknown"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No active status effects.
                                            </p>
                                        )}
                                    </section>


                                    {/* POWERSTATS */}
                                    {/* <Separator /> */}
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

                                    <Separator />

                                    {/* POWERS */}
                                    <section className="space-y-3">
                                        <h3 className="flex items-center gap-2 font-bold">
                                            <Sparkles className="size-4" />
                                            Powers & Abilities ({fighter.powers.length})
                                        </h3>

                                        {fighter.powers.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                                {fighter.powers.map((power) => {
                                                    const cooldown =
                                                        fighter.cooldowns[power.id] ?? 0;

                                                    return (
                                                        <div
                                                            key={power.id}
                                                            className="min-w-0 space-y-3 rounded-xl border p-3 sm:p-4"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <h4 className="font-bold">
                                                                        {power.name}
                                                                    </h4>

                                                                    <p className="text-xs text-muted-foreground">
                                                                        Power ID: {power.id}
                                                                    </p>
                                                                </div>

                                                                <Badge
                                                                    variant={cooldown > 0 ? "destructive" : variant}
                                                                >
                                                                    {cooldown > 0
                                                                        ? `${cooldown} Turn Cooldown`
                                                                        : "Ready"}
                                                                </Badge>
                                                            </div>

                                                            {power.description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {power.description}
                                                                </p>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                                                                {[
                                                                    ["Combat Role", power.combatRole],
                                                                    ["Activation", power.activationType],
                                                                    ["Range", power.range],
                                                                    ["Target Type", power.targetType],
                                                                    ["Tier", power.tier],
                                                                    ["Score", power.score],
                                                                    ["Duration", power.duration],
                                                                    // ["Stamina Cost", power.staminaCost],
                                                                ].map(([label, value]) => (
                                                                    <div
                                                                        key={label}
                                                                        className="rounded-md bg-muted/50 p-2"
                                                                    >
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {label}
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {formatDetailValue(value)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* POWER ACTIONS */}
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

                                                            {/* POWER STATUS EFFECTS */}
                                                            {power.statusEffects && power.statusEffects.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm font-semibold">
                                                                        Effects Applied
                                                                    </p>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        {power.statusEffects.map((effect, index) => (
                                                                            <Badge
                                                                                key={`${power.id}-effect-${index}`}
                                                                                variant={variant}
                                                                            >
                                                                                {formatDetailLabel(effect.type)}
                                                                                {" · "}
                                                                                {effect.duration} turns
                                                                                {" · "}
                                                                                {effect.value}%
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
                                            <p className="text-sm text-muted-foreground">
                                                No combat powers available.
                                            </p>
                                        )}
                                    </section>

                                    {/* ORIGINAL CHARACTER INFORMATION */}
                                    {/* <Separator /> */}
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

                                </div>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}