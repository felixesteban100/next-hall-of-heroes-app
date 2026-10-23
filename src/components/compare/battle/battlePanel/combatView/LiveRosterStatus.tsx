"use client";

import { useMemo } from "react";
import { Crown, Shield, Skull, Swords } from "lucide-react";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare";

import { cn } from "@/lib/utils";
import { FighterState, Log } from "../../BattlePanel";
import { CharacterImage } from "@/components/shared/CharacterImage";


type Props = {
    rosterA: FighterState[];
    rosterB: FighterState[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA: string;
    nameB: string;
    latestLog?: Log;
    isDialog?: boolean;
};

type EnrichedFighter = FighterState & {
    id: number;
    image: string;
    overall: number;
    imageFocus: string;
};

function enrichAndSort(
    roster: FighterState[],
    chars: CharacterWithJoinTeamUniversePowerEnemies[]
): EnrichedFighter[] {
    return chars
        .map((char) => {
            const fighter = roster.find((c) => c.name === char.name)!;

            return {
                ...fighter,
                id: char?.id ?? 0,
                image: char.images.md,
                overall: char?.powerstats
                    ? computeMatchScore(char as any).overall ?? fighter.overall
                    : fighter.overall,
                imageFocus: char.imageFocus
            };
        })
        .sort((a, b) => b.overall - a.overall);
}

export default function LiveRosterStatus({
    rosterA,
    rosterB,
    teamAChars,
    teamBChars,
    nameA,
    nameB,
    latestLog,
    isDialog = false,
}: Props) {
    const enrichedA = useMemo(
        () => enrichAndSort(rosterA, teamAChars),
        [rosterA, teamAChars]
    );
    const enrichedB = useMemo(
        () => enrichAndSort(rosterB, teamBChars),
        [rosterB, teamBChars]
    );

    // const totalFighters = enrichedA.length + enrichedB.length;

    // Dynamic avatar size based on team size and context
    const avatarSize = "w-14 h-14" /* isDialog
        ?"w-14 h-14"
    : totalFighters <= 4
        ? "w-12 h-12"
        : totalFighters <= 10
            ? "w-10 h-10"
            : totalFighters <= 16
                ? "w-9 h-9"
                : "w-8 h-8"; */

    const nameTextSize = isDialog ? "text-[10px] max-w-[72px]" : "text-[9px] max-w-[56px]";

    // MVP = highest overall alive fighter per team
    const mvpA = enrichedA.find((f) => f.isAlive)?.name;
    const mvpB = enrichedB.find((f) => f.isAlive)?.name;

    // Derive animation signals from the latest log
    const activeAttacker = latestLog?.type === "attack" || latestLog?.type === "ko" ? latestLog.attackerName : undefined;
    const activeDefender = latestLog?.type === "attack" ? latestLog.defenderName : undefined;
    const latestKO = latestLog?.type === "ko" ? latestLog.defenderName : undefined;
    const latestRevive = latestLog?.type === "revive" ? latestLog.defenderName : undefined;
    const latestHeal = latestLog?.type === "heal" ? latestLog.attackerName : undefined;
    const latestDefend = latestLog?.type === "defend" ? latestLog.defenderName : undefined;

    const renderFighter = (fighter: EnrichedFighter, isMvp: boolean, variant: "primary" | "secondary") => {
        const isAttacking = activeAttacker === fighter.name;
        const isDefending = latestDefend === fighter.name;
        const isBeingHit = activeDefender === fighter.name;
        const isKO = latestKO === fighter.name;
        const isReviving = latestRevive === fighter.name;
        const isHealing = latestHeal === fighter.name;

        const border = variant === "primary" ? "border-primary" : "border-secondary";
        const shadow = variant === "primary" ? "shadow-primary/60" : "shadow-secondary/60";
        const ring = variant === "primary" ? "ring-primary/80" : "ring-secondary/80";

        // Defender uses the opposite team's accent so both sides feel linked
        const defenderBorder = variant === "primary" ? "border-secondary" : "border-primary";
        const defenderShadow = variant === "primary" ? "shadow-secondary/50" : "shadow-primary/50";

        return (
            <div key={fighter.id} className="flex flex-col items-center gap-0.5">
                <div
                    className={cn(
                        "relative rounded-lg border-2 transition-all duration-300 shrink-0",
                        avatarSize,
                        !fighter.isAlive
                            ? "border-muted-foreground/20 opacity-40 grayscale"
                            : isKO
                                ? "border-orange-500 shadow-[0_0_10px_2px] shadow-orange-500/50 scale-95"
                                : isReviving
                                    ? "border-purple-300 shadow-[0_0_12px_3px] shadow-purple-300/90 animate-pulse"
                                    : isHealing
                                        ? "border-emerald-400 shadow-[0_0_8px_2px] shadow-emerald-400/50"
                                        : isDefending
                                            ? "border-cyan-400 shadow-[0_0_6px_2px] shadow-cyan-400/40"
                                            : isAttacking
                                                ? `${border} shadow-[0_0_8px_2px] ${shadow} scale-105`
                                                : isBeingHit
                                                    ? `${defenderBorder} shadow-[0_0_8px_2px] ${defenderShadow} scale-95`
                                                    : isMvp
                                                        ? border
                                                        : border
                    )}
                    style={isKO ? { animation: "shake 0.4s ease-in-out both" } : undefined}
                >
                    <CharacterImage
                        src={fighter.image}
                        alt={`${fighter.name}-${fighter.id}`}
                        fill
                        className="w-13 h-13 object-cover object-top rounded-md"
                        imageFocus={fighter.imageFocus}
                    />

                    {isMvp && (
                        <div
                            title={`Team MVP: ${fighter.name}`}
                            className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-black p-0.5 rounded-full shadow-md border border-background z-30 animate-pulse-gold"
                        >
                            <Crown className="size-2.5 sm:size-3 fill-black" />
                        </div>
                    )}

                    {/* KO overlay */}
                    {!fighter.isAlive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                            <Skull className="size-4 text-orange-400" />
                        </div>
                    )}

                    {/* Attacker ping ring */}
                    {isAttacking && fighter.isAlive && (
                        <div className={`absolute inset-0 rounded-lg ring-2 ${ring} animate-ping pointer-events-none`} />
                    )}

                    {/* Attacker sword badge */}
                    {isAttacking && fighter.isAlive && (
                        <div className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full shadow-md border border-background z-30 animate-corner-sword pointer-events-none flex items-center justify-center">
                            <Swords className="size-3 text-white" />
                        </div>
                    )}

                    {isDefending && fighter.isAlive && (
                        <div className="absolute -top-2 -left-2 bg-cyan-400 text-white p-1 rounded-full shadow-md border border-background z-30 animate-corner-sword pointer-events-none flex items-center justify-center">
                            <Shield className="size-3 text-white" />
                        </div>
                    )}

                    {/* Being-hit impact flash */}
                    {isBeingHit && fighter.isAlive && (
                        <div className="absolute inset-0 bg-red-400 animate-ping pointer-events-none rounded-md" />
                    )}

                    {/* Heal glow overlay */}
                    {isHealing && fighter.isAlive && (
                        <div className="absolute inset-0 bg-emerald-400/15 animate-pulse pointer-events-none rounded-md" />
                    )}

                    {/* Revive burst overlay */}
                    {isReviving && fighter.isAlive && (
                        <div className="absolute inset-0 bg-purple-300 animate-ping pointer-events-none rounded-md" />
                    )}

                    {/* Shield flash overlay */}
                    {isDefending && fighter.isAlive && (
                        <div className="absolute inset-0 bg-cyan-400/60 pointer-events-none rounded-md animate-shield-flash" />
                    )}
                </div>

                {/* Name */}
                <span className={cn(
                    "text-center leading-tight truncate font-medium",
                    nameTextSize,
                    fighter.isAlive ? "text-foreground/80" : "text-muted-foreground/50 line-through"
                )}>
                    {fighter.name}
                </span>
            </div>
        );
    };

    if (enrichedA.length === 0 && enrichedB.length === 0) return null;

    return (
        <div className="flex items-start gap-3">
            {/* Team A */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                    "font-bold uppercase tracking-wider text-primary truncate w-full text-center",
                    isDialog ? "text-[11px]" : "text-[10px]"
                )}>
                    {nameA}
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                    {enrichedA.map((f) => renderFighter(f, f.name === mvpA, "primary"))}
                </div>
            </div>

            {/* Divider */}
            <div className="self-stretch w-px bg-muted-foreground/20 mx-0.5 mt-5" />

            {/* Team B */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                    "font-bold uppercase tracking-wider text-secondary truncate w-full text-center",
                    isDialog ? "text-[11px]" : "text-[10px]"
                )}>
                    {nameB}
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                    {enrichedB.map((f) => renderFighter(f, f.name === mvpB, "secondary"))}
                </div>
            </div>
        </div>
    );
}

