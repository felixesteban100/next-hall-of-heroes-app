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
};

export function MemberBreakdown({ entitiesA, entitiesB }: Props) {
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
            <div className="bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border border-muted-foreground/20 flex items-center justify-between gap-2">
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
                                            <span className="truncate text-foreground">{r.name}</span>
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
                                            <span className="truncate text-foreground">{r.name}</span>
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