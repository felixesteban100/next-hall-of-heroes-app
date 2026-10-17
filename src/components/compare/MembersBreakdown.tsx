// components/compare/MemberBreakdown.tsx
"use client";

import { useState } from "react";
import { Row } from "@/components/compare/rows/Row";
import { Cell, EmptyCell } from "@/components/compare/rows/Cell";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare/compare_utls";

type Props = {
    entitiesA: CharacterWithJoinTeamUniversePowerEnemies[]
    entitiesB: CharacterWithJoinTeamUniversePowerEnemies[]
    mvpA: string
    mvpB: string
};

export function MemberBreakdown({ entitiesA, entitiesB, mvpA, mvpB }: Props) {
    const [open, setOpen] = useState(true);

    const rosterA = entitiesA.map((e) => ({
        id: e.id,
        name: e.name,
        overall: computeMatchScore(e).overall,
    }));
    const rosterB = entitiesB.map((e) => ({
        id: e.id,
        name: e.name,
        overall: computeMatchScore(e).overall,
    }));

    return (
        <>
            <div className="bg-transparent border-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-2">
                <span>Member breakdown</span>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-primary normal-case font-semibold text-[11px] hover:underline"
                >
                    {open ? "Hide members ▴" : "Show members ▾"}
                </button>
            </div>

            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} border`}
            >
                <div className="overflow-hidden min-h-0">
                    <Row label="Roster">
                        {rosterA.length ? (
                            <Cell className="!block text-left">
                                <ul className="w-full space-y-1.5 text-xs sm:text-sm">
                                    {rosterA.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex items-center justify-between gap-2 px-1"
                                        >
                                            <span className="flex items-center gap-1 min-w-0">
                                                {/* Truncate long names so MVP & score always fit */}
                                                <span className="font-medium text-foreground truncate min-w-0 text-xs">
                                                    {r.name}
                                                </span>

                                                {/* MVP Badge */}
                                                {(mvpA === r.name) && (
                                                    <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                                        MVP
                                                    </span>
                                                )}
                                            </span>
                                            <span className="tabular-nums font-bold text-primary shrink-0">
                                                {r.overall.toFixed(1)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </Cell>
                        ) : (
                            <EmptyCell />
                        )}

                        {rosterB.length ? (
                            <Cell className="!block text-left">
                                <ul className="w-full space-y-1.5 text-xs sm:text-sm">
                                    {rosterB.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex items-center justify-between gap-2 px-1"
                                        >
                                            <span className="flex items-center gap-1 min-w-0">
                                                {/* Truncate long names so MVP & score always fit */}
                                                <span className="font-medium text-foreground truncate min-w-0 text-xs">
                                                    {r.name}
                                                </span>

                                                {/* MVP Badge */}
                                                {(mvpB === r.name) && (
                                                    <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30">
                                                        MVP
                                                    </span>
                                                )}
                                            </span>
                                            <span className="tabular-nums font-bold text-secondary shrink-0">
                                                {r.overall.toFixed(1)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </Cell>
                        ) : (
                            <EmptyCell />
                        )}
                    </Row>
                </div>
            </div>
        </>
    );
}