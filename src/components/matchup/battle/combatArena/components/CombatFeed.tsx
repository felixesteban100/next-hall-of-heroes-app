
"use client";

import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import type { ComponentProps } from "react";

import LogRow from "../LogRow";

type LogEntry = ComponentProps<typeof LogRow>["log"];

type CombatFeedProps = {
    logs: LogEntry[];
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
        <div className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth h-[80px]">
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
                className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth h-[120px]"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/50 italic">
                        Waiting for combat to start…
                    </div>
                ) : (
                    logs.map((log) => (
                        <LogRow key={log.id} log={log} />
                    ))
                )}
            </div>
        </div>
    );
}
