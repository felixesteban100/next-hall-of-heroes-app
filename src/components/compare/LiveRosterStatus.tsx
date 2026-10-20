"use client"

import Image from "next/image";
import { FighterState, Log } from "./BattlePanel";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare/compare_utls";
import { Crown, Swords } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
    rosterA: FighterState[];
    rosterB: FighterState[];
    teamAChars?: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars?: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA?: string;
    nameB?: string;
    latestLog?: Log;
    isDialog?: boolean;
};

export default function LiveRosterStatus({
    rosterA,
    rosterB,
    teamAChars = [],
    teamBChars = [],
    nameA = "Team A",
    nameB = "Team B",
    latestLog,
    isDialog = false
}: Props) {
    // Enrich and sort rosters
    const enrichAndSort = (roster: FighterState[], chars: CharacterWithJoinTeamUniversePowerEnemies[]) => {
        return roster.map(fighter => {
            const matchedChar = chars.find(c => c.name === fighter.name);
            const overall = matchedChar ? computeMatchScore(matchedChar).overall : fighter.overall;
            return {
                ...fighter,
                overall,
                id: matchedChar?.id,
                image: matchedChar?.images?.md || matchedChar?.images?.sm || "/placeholder.png"
            };
        }).sort((a, b) => b.overall - a.overall);
    };

    const enrichedA = enrichAndSort(rosterA, teamAChars);
    const enrichedB = enrichAndSort(rosterB, teamBChars);

    const mvpA = enrichedA.length > 0 ? enrichedA[0].name : null;
    const mvpB = enrichedB.length > 0 ? enrichedB[0].name : null;

    const activeAttacker = latestLog?.attackerName;
    const activeDefender = latestLog?.defenderName;

    const avatarSize = isDialog ? "w-10 h-10 sm:w-12 sm:h-12" : "w-7 h-7 sm:w-8 sm:h-8";
    const nameTextSize = isDialog ? "text-[10px] max-w-24 px-1.5 py-0.5" : "text-[9px] max-w-16 px-1 py-0";
    const gapSize = isDialog ? "gap-2" : "gap-1";

    const renderRosterGrid = (fighters: ReturnType<typeof enrichAndSort>, variant: "primary" | "secondary", teamMvp: string | null) => {
        const border = variant === "primary" ? "border-primary" : "border-secondary";
        const nameColor = variant === "primary" ? "text-primary" : "text-secondary";

        const activeRing = variant === "primary"
            ? "ring-2 ring-offset-1 ring-primary shadow-lg shadow-primary/50 scale-110 z-20"
            : "ring-2 ring-offset-1 ring-secondary shadow-lg shadow-secondary/50 scale-110 z-20";

        return (
            <div className={`flex flex-wrap ${gapSize} items-center justify-center`}>
                {fighters.map((fighter, idx) => {
                    const isActive = fighter.name === activeAttacker || fighter.name === activeDefender;
                    const isMvp = fighter.name === teamMvp;

                    // Match conditions for specific log animations
                    const isDefending = latestLog?.type === "defend" && fighter.name === latestLog?.defenderName;
                    const isReviving = latestLog?.type === "revive" && fighter.name === latestLog?.defenderName;

                    return (
                        <div
                            key={fighter.id || idx}
                            className={`flex flex-col items-center transition-all duration-300 ${fighter.isAlive ? "opacity-100" : "opacity-40 grayscale line-through"
                                }`}
                        >
                            <div
                                className={`relative ${avatarSize} rounded-md border-2 ${border} bg-card shrink-0 overflow-visible transition-all duration-300 ease-out ${isActive ? activeRing : "shadow-sm"
                                    }`}
                                style={!fighter.isAlive ? { animation: "shake 0.4s ease-in-out both" } : undefined}
                                title={fighter.name}
                            >
                                <Image
                                    src={fighter.image}
                                    alt={fighter.name}
                                    fill
                                    className="object-cover rounded-md overflow-hidden"
                                    unoptimized
                                />

                                {/* MVP Crown Badge */}
                                {isMvp && (
                                    <div
                                        title={`Team MVP: ${fighter.name}`}
                                        className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-black p-0.5 rounded-full shadow-md border border-background z-30 animate-pulse-gold"
                                    >
                                        <Crown className="size-2.5 sm:size-3 fill-black" />
                                    </div>
                                )}

                                {/* 1. Healing Glow & Ripple Effect */}
                                {/* 1. Healing Glow & Ripple Effect */}
                                {latestLog &&
                                    (
                                        ((latestLog.type && ["heal", "healing", "buff"].includes(latestLog.type.toLowerCase())) ||
                                            (latestLog.actionName && ["heal", "healing", "buff"].includes(latestLog.actionName.toLowerCase())) ||
                                            (latestLog.text && latestLog.text.toLowerCase().includes("heal"))) &&
                                        !(latestLog.text?.toLowerCase().includes("regeneration") || latestLog.text?.toLowerCase().includes("regen"))
                                    ) &&
                                    (
                                        fighter.name === latestLog.defenderName ||
                                        fighter.name === latestLog.attackerName ||
                                        fighter.name === (latestLog as any).targetName ||
                                        fighter.name === (latestLog as any).recipientName
                                    ) &&
                                    fighter.isAlive && (
                                        <>
                                            {/* Expanding Ping Ripple Wave */}
                                            <div className="absolute inset-0 rounded-md border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none z-30" />
                                            {/* Persistent Emerald Glow Frame */}
                                            <div className="absolute inset-0 rounded-md border-2 border-emerald-400 bg-emerald-400/25 shadow-lg shadow-emerald-500/50 pointer-events-none z-20 animate-pulse" />
                                        </>
                                    )
                                }

                                {/* 2. Defensive Shield Flash Animation */}
                                {isDefending && fighter.isAlive && (
                                    <div className="absolute inset-0 rounded-md border-2 border-cyan-400 bg-cyan-400/30 z-30 pointer-events-none animate-shield-flash" />
                                )}

                                {/* 3. Revive Burst Animation */}
                                {isReviving && (
                                    <div className="absolute inset-0 rounded-md border-2 border-amber-400 bg-amber-400/40 z-30 pointer-events-none animate-revive-burst" />
                                )}

                                {/* 4. Moving Sword Attack Indicator in Corner */}
                                {latestLog?.type === "attack" && fighter.name === activeAttacker && fighter.isAlive && (
                                    <div className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full shadow-md border border-background z-30 animate-corner-sword pointer-events-none flex items-center justify-center">
                                        <Swords className="size-3 text-white" />
                                    </div>
                                )}

                                {/* K.O. Skull Overlay */}
                                {!fighter.isAlive && !isReviving && (
                                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-[10px] sm:text-xs z-20 animate-in zoom-in-50 duration-200">
                                        💀
                                    </div>
                                )}
                            </div>
                            <span className={`${nameTextSize} rounded-full bg-muted/50 truncate text-center ${nameColor}`}>
                                {fighter.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const intrinsicRecipientCheck = (log: Log, fighterName: string): boolean => {
        return Boolean(
            fighterName === log.attackerName ||
            fighterName === (log as any).targetName ||
            fighterName === (log as any).recipientName
        );
    };

    return (
        <div className={`grid grid-cols-2 ${isDialog ? "gap-4 p-2" : "gap-2 p-1"}`}>
            <div className="flex flex-col items-center border-r border-muted-foreground/20 pr-1 sm:pr-2">
                {isDialog && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {nameA}
                    </span>
                )}
                {renderRosterGrid(enrichedA, "primary", mvpA)}
            </div>
            <div className="flex flex-col items-center pl-1 sm:pl-2">
                {isDialog && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {nameB}
                    </span>
                )}
                {renderRosterGrid(enrichedB, "secondary", mvpB)}
            </div>
        </div>
    );
}