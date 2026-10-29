"use client";

import { useEffect, useRef } from "react";
import { EnrichedFighter } from "../CinematicCombatView";
import Avatar from "./Avatar";
import { cn } from "@/lib/utils";

export default function TeamColumn({
    fighters, variant, mvp,
    activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
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
    isDialog?: boolean;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const avatarRefsMap = useRef(new Map());

    const involvedNames = new Set(
        [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend].filter(Boolean)
    );

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
                className="flex flex-wrap gap-2.5 sm:gap-3 justify-center max-h-[210px] md:max-h-none overflow-y-auto md:overflow-y-visible overflow-x-hidden w-full p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
            >
                {fighters.map((f) => {
                    const isInvolved = involvedNames.has(f.name);
                    const maxHp = f.maxHp || 100;
                    const currentHp = f.isAlive ? (f.currentHp ?? maxHp) : 0;
                    const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

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
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
                                isInvolved ? "scale-105 z-10" : "scale-100 opacity-95"
                            )}
                        >
                            <Avatar
                                fighter={f}
                                size={48}
                                variant={variant}
                                isMvp={f.name === mvp}
                                isAttacking={activeAttacker === f.name}
                                isBeingHit={activeDefender === f.name}
                                isKO={latestKO === f.name || !f.isAlive}
                                isHealing={latestHeal === f.name}
                                isReviving={latestRevive === f.name}
                                isDefending={latestDefend === f.name}
                            />

                            {/* Minimalist Individual Character Health Bar */}
                            <div className="w-[48px] flex flex-col gap-0.5">
                                <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            hpPercent > 50
                                                ? (variant === "primary" ? "bg-primary" : "bg-secondary")
                                                : hpPercent > 20
                                                    ? "bg-yellow-400"
                                                    : "bg-red-500"
                                        )}
                                        style={{ width: `${hpPercent}%` }}
                                    />
                                </div>
                                <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none">
                                    {currentHp}/{maxHp}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}