// components/compare/BattleTimelineLogs.tsx
"use client"

import { Activity } from "lucide-react";
import { Log } from "./BattlePanel";
import { useEffect, useRef } from "react";

export default function BattleTimelineLogs({ logs, maxHeight = "h-[140px]" }: { logs: Log[], maxHeight?: string }) {
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log container
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Distinct styling per log type
    const getLogVariantStyles = (type: string) => {
        switch (type) {
            case "heal":
                return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
            case "defend":
                return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
            case "revive":
                return "bg-amber-500/10 border-amber-500/30 text-amber-400";
            case "ko":
                return "bg-orange-500/10 border-orange-500/30 text-orange-400";
            case "finish":
            case "rout":
                return "bg-primary/10 border-primary/40 text-primary font-bold";
            default:
                return "bg-muted/20 border-muted-foreground/15 text-foreground/90";
        }
    };

    return (
        <div className="pt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                <span className="flex items-center gap-1">
                    <Activity className="size-3 text-primary animate-pulse" /> Live Engagement Log
                </span>
                <span className="text-[9px] text-muted-foreground/60">{logs.length} Actions</span>
            </div>
            <div
                ref={logContainerRef}
                className={`flex flex-col gap-2 ${maxHeight} overflow-y-auto pr-1 scroll-smooth`}
            >
                {logs.map((log) => {
                    const Icon = log.icon;
                    const variantStyle = getLogVariantStyles(log.type);

                    return (
                        <div
                            key={log.id}
                            className={`flex items-start gap-2.5 text-[11px] p-2.5 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-1 ${variantStyle}`}
                        >
                            <div className="p-1 rounded-md bg-background/60 border border-current/20 shrink-0 mt-0.5">
                                <Icon className={`size-3.5 ${log.colorClass}`} />
                            </div>

                            <div className="flex flex-col gap-0.5 w-full">
                                {log.type === "attack" && log.attackerName ? (
                                    <div className="flex flex-wrap items-center gap-1 leading-snug">
                                        <span className="font-bold text-foreground">{log.attackerName}</span>
                                        <span className="text-muted-foreground">used</span>
                                        {log.powerName && (
                                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px] border border-primary/20">
                                                {log.powerName}{log.actionName && log.actionName !== log.powerName ? `: ${log.actionName}` : ""}
                                            </span>
                                        )}
                                        <span className="text-muted-foreground">vs</span>
                                        <span className="font-semibold text-foreground">{log.defenderName}</span>
                                    </div>
                                ) : log.type === "ko" && log.attackerName ? (
                                    <div className="flex flex-wrap items-center gap-1 leading-snug">
                                        <span className="font-bold text-orange-400">K.O.</span>
                                        <span className="font-bold text-foreground">{log.defenderName}</span>
                                        <span className="text-muted-foreground">was taken down by {log.attackerName}'s {log.powerName}</span>
                                    </div>
                                ) : (
                                    <span className="leading-snug font-medium text-foreground">
                                        {log.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}