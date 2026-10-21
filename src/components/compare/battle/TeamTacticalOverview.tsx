// components/compare/TeamTacticalOverview.tsx
"use client";

import { avgTeamPowerstats } from "@/lib/compare/compare_utls";

type CharacterInfo = {
    name: string;
    powerstats?: {
        speed?: number;
        intelligence?: number;
        strength?: number;
        durability?: number;
        power?: number;
        combat?: number;
    }
};

type Props = {
    entitiesA: CharacterInfo[];
    entitiesB: CharacterInfo[];
    nameA: string;
    nameB: string;
};

export function TeamTacticalOverview({ entitiesA, entitiesB, nameA, nameB }: Props) {
    // Calculate actual average powerstats for both teams
    const statsA = avgTeamPowerstats(entitiesA as any);
    const statsB = avgTeamPowerstats(entitiesB as any);

    // Determine specific stat advantages dynamically
    const speedA = statsA?.speed ?? 0;
    const speedB = statsB?.speed ?? 0;
    const edgeA = speedA >= speedB ? "Speed & Intel" : "Power & Durability";
    const edgeB = speedB > speedA ? "Speed & Intel" : "Power & Durability";

    // Determine Cohesion / Roster size balance
    const rosterSizeA = entitiesA.length;
    const rosterSizeB = entitiesB.length;
    const cohesionText = rosterSizeA === rosterSizeB ? "Balanced Roster" : "Numerical Disparity";

    // Primary vector based on total stat comparison
    const totalA = statsA?.total ?? 0;
    const totalB = statsB?.total ?? 0;
    const primaryVector = Math.abs(totalA - totalB) > 20 ? "Stat Density Gap" : "Clutch Synergy";

    return (
        <div className="py-2.5 border-t border-muted-foreground/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Team Synergy & Advantages</span>
                <span className="text-cyan-400 font-extrabold">Dynamic Analysis</span>
            </div>

            {/* 1. Stat Advantages Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center truncate">
                    <span className="block text-muted-foreground truncate">{nameA} Edge</span>
                    <span className="font-bold text-primary truncate">{edgeA}</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 text-center truncate">
                    <span className="block text-muted-foreground truncate">{nameB} Edge</span>
                    <span className="font-bold text-secondary truncate">{edgeB}</span>
                </div>
            </div>

            {/* 2. Synergy / Win Condition Badges */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="bg-muted/30 p-2 rounded-lg border border-muted-foreground/10 truncate">
                    <p className="text-muted-foreground">Roster Cohesion</p>
                    <p className="text-xs font-black text-foreground truncate">{cohesionText}</p>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg border border-muted-foreground/10 truncate">
                    <p className="text-muted-foreground">Primary Vector</p>
                    <p className="text-xs font-black text-emerald-400 truncate">{primaryVector}</p>
                </div>
            </div>
        </div>
    );
}