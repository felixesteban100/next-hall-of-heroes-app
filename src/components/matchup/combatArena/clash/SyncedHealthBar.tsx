
"use client";

import { useEffect, useState } from "react";
import type { CombatPhase } from "./types";
import { cn } from "@/lib/utils";

type SyncedHealthBarProps = {
    currentHp: number;
    maxHp: number;
    isTeamA: boolean;
    phase: CombatPhase;
    isAlive: boolean;
    prevHp?: number;
};

export default function SyncedHealthBar({
    currentHp,
    maxHp,
    isTeamA,
    phase,
    isAlive,
    prevHp,
}: SyncedHealthBarProps) {
    const safeMaxHp = Math.max(1, maxHp);

    const hpPercent = Math.max(
        0,
        Math.min(100, ((isAlive ? currentHp : 0) / safeMaxHp) * 100)
    );

    const holdPercent = Math.max(
        0,
        Math.min(
            100,
            ((prevHp !== undefined ? prevHp : safeMaxHp) / safeMaxHp) * 100
        )
    );

    const [displayPercent, setDisplayPercent] = useState(holdPercent);

    useEffect(() => {
        setDisplayPercent(phase >= 2 ? hpPercent : holdPercent);
    }, [phase, hpPercent, holdPercent]);

    const displayedHp =
        phase >= 2
            ? Math.max(0, currentHp)
            : prevHp !== undefined
                ? prevHp
                : safeMaxHp;

    return (
        <div className="mt-1 flex w-24 flex-col gap-1 sm:w-28 md:w-32">
            {/* Health bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full border border-muted-foreground/15 bg-muted/40 p-[0.5px] sm:h-2">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        displayPercent > 50
                            ? isTeamA
                                ? "bg-primary"
                                : "bg-secondary"
                            : displayPercent > 20
                                ? "bg-yellow-400"
                                : "bg-red-500"
                    )}
                    style={{ width: `${displayPercent}%` }}
                />
            </div>

            {/* HP values */}
            <span className="text-center font-mono text-[9px] leading-none text-muted-foreground/80 sm:text-[10px]">
                {displayedHp}/{maxHp}
            </span>
        </div>
    );
}
