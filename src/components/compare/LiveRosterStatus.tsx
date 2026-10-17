"use client"

import { FighterState } from "./BattlePanel";

export default function LiveRosterStatus({ rosterA, rosterB }: { rosterA: FighterState[], rosterB: FighterState[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="flex flex-wrap gap-1 items-center">
                {rosterA.map((fighter, idx) => (
                    <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md border transition-all duration-300 flex items-center gap-1 ${fighter.isAlive
                            ? "bg-primary/10 border-primary/30 text-foreground font-medium"
                            : "bg-muted/40 border-muted-foreground/20 text-muted-foreground line-through opacity-60 grayscale"
                            }`}
                    >
                        {fighter.name} {fighter.isAlive ? "" : "💀"}
                    </span>
                ))}
            </div>
            <div className="flex flex-wrap gap-1 items-center justify-end">
                {rosterB.map((fighter, idx) => (
                    <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md border transition-all duration-300 flex items-center gap-1 ${fighter.isAlive
                            ? "bg-secondary/10 border-secondary/30 text-foreground font-medium"
                            : "bg-muted/40 border-muted-foreground/20 text-muted-foreground line-through opacity-60 grayscale"
                            }`}
                    >
                        {fighter.name} {fighter.isAlive ? "" : "💀"}
                    </span>
                ))}
            </div>
        </div>
    )
}
