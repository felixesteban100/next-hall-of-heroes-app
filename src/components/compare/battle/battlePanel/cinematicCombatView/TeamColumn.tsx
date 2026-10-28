"use client";

import { useEffect, useRef } from "react";
import { EnrichedFighter } from "../CinematicCombatView";
import Avatar from "./Avatar";

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
    const avatarRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

    const involvedNames = new Set(
        [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend].filter(Boolean)
    );

    // 🚀 Precise bounding-rect calculation to scroll ONLY the inner container without moving the page
    useEffect(() => {
        if (involvedNames.size > 0 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;

            for (const name of involvedNames) {
                if (!name) continue;
                const el = avatarRefsMap.current.get(name);
                if (el) {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();

                    // Calculate current relative difference and current scroll position
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
        <div className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0 overflow-x-hidden">
            <div
                ref={scrollContainerRef}
                className="flex flex-wrap gap-3 justify-center max-h-[190px] md:max-h-none overflow-y-auto overflow-x-hidden w-full p-2 pt-3 custom-scrollbar relative"
            >
                {fighters.map((f) => {
                    const isInvolved = involvedNames.has(f.name);
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
                            className={`inline-flex flex-col items-center transition-all duration-300 ${isInvolved ? "scale-110 z-10 drop-shadow-md" : "scale-100 opacity-90"
                                }`}
                        >
                            <Avatar
                                fighter={f}
                                size={52}
                                variant={variant}
                                isMvp={f.name === mvp}
                                isAttacking={activeAttacker === f.name}
                                isBeingHit={activeDefender === f.name}
                                isKO={latestKO === f.name}
                                isHealing={latestHeal === f.name}
                                isReviving={latestRevive === f.name}
                                isDefending={latestDefend === f.name}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}