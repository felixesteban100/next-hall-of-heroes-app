"use client";

import { useEffect, useRef, useState } from "react";
import { EnrichedFighter } from "../CinematicCombatView";
import Avatar from "./Avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Timing constants (must match ClashCard phase delays) ─────────────────────
// Phase 2 = 900ms → health bar drops
// Phase 3 = 1800ms → KO visual state applies
export const HEALTH_DROP_DELAY = 1000;
export const KO_VISUAL_DELAY = 1800;

export default function TeamColumn({
    fighters, variant, mvp,
    activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
    eventKey,
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
    // A monotonically-increasing key that changes every time the step advances.
    // Used to reset the phase timers whenever a new combat event fires.
    eventKey?: number;
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

                    // ── Phase-gated KO visual ─────────────────────────────────
                    // latestKO fires immediately from CinematicCombatView; we delay showing
                    // the KO ring/skull/scale in Avatar until koReady (1800ms).
                    const isKO = (latestKO === f.name && koReady) || (!f.isAlive && latestKO !== f.name);

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
                                isKO={isKO}
                                isHealing={latestHeal === f.name}
                                isReviving={latestRevive === f.name}
                                isDefending={latestDefend === f.name}
                            />

                            {/* Phase-synced health bar */}
                            <div className="w-[48px] flex flex-col gap-0.5">
                                <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                                    <motion.div
                                        initial={{ opacity: 0.5 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                                {/* HP text also phase-gated: shows real value only after hpReady */}
                                <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none transition-all duration-700">
                                    {displayHp}/{maxHp}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


// "use client";

// import { useEffect, useRef } from "react";
// import { EnrichedFighter } from "../CinematicCombatView";
// import Avatar from "./Avatar";
// import { cn } from "@/lib/utils";

// export default function TeamColumn({
//     fighters, variant, mvp,
//     activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
// }: {
//     fighters: EnrichedFighter[];
//     variant: "primary" | "secondary";
//     mvp?: string;
//     activeAttacker?: string;
//     activeDefender?: string;
//     latestKO?: string;
//     latestHeal?: string;
//     latestRevive?: string;
//     latestDefend?: string;
//     isDialog?: boolean;
// }) {
//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const avatarRefsMap = useRef(new Map());

//     const involvedNames = new Set(
//         [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend].filter(Boolean)
//     );

//     useEffect(() => {
//         if (involvedNames.size > 0 && scrollContainerRef.current) {
//             const container = scrollContainerRef.current;

//             for (const name of involvedNames) {
//                 if (!name) continue;
//                 const el = avatarRefsMap.current.get(name);
//                 if (el) {
//                     const containerRect = container.getBoundingClientRect();
//                     const elRect = el.getBoundingClientRect();

//                     const relativeTop = elRect.top - containerRect.top;
//                     const relativeLeft = elRect.left - containerRect.left;

//                     const targetScrollTop = container.scrollTop + relativeTop - (container.clientHeight / 2) + (elRect.height / 2);
//                     const targetScrollLeft = container.scrollLeft + relativeLeft - (container.clientWidth / 2) + (elRect.width / 2);

//                     container.scrollTo({
//                         top: targetScrollTop,
//                         left: targetScrollLeft,
//                         behavior: "smooth"
//                     });
//                     break;
//                 }
//             }
//         }
//     }, [activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend]);

//     return (
//         <div className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0 overflow-hidden">
//             <div
//                 ref={scrollContainerRef}
//                 /*  */
//                 className="flex flex-wrap gap-1 sm:gap-3 justify-center max-h-[210px] md:max-h-none w-full py-6 overflow-y-auto md:overflow-y-visible overflow-x-hidden  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
//             >
//                 {fighters.map((f) => {
//                     const isInvolved = involvedNames.has(f.name);
//                     const maxHp = f.maxHp || 100;
//                     const currentHp = f.isAlive ? (f.currentHp ?? maxHp) : 0;
//                     const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

//                     return (
//                         <div
//                             key={f.id}
//                             ref={(node) => {
//                                 if (node) {
//                                     avatarRefsMap.current.set(f.name, node);
//                                 } else {
//                                     avatarRefsMap.current.delete(f.name);
//                                 }
//                             }}
//                             className={cn(
//                                 "flex flex-col items-center gap-1 transition-all duration-300 transform-gpu",
//                                 isInvolved ? "scale-105 z-10" : "scale-100 opacity-95"
//                             )}
//                         >
//                             <Avatar
//                                 fighter={f}
//                                 size={48}
//                                 variant={variant}
//                                 isMvp={f.name === mvp}
//                                 isAttacking={activeAttacker === f.name}
//                                 isBeingHit={activeDefender === f.name}
//                                 isKO={latestKO === f.name || !f.isAlive}
//                                 isHealing={latestHeal === f.name}
//                                 isReviving={latestRevive === f.name}
//                                 isDefending={latestDefend === f.name}
//                             />

//                             {/* Minimalist Individual Character Health Bar */}
//                             <div className="w-[48px] flex flex-col gap-0.5">
//                                 <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
//                                     <div
//                                         className={cn(
//                                             "h-full rounded-full transition-all duration-300",
//                                             hpPercent > 50
//                                                 ? (variant === "primary" ? "bg-primary" : "bg-secondary")
//                                                 : hpPercent > 20
//                                                     ? "bg-yellow-400"
//                                                     : "bg-red-500"
//                                         )}
//                                         style={{ width: `${hpPercent}%` }}
//                                     />
//                                 </div>
//                                 <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none">
//                                     {currentHp}/{maxHp}
//                                 </span>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }