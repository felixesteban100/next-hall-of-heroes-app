"use client";

import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import type { CombatEvent } from "@/lib/matchup/combat/types/types";

import LogRow from "./LogRow";

type CombatFeedProps = {
    logs: CombatEvent[];
};

export default function CombatFeed({ logs }: CombatFeedProps) {
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!logRef.current) return;

        logRef.current.scrollTo({
            top: logRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [logs.length]);

    return (
        <div style={{ height: 200 }} className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                    <Activity className="size-3.5 animate-pulse text-amber-500" />
                    Combat Feed
                </span>

                <span className="text-muted-foreground/60 font-mono">
                    {logs.length} events
                </span>
            </div>

            <div
                ref={logRef}
                style={{ height: 200 }}
                className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/50 italic">
                        Waiting for combat to start…
                    </div>
                ) : (
                    logs.map((event) => (
                        <LogRow key={event.id} event={event} />
                    ))
                )}
            </div>
        </div>
    );
}
