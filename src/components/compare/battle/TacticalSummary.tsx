"use client"

import { BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";
import { getTacticalInsight } from "@/lib/compare/teamChemistry";

export default function TacticalSummary({ isMounted, powerEstimateA, powerEstimateB, nameA, nameB, seed }: { isMounted: boolean, powerEstimateA: number, powerEstimateB: number, nameA: string, nameB: string, seed: number }) {
    const [tacticalSummary, setTacticalSummary] = useState<string>("");

    useEffect(() => {
        if (!isMounted) return;
        const diff = Math.abs(powerEstimateA - powerEstimateB);
        const leader = powerEstimateA > powerEstimateB ? nameA : nameB;
        const underdog = powerEstimateA > powerEstimateB ? nameB : nameA;
        setTacticalSummary(getTacticalInsight(nameA, nameB, diff, leader, underdog));
    }, [isMounted, nameA, nameB, powerEstimateA, powerEstimateB, seed]);

    return (
        <div className="pt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                <BrainCircuit className="size-3 text-cyan-400" /> Tactical Insight
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded-md border border-muted-foreground/10">
                {tacticalSummary}
            </p>
        </div>
    )
}