// "use client"

// import Image from "next/image";
// import { FighterState, Log } from "./BattlePanel";
// import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
// import { computeMatchScore } from "@/lib/compare";
// import { Crown, Swords } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// type Props = {
//     rosterA: FighterState[];
//     rosterB: FighterState[];
//     teamAChars?: CharacterWithJoinTeamUniversePowerEnemies[];
//     teamBChars?: CharacterWithJoinTeamUniversePowerEnemies[];
//     nameA?: string;
//     nameB?: string;
//     latestLog?: Log;
//     isDialog?: boolean;
// };

// export default function LiveRosterStatus({
//     rosterA,
//     rosterB,
//     teamAChars = [],
//     teamBChars = [],
//     nameA = "Team A",
//     nameB = "Team B",
//     latestLog,
//     isDialog = false
// }: Props) {
//     // Enrich and sort rosters
//     const enrichAndSort = (roster: FighterState[], chars: CharacterWithJoinTeamUniversePowerEnemies[]) => {
//         return roster.map(fighter => {
//             const matchedChar = chars.find(c => c.name === fighter.name);
//             const overall = matchedChar ? computeMatchScore(matchedChar).overall : fighter.overall;
//             return {
//                 ...fighter,
//                 overall,
//                 id: matchedChar?.id,
//                 image: matchedChar?.images?.md || matchedChar?.images?.sm || "/placeholder.png"
//             };
//         }).sort((a, b) => b.overall - a.overall);
//     };

