"use client";

import { useEffect, useState } from "react";
import { CombatPhase } from "../ClashCard";
import { cn } from "@/lib/utils";


export default function SyncedHealthBar({
    currentHp,
    maxHp,
    isTeamA,
    phase,
    isAlive,
    prevHp,
}: {
    currentHp: number;
    maxHp: number;
    isTeamA: boolean;
    phase: CombatPhase;
    isAlive: boolean;
    prevHp?: number;
}) {
    const hpPercent = Math.max(0, Math.min(100, (isAlive ? currentHp : 0) / maxHp * 100));
    // Before phase 2: hold at pre-event HP so the bar doesn't jump then drop
    const holdPercent = Math.max(0, Math.min(100, (prevHp !== undefined ? prevHp : maxHp) / maxHp * 100));
    const [displayPercent, setDisplayPercent] = useState(holdPercent);

    useEffect(() => {
        if (phase >= 2) {
            setDisplayPercent(hpPercent);
        } else {
            setDisplayPercent(holdPercent);
        }
    }, [phase, hpPercent, holdPercent]);

    return (
        <div className="w-[68px] flex flex-col gap-0.5 mt-0.5">
            <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        displayPercent > 50
                            ? (isTeamA ? "bg-primary" : "bg-secondary")
                            : displayPercent > 20
                                ? "bg-yellow-400"
                                : "bg-red-500"
                    )}
                    style={{ width: `${displayPercent}%` }}
                />
            </div>
            <span className="text-[7px] font-mono text-center text-muted-foreground/80 leading-none">
                {phase >= 2
                    ? `${Math.max(0, currentHp)}/${maxHp}`
                    : `${prevHp !== undefined ? prevHp : maxHp}/${maxHp}`}
            </span>
        </div>
    );
}