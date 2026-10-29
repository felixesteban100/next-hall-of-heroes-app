"use client";

import React, { useMemo, useState } from "react";
import { Zap, ArrowLeftRight } from "lucide-react";
import { hasNemesisLink } from "@/lib/compare";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

interface RivalryMatrixCardProps {
    entitiesA: CharacterWithJoinTeamUniversePowerEnemies[];
    entitiesB: CharacterWithJoinTeamUniversePowerEnemies[];
    entityAName: string;
    entityBName: string;
    mode: string;
}

export const RivalryMatrixCard: React.FC<RivalryMatrixCardProps> = ({
    entitiesA,
    entitiesB,
    entityAName,
    entityBName,
    mode,
}) => {
    const [rivalPerspective, setRivalPerspective] = useState<"A" | "B">("A");

    const groupedNemesisA = useMemo(() => {
        if (mode !== "team") return [];
        const validA = entitiesA.filter(Boolean);
        const validB = entitiesB.filter(Boolean);
        const map = new Map<string, string[]>();

        validA.forEach((a) => {
            validB.forEach((b) => {
                if (hasNemesisLink(a, b)) {
                    const existing = map.get(a.name) || [];
                    map.set(a.name, [...existing, b.name]);
                }
            });
        });
        return Array.from(map.entries()).map(([name, opponents]) => ({ name, opponents }));
    }, [mode, entitiesA, entitiesB]);

    const groupedNemesisB = useMemo(() => {
        if (mode !== "team") return [];
        const validA = entitiesA.filter(Boolean);
        const validB = entitiesB.filter(Boolean);
        const map = new Map<string, string[]>();

        validB.forEach((b) => {
            validA.forEach((a) => {
                if (hasNemesisLink(a, b)) {
                    const existing = map.get(b.name) || [];
                    map.set(b.name, [...existing, a.name]);
                }
            });
        });
        return Array.from(map.entries()).map(([name, opponents]) => ({ name, opponents }));
    }, [mode, entitiesA, entitiesB]);

    const activeNemesisList = rivalPerspective === "A" ? groupedNemesisA : groupedNemesisB;
    const activeTeamName = rivalPerspective === "A" ? entityAName : entityBName;

    if (groupedNemesisA.length === 0 && groupedNemesisB.length === 0) {
        return null;
    }

    return (
        <div className="relative my-4 overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/15 via-red-900/5 to-red-950/15 p-4 backdrop-blur-md">
            <div className="relative flex flex-col gap-3">
                {/* Header Banner & Side Switcher */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-red-500/20 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-black tracking-widest uppercase">
                            <Zap className="h-3.5 w-3.5 fill-red-500 animate-bounce" />
                            <span>Rival Matchups ({activeTeamName}&apos;s Perspective)</span>
                            <Zap className="h-3.5 w-3.5 fill-red-500 animate-bounce" />
                        </div>
                    </div>

                    {/* Perspective Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setRivalPerspective((prev) => (prev === "A" ? "B" : "A"))}
                        className="px-3 py-1 rounded-lg border border-border/60 bg-background/60 hover:bg-background text-xs font-bold text-foreground transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-red-400" />
                        <span>View as:</span>
                        <span className={rivalPerspective === "A" ? "text-secondary font-extrabold" : "text-primary font-extrabold"}>
                            {rivalPerspective === "A" ? entityBName : entityAName}
                        </span>
                    </button>
                </div>

                {/* Grouped Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-1">
                    {activeNemesisList.map(({ name, opponents }) => (
                        <div
                            key={name}
                            className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-background/40 border border-border/40"
                        >
                            <span
                                className={`text-xs font-bold truncate flex items-center gap-1.5 ${rivalPerspective === "A" ? "text-primary" : "text-secondary"
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${rivalPerspective === "A" ? "bg-primary" : "bg-secondary"
                                        }`}
                                />
                                {name}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {opponents.map((opp) => (
                                    <span
                                        key={opp}
                                        className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-[10px] font-semibold text-foreground truncate"
                                    >
                                        vs {opp}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};