//     const enrichedA = enrichAndSort(rosterA, teamAChars);
//     const enrichedB = enrichAndSort(rosterB, teamBChars);

//     const mvpA = enrichedA.length > 0 ? enrichedA[0].name : null;
//     const mvpB = enrichedB.length > 0 ? enrichedB[0].name : null;

//     const activeAttacker = latestLog?.attackerName;
//     const activeDefender = latestLog?.defenderName;

//     const avatarSize = isDialog ? "w-10 h-10 sm:w-12 sm:h-12" : "w-7 h-7 sm:w-8 sm:h-8";
//     const nameTextSize = isDialog ? "text-[10px] max-w-24 px-1.5 py-0.5" : "text-[9px] max-w-16 px-1 py-0";
//     const gapSize = isDialog ? "gap-2" : "gap-1";

//     const renderRosterGrid = (fighters: ReturnType<typeof enrichAndSort>, variant: "primary" | "secondary", teamMvp: string | null) => {
//         const border = variant === "primary" ? "border-primary" : "border-secondary";
//         const nameColor = variant === "primary" ? "text-primary" : "text-secondary";

//         const activeRing = variant === "primary"
//             ? "ring-2 ring-offset-1 ring-primary shadow-lg shadow-primary/50 scale-110 z-20"
//             : "ring-2 ring-offset-1 ring-secondary shadow-lg shadow-secondary/50 scale-110 z-20";

//         return (
//             <div className={`flex flex-wrap ${gapSize} items-center justify-center`}>
//                 {fighters.map((fighter, idx) => {
//                     const isActive = fighter.name === activeAttacker || fighter.name === activeDefender;
//                     const isMvp = fighter.name === teamMvp;

//                     // Match conditions for specific log animations
//                     const isDefending = latestLog?.type === "defend" && fighter.name === latestLog?.defenderName;
//                     const isReviving = latestLog?.type === "revive" && fighter.name === latestLog?.defenderName;

//                     return (
//                         <div
//                             key={fighter.id || idx}
//                             className={`flex flex-col items-center transition-all duration-300 ${fighter.isAlive ? "opacity-100" : "opacity-40 grayscale line-through"
//                                 }`}
//                         >
//                             <div
//                                 className={`relative ${avatarSize} rounded-md border-2 ${border} bg-card shrink-0 overflow-visible transition-all duration-300 ease-out ${isActive ? activeRing : "shadow-sm"
//                                     }`}
//                                 style={!fighter.isAlive ? { animation: "shake 0.4s ease-in-out both" } : undefined}
//                                 title={fighter.name}
//                             >
//                                 <Image
//                                     src={fighter.image}
//                                     alt={fighter.name}
//                                     fill
//                                     className="object-cover rounded-md overflow-hidden"
//                                     unoptimized
//                                 />

