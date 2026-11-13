"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EnrichedFighter } from "@/lib/matchup/combat/adapters";
import Avatar from "./teamColumn/Avatar";

// ── Timing constants (must match ClashCard phase delays) ─────────────────────
// Phase 2 = 900ms → health bar drops
// Phase 3 = 1800ms → KO visual state applies
export const HEALTH_DROP_DELAY = 900;
export const KO_VISUAL_DELAY = 1800;

export default function TeamColumn({
    fighters, variant, mvp,
    activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
    eventKey, availablePlayerIds, isPlayerSide, isPlayerTurn, onSelectActor, selectedActorId,
    onSelectTarget, selectedTargetId, availableAIIds, isTargetSelectionActive, validTargetIds
}: {
    fighters: EnrichedFighter[];
    variant: "primary" | "secondary";
    mvp?: string;
    activeAttacker?: string;
    activeDefender?: string;
    latestKO?: string;
    latestHeal?: string;
    latestRevive?: string;
    latestDefend?: string;
    // A monotonically-increasing key that changes every time the step advances.
    // Used to reset the phase timers whenever a new combat event fires.
    eventKey?: number;

    // New selection props
    isPlayerSide?: boolean;               // true if this column is the player's team
    availablePlayerIds?: number[];              // state.availablePlayerIds
    availableAIIds?: number[];              // state.availablePlayerIds
    selectedActorId?: number | null;
    selectedTargetId?: number | null;
    onSelectActor?: (id: number) => void;
    isPlayerTurn?: boolean;

    onSelectTarget?: (id: number) => void;

    validTargetIds?: number[];
    isTargetSelectionActive?: boolean;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const avatarRefsMap = useRef(new Map());

    // ── Phase-delayed visibility of HP changes and KO state ──────────────────
    // `hpReady`  → true after HEALTH_DROP_DELAY (900ms), allows bars to animate
    // `koReady`  → true after KO_VISUAL_DELAY (1800ms), allows KO ring/skull/scale
    const [hpReady, setHpReady] = useState(false);
    const [koReady, setKoReady] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        // Clear any running timers from a previous event
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        // Reset both gates
        setHpReady(false);
        setKoReady(false);

        if (eventKey === undefined) return;

        const isHealReviveEvent = latestHeal !== undefined || latestRevive !== undefined;

        if (isHealReviveEvent) {
            // Heals / revives resolve faster — show HP change almost immediately
            timersRef.current.push(setTimeout(() => setHpReady(true), 400));
            timersRef.current.push(setTimeout(() => setKoReady(true), 600));
        } else {
            timersRef.current.push(setTimeout(() => setHpReady(true), HEALTH_DROP_DELAY));
            if (latestKO) {
                timersRef.current.push(setTimeout(() => setKoReady(true), KO_VISUAL_DELAY));
            }
        }

        return () => timersRef.current.forEach(clearTimeout);
    }, [eventKey]);

    const involvedNames = new Set(
        [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend].filter(Boolean)
    );

    // ── Scroll to involved fighter ────────────────────────────────────────────
    useEffect(() => {
        if (involvedNames.size > 0 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;

            for (const name of involvedNames) {
                if (!name) continue;
                const el = avatarRefsMap.current.get(name);
                if (el) {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();

                    const relativeTop = elRect.top - containerRect.top;
                    const relativeLeft = elRect.left - containerRect.left;

                    const targetScrollTop = container.scrollTop + relativeTop - (container.clientHeight / 2) + (elRect.height / 2);
                    const targetScrollLeft = container.scrollLeft + relativeLeft - (container.clientWidth / 2) + (elRect.width / 2);

                    container.scrollTo({
                        top: targetScrollTop,
                        left: targetScrollLeft,
                        behavior: "smooth"
                    });
                    break;
                }
            }
        }
    }, [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend]);

    return (
        <div className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0 overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="flex flex-wrap gap-1 sm:gap-3 justify-center max-h-[210px] md:max-h-none w-full py-6 overflow-y-auto md:overflow-y-visible overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
            >
                {fighters.map((f) => {
                    const isInvolved = involvedNames.has(f.name);
                    const maxHp = f.maxHp || 100;

                    // ── Phase-gated HP display ────────────────────────────────
                    // Before hpReady: show the "before this event" HP.
                    // When hpReady flips: CSS transition-all duration-700 animates the bar drop.
                    // For fighters NOT involved in the current event, show their real HP immediately.
                    const isDefenderThisEvent = activeDefender === f.name || latestKO === f.name || latestDefend === f.name;
                    const isHealTarget = latestHeal === f.name || latestRevive === f.name;
                    const holdHp = !hpReady && (isDefenderThisEvent || isHealTarget);

                    const realCurrentHp = f.isAlive ? (f.currentHp ?? maxHp) : 0;
                    // While holding, show the PRE-event HP so the bar doesn't jump then drop.
                    // f.prevHp is the HP before the latest log was applied.
                    const preEventHp = f.prevHp !== undefined ? f.prevHp : maxHp;
                    const displayHp = holdHp ? preEventHp : realCurrentHp;
                    const hpPercent = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));

                    const currentEnergy = f.energy ?? 0;
                    const maxEnergy = f.maxEnergy ?? 100;
                    const energyPercent = Math.max(0, Math.min(100, (currentEnergy / maxEnergy) * 100));

                    // ── Phase-gated KO visual ─────────────────────────────────
                    // latestKO fires immediately from CinematicCombatView; we delay showing
                    // the KO ring/skull/scale in Avatar until koReady (1800ms).
                    const isKO = (latestKO === f.name && koReady) || (!f.isAlive && latestKO !== f.name);

                    // 🌟 2. Determine if this fighter can be clicked as a target right now

                    const isValidTarget =
                        isTargetSelectionActive === true &&
                        validTargetIds?.includes(f.id);

                    const canSelectActor =
                        !isTargetSelectionActive &&
                        isPlayerSide &&
                        isPlayerTurn &&
                        availablePlayerIds?.includes(f.id);

                    const canSelectTarget = isValidTarget;

                    // console.log(f.name)
                    // console.log(!isPlayerSide)
                    // console.log(isPlayerTurn)
                    // console.log(f.isAlive)
                    // console.log(availableAIIds?.includes(f.id))

                    const isSelectedActor = selectedActorId === f.id;
                    const isSelectedTarget = selectedTargetId === f.id;
                    // console.log(f.name, f.id, "selectedTargetId", selectedTargetId, isSelectedTarget)
                    return (
                        <div
                            key={f.id}
                            ref={(node) => {
                                if (node) {
                                    avatarRefsMap.current.set(f.name, node);
                                } else {
                                    avatarRefsMap.current.delete(f.name);
                                }
                            }}
                            // className={cn(
                            //     "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
                            //     isInvolved ? "scale-105 z-10" : "scale-100 opacity-95"
                            // )}
                            onClick={() => {
                                if (canSelectTarget && onSelectTarget) {
                                    onSelectTarget(f.id);
                                } else if (canSelectActor && onSelectActor) {
                                    onSelectActor(f.id);
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
                                // isInvolved ? "scale-105 z-10" : "scale-100 opacity-95",
                                (canSelectTarget || canSelectActor) && "cursor-pointer hover:scale-105",
                                // isValidTarget &&
                                // "ring-2 ring-destructive ring-offset-2 ring-offset-background rounded-lg",
                                // isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg scale-105 z-20"
                                // isSelected && "ring-1 ring-primary ring-offset-2 ring-offset-background rounded-lg scale-105 z-20"
                                // isValidTarget && "ring-1 ring-secondary rounded-xl animate-pulse"
                            )}
                        // className={cn(
                        //     "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
                        //     (canSelectTarget || canSelectActor) && "cursor-pointer hover:scale-105",
                        //     isSelectedActor &&
                        //     "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg scale-105 z-20",
                        //     isSelectedTarget &&
                        //     "ring-2 ring-destructive ring-offset-2 ring-offset-background rounded-lg scale-105 z-20"
                        // )}
                        >
                            <Avatar
                                fighter={f}
                                size={48}
                                variant={variant}
                                isMvp={f.name === mvp}
                                isAttacking={activeAttacker === f.name}
                                isBeingHit={activeDefender === f.name}
                                isKO={isKO}
                                isHealing={latestHeal === f.name}
                                isReviving={latestRevive === f.name}
                                isDefending={latestDefend === f.name}
                                // isInvolved={isInvolved}
                                isInvolved={isSelectedActor || isSelectedTarget}
                            />

                            {/* Phase-synced health bar */}
                            <div className="w-[48px] flex flex-col gap-0.5">
                                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            hpPercent > 50
                                                ? (variant === "primary" ? "bg-primary" : "bg-secondary")
                                                : hpPercent > 20
                                                    ? "bg-yellow-400"
                                                    : "bg-red-500"
                                        )}
                                        style={{ width: `${hpPercent}%` }}
                                    />
                                </div>
                                <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none transition-all duration-700">
                                    {displayHp}/{maxHp} HP
                                </span>
                            </div>
                            <div className="w-[48px] flex flex-col gap-0.5">
                                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            (variant === "primary" ? "bg-primary" : "bg-secondary")

                                        )}
                                        style={{ width: `${energyPercent}%` }}
                                    />
                                </div>
                                <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none transition-all duration-700">
                                    {currentEnergy}/{maxEnergy} EN
                                </span>
                            </div>
                            {/* <div className="flex flex-col gap-0.5">
                                <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                                    <div
                                        className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                                        style={{ width: `${energyPercent}%` }}
                                    />
                                </div>
                                <span className="text-[7px] font-mono text-center text-cyan-400/90 leading-none">
                                    {currentEnergy} EN
                                </span>
                            </div> */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}