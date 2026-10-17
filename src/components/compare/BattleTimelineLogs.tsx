"use client"

import { Activity } from "lucide-react";
import { Log } from "./BattlePanel";
import { useEffect, useRef } from "react";

export default function BattleTimelineLogs({ logs }: { logs: Log[] }) {
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log container
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="pt-1 border-t border-muted-foreground/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                <span className="flex items-center gap-1">
                    <Activity className="size-3 text-primary animate-pulse" /> Live Engagement Log
                </span>
                <span className="text-[9px] text-muted-foreground/60">{logs.length} Actions</span>
            </div>
            <div
                ref={logContainerRef}
                className="flex flex-col gap-1.5 h-[140px] overflow-y-auto pr-1 scroll-smooth"
            >
                {logs.map((log) => {
                    const Icon = log.icon;
                    return (
                        <div
                            key={log.id}
                            className="flex items-start gap-2 text-[11px] p-2 rounded-md bg-muted/20 border border-muted-foreground/10 transition-all duration-300 animate-in fade-in slide-in-from-top-1"
                        >
                            <Icon className={`size-3.5 shrink-0 mt-0.5 ${log.colorClass}`} />
                            <span className="text-foreground/90 whitespace-normal break-words leading-snug">
                                {log.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
