// components/compare/MemberBreakdown.tsx
"use client";

import { useState } from "react";
import { Row } from "@/components/compare/rows/Row";
import { Cell, EmptyCell } from "@/components/compare/rows/Cell";

type Props = {
    rosterA: {
        id: number,
        name: string,
        overall: number,
    }[],
    rosterB: {
        id: number,
        name: string,
        overall: number,
    }[]
};

export function MemberBreakdown({ rosterA, rosterB }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20 flex items-center justify-between gap-2">
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
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
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