//                                 {/* MVP Crown Badge */}
//                                 {isMvp && (
//                                     <div
//                                         title={`Team MVP: ${fighter.name}`}
//                                         className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-black p-0.5 rounded-full shadow-md border border-background z-30 animate-pulse-gold"
//                                     >
//                                         <Crown className="size-2.5 sm:size-3 fill-black" />
//                                     </div>
//                                 )}

//                                 {/* 1. Healing Glow & Ripple Effect */}
//                                 {latestLog &&
//                                     (
//                                         ((latestLog.type && ["heal", "healing", "buff"].includes(latestLog.type.toLowerCase())) ||
//                                             (latestLog.actionName && ["heal", "healing", "buff"].includes(latestLog.actionName.toLowerCase())) ||
//                                             (latestLog.text && latestLog.text.toLowerCase().includes("heal"))) &&
//                                         !(latestLog.text?.toLowerCase().includes("regeneration") || latestLog.text?.toLowerCase().includes("regen"))
//                                     ) &&
//                                     (
//                                         fighter.name === latestLog.defenderName ||
//                                         fighter.name === latestLog.attackerName ||
//                                         fighter.name === (latestLog as any).targetName ||
//                                         fighter.name === (latestLog as any).recipientName
//                                     ) &&
//                                     fighter.isAlive && (
//                                         <>
//                                             {/* Expanding Ping Ripple Wave */}
//                                             <div className="absolute inset-0 rounded-md border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none z-30" />
//                                             {/* Persistent Emerald Glow Frame */}
//                                             <div className="absolute inset-0 rounded-md border-2 border-emerald-400 bg-emerald-400/25 shadow-lg shadow-emerald-500/50 pointer-events-none z-20 animate-pulse" />
//                                         </>
//                                     )
//                                 }

//                                 {/* 2. Defensive Shield Flash Animation */}
//                                 {isDefending && fighter.isAlive && (
//                                     <div className="absolute inset-0 rounded-md border-2 border-cyan-400 bg-cyan-400/30 z-30 pointer-events-none animate-shield-flash" />
//                                 )}

//                                 {/* 3. Revive Burst Animation */}
//                                 {isReviving && (
//                                     <div className="absolute inset-0 rounded-md border-2 border-amber-400 bg-amber-400/40 z-30 pointer-events-none animate-revive-burst" />
//                                 )}

//                                 {/* 4. Moving Sword Attack Indicator in Corner */}
//                                 {latestLog?.type === "attack" && fighter.name === activeAttacker && fighter.isAlive && (
//                                     <div className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full shadow-md border border-background z-30 animate-corner-sword pointer-events-none flex items-center justify-center">
//                                         <Swords className="size-3 text-white" />
//                                     </div>
//                                 )}

//                                 {/* K.O. Skull Overlay */}
//                                 {!fighter.isAlive && !isReviving && (
//                                     <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-[10px] sm:text-xs z-20 animate-in zoom-in-50 duration-200">
//                                         💀
//                                     </div>
//                                 )}
//                             </div>
//                             <span className={`${nameTextSize} rounded-full bg-muted/50 truncate text-center ${nameColor}`}>
//                                 {fighter.name}
//                             </span>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//     const intrinsicRecipientCheck = (log: Log, fighterName: string): boolean => {
//         return Boolean(
//             fighterName === log.attackerName ||
//             fighterName === (log as any).targetName ||
//             fighterName === (log as any).recipientName
//         );
//     };

//     return (
//         <div className={`grid grid-cols-2 ${isDialog ? "gap-4 p-2" : "gap-2 p-1"}`}>
//             <div className="flex flex-col items-center border-r border-muted-foreground/20 pr-1 sm:pr-2">
//                 {isDialog && (
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
//                         {nameA}
//                     </span>
//                 )}
//                 {renderRosterGrid(enrichedA, "primary", mvpA)}
//             </div>
//             <div className="flex flex-col items-center pl-1 sm:pl-2">
//                 {isDialog && (
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
//                         {nameB}
//                     </span>
//                 )}
//                 {renderRosterGrid(enrichedB, "secondary", mvpB)}
//             </div>
//         </div>
//     );
// }