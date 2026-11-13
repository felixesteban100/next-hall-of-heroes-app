"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ActionEvent, EnrichedFighter } from "@/lib/matchup/combat/adapters";
import Avatar from "./teamColumn/Avatar";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// ── Timing constants (must match ClashCard phase delays) ─────────────────────
// Phase 2 = 900ms → health bar drops
// Phase 3 = 1800ms → KO visual state applies
export const HEALTH_DROP_DELAY = 5000;
export const KO_VISUAL_DELAY = 1800;

export default function TeamColumn({
    fighters, variant, mvp, onDeselectActor,
    eventKey, availablePlayerIds, isPlayerSide, isPlayerTurn, onSelectActor, selectedActorId,
    onSelectTarget, selectedTargetId, availableAIIds, isTargetSelectionActive, validTargetIds, actionEvent, renderCommandPanel, hasImpacted
}: {
    fighters: EnrichedFighter[];
    variant: "primary" | "secondary";
    mvp?: string;
    actionEvent?: ActionEvent;
    eventKey?: number;
    isPlayerSide?: boolean;
    availablePlayerIds?: number[];
    availableAIIds?: number[];
    selectedActorId?: number | null;
    selectedTargetId?: number | null;
    onSelectActor?: (id: number) => void;
    isPlayerTurn?: boolean;
    onSelectTarget?: (id: number) => void;
    validTargetIds?: number[];
    isTargetSelectionActive?: boolean;
    renderCommandPanel?: (onClose: () => void) => ReactNode;
    onDeselectActor: () => void;
    hasImpacted?: boolean;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const avatarRefsMap = useRef(new Map<number, HTMLDivElement>());

    // ── Phase-delayed visibility of HP changes and KO state ──────────────────
    // `hpReady`  → true after HEALTH_DROP_DELAY (900ms), allows bars to animate
    // `koReady`  → true after KO_VISUAL_DELAY (1800ms), allows KO ring/skull/scale
    const [hpReady, setHpReady] = useState(false);
    const [koReady, setKoReady] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const [openCommandActorId, setOpenCommandActorId] =
        useState<number | null>(null);

    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const programmaticScrollRef = useRef(false);
    const scrollResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const event = actionEvent;

    const attackerId = actionEvent?.attacker?.id;

    const targetIds = actionEvent?.targets?.map(
        (target) => target.id
    ) ?? (actionEvent?.defender ? [actionEvent.defender.id] : []);

    const involvedIds = new Set(
        [attackerId, ...targetIds].filter(
            (id): id is number => id !== undefined
        )
    );

    const activeAttacker = event?.attacker?.name;
    const activeDefender = event?.defender?.name;

    const eventType = event?.log.type;

    const eventTargetId = targetIds[0] ?? attackerId;

    const latestKO =
        eventType === "ko" || event?.log.isKO
            ? eventTargetId
            : undefined;

    const latestHeal =
        eventType === "heal"
            ? eventTargetId
            : undefined;

    const latestRevive =
        eventType === "revive"
            ? eventTargetId
            : undefined;

    const latestDefend =
        eventType === "defend"
            ? eventTargetId
            : undefined;


    // const involvedNames = new Set(
    //     [
    //         activeAttacker,
    //         activeDefender,
    //         latestKO,
    //         latestHeal,
    //         latestRevive,
    //         latestDefend,
    //     ].filter((name): name is string => Boolean(name))
    // );

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setHpReady(false);
        setKoReady(false);

        if (eventKey === undefined) return;

        const isHealReviveEvent =
            latestHeal !== undefined || latestRevive !== undefined;

        const isAnimatedAttack =
            eventType === "attack" ||
            eventType === "power" ||
            eventType === "ko" ||
            eventType === "battle_end" ||
            // eventType === "rout" ||
            (eventType === "defend" && !!event?.log.defenderName);

        if (isHealReviveEvent) {
            timersRef.current.push(setTimeout(() => setHpReady(true), 400));
            timersRef.current.push(setTimeout(() => setKoReady(true), 600));
        } else {
            // Attack events wait for ClashCard's actual impact signal.
            if (!isAnimatedAttack) {
                timersRef.current.push(
                    setTimeout(() => setHpReady(true), HEALTH_DROP_DELAY)
                );
            } else if (hasImpacted) {
                setHpReady(true);
            }

            if (latestKO) {
                timersRef.current.push(
                    setTimeout(() => setKoReady(true), KO_VISUAL_DELAY)
                );
            }
        }

        return () => timersRef.current.forEach(clearTimeout);
    }, [
        eventKey,
        latestHeal,
        latestRevive,
        latestKO,
        eventType,
        event?.log.defenderName,
        hasImpacted,
    ]);

    // ── Scroll to involved fighter ────────────────────────────────────────────
    useEffect(() => {
        if (involvedIds.size === 0 || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        for (const id of involvedIds) {
            const el = avatarRefsMap.current.get(id);

            if (!el) continue;

            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            const targetScrollTop =
                container.scrollTop +
                (elRect.top - containerRect.top) -
                container.clientHeight / 2 +
                elRect.height / 2;

            const targetScrollLeft =
                container.scrollLeft +
                (elRect.left - containerRect.left) -
                container.clientWidth / 2 +
                elRect.width / 2;

            container.scrollTo({
                top: targetScrollTop,
                left: targetScrollLeft,
                behavior: "smooth",
            });

            break;
        }
    }, [eventKey, actionEvent]);

    useEffect(() => {
        if (openCommandActorId === null) {
            setDropdownPosition(null);
            onDeselectActor();
            return;
        }

        const updatePosition = () => {
            const avatar = avatarRefsMap.current.get(openCommandActorId);
            if (!avatar) return;

            const rect = avatar.getBoundingClientRect();
            const width = Math.min(340, window.innerWidth - 24);

            const viewportLeft = Math.max(
                12,
                Math.min(
                    rect.left + rect.width / 2 - width / 2,
                    window.innerWidth - width - 12
                )
            );

            setDropdownPosition({
                top: rect.bottom + 8 + window.scrollY,
                left: viewportLeft + window.scrollX,
            });
        };

        const teamColumn = scrollContainerRef.current;

        const handleTeamColumnScroll = () => {
            // Automatic scrolling: reposition dropdown, but keep it open.
            if (programmaticScrollRef.current) {
                updatePosition();
                return;
            }

            // Manual scrolling: close and deselect.
            setOpenCommandActorId(null);
            setDropdownPosition(null);
            onDeselectActor();
        };
        updatePosition();

        teamColumn?.addEventListener("scroll", handleTeamColumnScroll);
        window.addEventListener("resize", updatePosition);

        return () => {
            teamColumn?.removeEventListener("scroll", handleTeamColumnScroll);
            window.removeEventListener("resize", updatePosition);
        };
    }, [openCommandActorId, onDeselectActor]);

    // ── Center selected fighter ──────────────────────────────
    useEffect(() => {
        if (selectedActorId === null || selectedActorId === undefined) return;

        const container = scrollContainerRef.current;
        const avatar = avatarRefsMap.current.get(selectedActorId);

        if (!container || !avatar) return;

        const containerRect = container.getBoundingClientRect();
        const avatarRect = avatar.getBoundingClientRect();

        const targetScrollTop =
            container.scrollTop +
            (avatarRect.top - containerRect.top) -
            container.clientHeight / 2 +
            avatarRect.height / 2;

        const targetScrollLeft =
            container.scrollLeft +
            (avatarRect.left - containerRect.left) -
            container.clientWidth / 2 +
            avatarRect.width / 2;

        programmaticScrollRef.current = true;

        if (scrollResetTimerRef.current) {
            clearTimeout(scrollResetTimerRef.current);
        }

        container.scrollTo({
            top: targetScrollTop,
            left: targetScrollLeft,
            behavior: "smooth",
        });

        scrollResetTimerRef.current = setTimeout(() => {
            programmaticScrollRef.current = false;
        }, 800);

    }, [selectedActorId]);

    useEffect(() => {
        if (!isPlayerTurn) {
            setOpenCommandActorId(null);
        }
    }, [isPlayerTurn]);

    return (
        <div ref={dropdownRef} className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0 overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="flex flex-wrap gap-1 sm:gap-3 justify-center max-h-[210px] md:max-h-[310px] w-full py-6 overflow-y-auto md:overflow-y-visible overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
            >
                {fighters.map((f) => {
                    // const isInvolved = involvedIds.has(f.id);
                    const maxHp = f.maxHp || 100;

                    // ── Phase-gated HP display ────────────────────────────────
                    // Before hpReady: show the "before this event" HP.
                    // When hpReady flips: CSS transition-all duration-700 animates the bar drop.
                    // For fighters NOT involved in the current event, show their real HP immediately.
                    const isDefenderThisEvent =
                        targetIds.includes(f.id) ||
                        latestKO === f.id ||
                        latestDefend === f.id;
                    const isHealTarget = latestHeal === f.id || latestRevive === f.id;
                    const holdHp = !hpReady && (isDefenderThisEvent || isHealTarget);

                    const realCurrentHp = f.isAlive ? (f.currentHp ?? maxHp) : 0;
                    const preEventHp = f.prevHp !== undefined ? f.prevHp : maxHp;
                    const displayHp = holdHp ? preEventHp : realCurrentHp;

                    const hpPercent = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));

                    const currentEnergy = f.energy ?? 0;
                    const maxEnergy = f.maxEnergy ?? 100;
                    const energyPercent = Math.max(0, Math.min(100, (currentEnergy / maxEnergy) * 100));

                    const isStunned = f.status?.some(
                        (status) => status.type === "stun" && status.duration > 0
                    );

                    const isFocused = f.status?.some(
                        (status) => status.type === "focus" && status.duration > 0
                    );

                    // ── Phase-gated KO visual ─────────────────────────────────
                    // latestKO fires immediately from CinematicCombatView; we delay showing
                    // the KO ring/skull/scale in Avatar until koReady (1800ms).
                    const isKO = (latestKO === f.id && koReady) || (!f.isAlive && latestKO !== f.id);

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
                                    avatarRefsMap.current.set(f.id, node);
                                } else {
                                    avatarRefsMap.current.delete(f.id);
                                }
                            }}
                            // className={cn(
                            //     "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
                            //     isInvolved ? "scale-105 z-10" : "scale-100 opacity-95"
                            // )}
                            onClick={() => {
                                if (canSelectTarget && onSelectTarget) {
                                    onSelectTarget(f.id);
                                    setOpenCommandActorId(null);
                                    return;
                                }

                                if (canSelectActor && onSelectActor) {
                                    onSelectActor(f.id);

                                    setOpenCommandActorId((current) =>
                                        current === f.id ? null : f.id
                                    );
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
                                size={55}
                                variant={variant}
                                isMvp={f.name === mvp}
                                isAttacking={attackerId === f.id}
                                isBeingHit={targetIds.includes(f.id)}
                                isKO={isKO}
                                isHealing={latestHeal === f.id}
                                isReviving={latestRevive === f.id}
                                isDefending={latestDefend === f.id}
                                isStunned={isStunned}
                                isFocused={isFocused}
                                isInvolved={isSelectedActor || isSelectedTarget}
                                eventType={involvedIds.has(f.id) ? eventType : undefined}
                                eventRole={actionEvent?.activePower?.combatRole}
                            // isInvolved={isInvolved}
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
                            {/* Phase-synced energy bar */}
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
                        </div>
                    );
                })}
            </div>
            {openCommandActorId !== null &&
                openCommandActorId === selectedActorId &&
                isPlayerSide &&
                isPlayerTurn &&
                dropdownPosition &&
                renderCommandPanel &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="absolute z-[100] w-[340px] max-w-[calc(100vw-24px)] max-h-[min(420px,calc(100vh-24px))] overflow-y-auto rounded-xl bg-background shadow-2xl ring-1 ring-border isolate"
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderCommandPanel(() => setOpenCommandActorId(null))}
                    </div>,
                    document.body
                )}
        </div>
    );
}