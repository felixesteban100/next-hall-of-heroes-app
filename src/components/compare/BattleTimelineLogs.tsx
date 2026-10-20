// components/compare/BattleTimelineLogs.tsx
"use client"

import { Activity, Swords } from "lucide-react";
import { Log } from "./BattlePanel";
import { useEffect, useRef } from "react";

export default function BattleTimelineLogs({ logs, maxHeight = "h-[140px]" }: { logs: Log[], maxHeight?: string }) {
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log container with smooth animation
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTo({
                top: logContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [logs]);

    // Inside BattleTimelineLogs.tsx -> getLogVariantStyles or direct item rendering:
    const getLogVariantStyles = (type: string) => {
        switch (type) {
            case "heal":
                return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border-l-4 border-l-emerald-400";
            case "defend":
                return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 border-l-4 border-l-cyan-400";
            case "revive":
                return "bg-amber-500/10 border-amber-500/30 text-amber-400 border-l-4 border-l-amber-400";
            case "ko":
                return "bg-orange-500/15 border-orange-500/40 text-orange-400 border-l-4 border-l-orange-500 shadow-orange-500/10 animate-flash-red";
            case "finish":
            case "rout":
                return "bg-primary/15 border-primary/50 text-primary font-bold border-l-4 border-l-primary shadow-primary/15 animate-flash-red";
            default:
                return "bg-muted/20 border-muted-foreground/15 text-foreground/90 border-l-2 border-l-muted-foreground/30";
        }
    };

    return (
        <div className="pt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                <span className="flex items-center gap-1.5">
                    <Activity className="size-3 text-primary animate-pulse" /> Live Engagement Log
                </span>
                <span className="text-[9px] text-muted-foreground/60 transition-all">
                    {logs.length} Actions
                </span>
            </div>

            <div
                ref={logContainerRef}
                className={`flex flex-col gap-2 ${maxHeight} overflow-y-auto pr-1 scroll-smooth`}
            >
                {logs.length === 0 ? (
                    <div className="h-full min-h-[100px] border border-dashed border-muted-foreground/25 rounded-lg p-4 text-center flex flex-col items-center justify-center gap-1.5 bg-muted/10 text-muted-foreground transition-all">
                        <Swords className="size-5 text-muted-foreground/50 animate-pulse" />
                        <p className="text-[11px] font-semibold text-foreground/80">
                            Awaiting Combat Engagement
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 max-w-[200px] leading-tight">
                            Click <span className="font-semibold text-foreground/90">"Start"</span> to start streaming live tactical logs.
                        </p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const Icon = log.icon;
                        const variantStyle = getLogVariantStyles(log.type);

                        return (
                            <div
                                key={log.id}
                                className={`flex items-start gap-2.5 text-[11px] p-2.5 rounded-lg border transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 ${variantStyle}`}
                            >
                                <div className="p-1 rounded-md bg-background/60 border border-current/20 shrink-0 mt-0.5 shadow-sm">
                                    <Icon className={`size-3.5 ${log.colorClass}`} />
                                </div>

                                <div className="flex flex-col gap-0.5 w-full">
                                    {log.type === "attack" && log.attackerName ? (
                                        <div className="flex flex-wrap items-center gap-1 leading-snug">
                                            <span className="font-bold text-foreground">{log.attackerName}</span>
                                            <span className="text-muted-foreground">used</span>
                                            {log.powerName && (
                                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px] border border-primary/20 shadow-xs">
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
                    })
                )}
            </div>
        </div>
    );
}