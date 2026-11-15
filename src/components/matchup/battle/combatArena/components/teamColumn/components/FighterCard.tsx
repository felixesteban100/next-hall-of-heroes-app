"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { EnrichedFighter } from "@/lib/matchup/combat/adapters";
import Avatar from "./Avatar";
import FighterResourceBar from "./FighterResourceBar";
import { useIsMobile } from "@/components/shared/SwipeGrid";
import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

type AvatarProps = ComponentProps<typeof Avatar>;

type Props = {
    fighter: EnrichedFighter;
    variant: "primary" | "secondary";
    attackerId?: number;
    targetIds: number[];
    latestKO?: number;
    latestHeal?: number;
    latestRevive?: number;
    latestDefend?: number;
    hpReady: boolean;
    koReady: boolean;
    isSelectedActor: boolean;
    isSelectedTarget: boolean;
    isValidTarget: boolean;
    canSelectActor?: boolean;
    eventType?: AvatarProps["eventType"];
    eventRole?: AvatarProps["eventRole"];
    onClick: () => void;
    setAvatarRef: (node: HTMLDivElement | null) => void;
    size?: number;
};

export default function FighterCard({
    size,
    fighter,
    variant,
    attackerId,
    targetIds,
    latestKO,
    latestHeal,
    latestRevive,
    latestDefend,
    hpReady,
    koReady,
    isSelectedActor,
    isSelectedTarget,
    isValidTarget,
    canSelectActor,
    eventType,
    eventRole,
    onClick,
    setAvatarRef,
}: Props) {
    const shakeControls = useAnimationControls();

    const handleCardClick = () => {
        if (!isSelectable) {
            void shakeControls.start({
                x: [0, -25, 25, -22, 22, -18, 18, -12, 12, 0],
                rotate: [0, -5, 5, -4, 4, -2, 2, 0],
                scale: [1, 0.92, 1.05, 0.95, 1],
                backgroundColor: [
                    "rgba(239, 68, 68, 0)",
                    "rgba(239, 68, 68, 0.35)",
                    "rgba(239, 68, 68, 0.15)",
                    "rgba(239, 68, 68, 0)",
                ],
                borderColor: [
                    "rgba(239, 68, 68, 0)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(239, 68, 68, 0)",
                ],
                boxShadow: [
                    "0 0 0px rgba(239, 68, 68, 0)",
                    "0 0 30px 8px rgba(239, 68, 68, 0.9)",
                    "0 0 20px 5px rgba(239, 68, 68, 0.7)",
                    "0 0 0px rgba(239, 68, 68, 0)",
                ],
                transition: {
                    duration: 0.8,
                    ease: "easeInOut",
                },
            });

            return;
        }

        onClick();
    };

    const maxHp = fighter.maxHp || 100;

    const realCurrentHp = fighter.isAlive
        ? (fighter.currentHp ?? maxHp)
        : 0;

    const currentEnergy = fighter.energy ?? 0;
    const maxEnergy = fighter.maxEnergy ?? 100;

    const isKO =
        (latestKO === fighter.id && koReady) ||
        (!fighter.isAlive && latestKO !== fighter.id);

    const isSelectable = isValidTarget || canSelectActor;
    const avatarSize = size ?? (useIsMobile() === true ? 60 : 80);
    const frameSize = avatarSize + 1;

    return (
        <div
            ref={setAvatarRef}
            onClick={handleCardClick}
            className={cn(
                "relative flex flex-col items-center gap-1 p-1 transition-all duration-200 transform-gpu",
                isSelectable && "cursor-pointer hover:-translate-y-0.5",
                // !isSelectable && "opacity-75"
            )}
        >
            {/* Backing plate behind the avatar */}
            {isSelectable && (
                <svg
                    aria-hidden="true"
                    width={frameSize}
                    height={frameSize}
                    viewBox={`0 0 ${frameSize} ${frameSize}`}
                    style={{
                        top: `calc(0.25rem - ${(frameSize - avatarSize) / 8}px)`,
                    }}
                    className={cn(
                        "pointer-events-none absolute left-1/2 -translate-x-1/2 z-0 overflow-visible",
                        (canSelectActor || isValidTarget) && `text-${variant}`,
                    )}
                >
                    {/* Faint full perimeter track */}
                    <rect
                        x="1.5"
                        y="2"
                        width={frameSize - 3}
                        height={frameSize - 3}
                        rx="12"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.2"
                        strokeWidth="1.5"
                    />

                    {/* Traveling dash/dot circulating along the border */}
                    <rect
                        x="1.5"
                        y="1.5"
                        width={frameSize - 3}
                        height={frameSize - 3}
                        rx="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="18 280"
                        pathLength="298"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="298"
                            to="0"
                            dur="2.2s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </svg>
            )}
            <motion.div
                animate={shakeControls}
                className={cn(
                    "relative flex flex-col items-center gap-1 rounded-lg border border-transparent p-1 cursor-pointer",
                    isSelectable && "hover:-translate-y-0.5 transition-transform duration-200"
                )}
            >
                <Avatar
                    // className="relative z-10"
                    fighter={fighter}
                    size={avatarSize}
                    variant={variant}
                    isAttacking={attackerId === fighter.id}
                    isBeingHit={targetIds.includes(fighter.id)}
                    isKO={isKO}
                    isHealing={latestHeal === fighter.id}
                    isReviving={latestRevive === fighter.id}
                    isDefending={latestDefend === fighter.id}
                    isInvolved={isSelectedActor || isSelectedTarget}
                    eventType={eventType}
                    eventRole={eventRole}
                />
            </motion.div>


            {/* Phase-synced health bar */}
            <FighterResourceBar
                size={avatarSize}
                current={realCurrentHp}
                previous={fighter.prevHp}
                max={maxHp}
                label="HP"
                variant={variant}
                colorMode="health"
                hold={
                    targetIds.includes(fighter.id) ||
                    latestKO === fighter.id ||
                    latestDefend === fighter.id ||
                    latestHeal === fighter.id ||
                    latestRevive === fighter.id
                }
                ready={hpReady}
            />

            {/* Energy bar */}
            <FighterResourceBar
                size={avatarSize}
                current={currentEnergy}
                max={maxEnergy}
                label="EN"
                variant={variant}
                colorMode="energy"
            />
        </div>
    );
}