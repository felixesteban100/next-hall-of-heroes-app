"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";
import { FighterState, Log } from "../BattlePanel";
import { computeMatchScore } from "@/lib/compare";
import { resolveActivePower } from "@/lib/compare/cinematicCombatView";
import HPBar from "./cinematicCombatView/HPBar";
import ClashCard from "./cinematicCombatView/ClashCard";
import TeamColumn from "./cinematicCombatView/TeamColumn";
import LogRow from "./cinematicCombatView/LogRow";

export type EnrichedFighter = FighterState & {
    id: number;
    image: string;
    imageFocus: string;
    overall: number;
};

export type ActionEvent = {
    key: number;
    log: Log;
    attacker?: EnrichedFighter;
    defender?: EnrichedFighter;
    activePower?: Power;
};

function isFighterAliveCurrently(fighterName: string, logs: Log[]): boolean {
    for (let i = logs.length - 1; i >= 0; i--) {
        const log = logs[i];
        if (log.type === "revive" && (log.defenderName === fighterName || log.attackerName === fighterName)) {
            return true;
        }
        if (log.type === "ko" && log.defenderName === fighterName) {
            return false;
        }
    }
    return true;
}

function enrich(
    roster: FighterState[],
    chars: CharacterWithJoinTeamUniversePowerEnemies[],
    visibleLogs: Log[]
): EnrichedFighter[] {
    return chars.map((char) => {
        const currentlyAlive = isFighterAliveCurrently(char.name, visibleLogs);
        const fighter = roster.find((c) => c.name === char.name) ?? {
            name: char.name ?? "Unknown",
            overall: 50,
            isAlive: currentlyAlive,
        };
        return {
            ...fighter,
            isAlive: currentlyAlive,
            id: char.id ?? 0,
            image: char.images?.md ?? "",
            imageFocus: char.imageFocus ?? "50% 18%",
            overall: char.powerstats ? (computeMatchScore(char as any).overall ?? 50) : 50,
        };
    }).sort((a, b) => b.overall - a.overall);
}

type Props = {
    rosterA: FighterState[];
    rosterB: FighterState[];
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
    nameA: string;
    nameB: string;
    healthA: number;
    healthB: number;
    visibleLogs: Log[];
    isDialog?: boolean;
};

export default function CinematicCombatView({
    rosterA, rosterB,
    teamAChars, teamBChars,
    nameA, nameB,
    healthA, healthB,
    visibleLogs,
    isDialog = false,
}: Props) {
    const enrichedA = enrich(rosterA, teamAChars, visibleLogs);
    const enrichedB = enrich(rosterB, teamBChars, visibleLogs);
    const allChars = [...teamAChars, ...teamBChars];
    const logRef = useRef<HTMLDivElement>(null);

    const latestLog = visibleLogs[visibleLogs.length - 1];
    const [currentEvent, setCurrentEvent] = useState<ActionEvent | null>(null);

    useEffect(() => {
        if (!latestLog || visibleLogs.length === 0) {
            setCurrentEvent(null);
            return;
        }

        const all = [...enrichedA, ...enrichedB];
        const find = (name?: string) => name ? all.find((f) => f.name === name) : undefined;
        const attackerFighter = find(latestLog.attackerName);

        setCurrentEvent({
            key: latestLog.id,
            log: latestLog,
            attacker: attackerFighter,
            defender: find(latestLog.defenderName),
            activePower: resolveActivePower(latestLog, attackerFighter, allChars),
        });
    }, [latestLog?.id, visibleLogs.length]);

    useEffect(() => {
        if (logRef.current)
            logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, [visibleLogs.length]);

    const mvpA = enrichedA.find((f) => f.isAlive)?.name;
    const mvpB = enrichedB.find((f) => f.isAlive)?.name;

    const activeAttacker = (latestLog?.type === "attack" || latestLog?.type === "ko") ? latestLog.attackerName : undefined;
    const activeDefender = latestLog?.type === "attack" ? latestLog.defenderName : undefined;
    const latestKO = latestLog?.type === "ko" ? latestLog.defenderName : undefined;
    const latestHeal = latestLog?.type === "heal" ? latestLog.attackerName : undefined;
    const latestRevive = latestLog?.type === "revive" ? latestLog.defenderName : undefined;
    const latestDefend = latestLog?.type === "defend" ? latestLog.defenderName : undefined;

    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4 w-full max-w-full overflow-hidden">
            {/* HP bars */}
            <div className="flex items-center gap-3 sm:gap-5 px-1">
                <HPBar health={healthA} name={nameA} variant="primary" />
                <div className="shrink-0 p-1.5 sm:p-2 rounded-full border border-muted-foreground/20 bg-muted/30">
                    <Zap className="size-3 sm:size-3.5 animate-pulse text-green-400" />
                </div>
                <HPBar health={healthB} name={nameB} variant="secondary" />
            </div>

            {/* 📱 MOBILE VIEW */}
            <div className="flex flex-col gap-4 w-full md:hidden">
                <div className="w-full rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-hidden min-h-[180px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <ClashCard event={currentEvent} allChars={allChars} teamAChars={teamAChars} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 w-full gap-3 items-start">
                    <TeamColumn
                        fighters={enrichedA} variant="primary" mvp={mvpA}
                        activeAttacker={activeAttacker} activeDefender={activeDefender}
                        latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                        isDialog={isDialog}
                    />
                    <TeamColumn
                        fighters={enrichedB} variant="secondary" mvp={mvpB}
                        activeAttacker={activeAttacker} activeDefender={activeDefender}
                        latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                        isDialog={isDialog}
                    />
                </div>
            </div>

            {/* 🖥️ DESKTOP VIEW */}
            <div className="hidden md:flex items-center justify-between gap-4 w-full">
                <TeamColumn
                    fighters={enrichedA} variant="primary" mvp={mvpA}
                    activeAttacker={activeAttacker} activeDefender={activeDefender}
                    latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                    isDialog={isDialog}
                />

                <div className={cn(
                    "shrink-0 rounded-2xl border border-muted-foreground/25 bg-card/85 backdrop-blur-md overflow-hidden min-h-[200px] flex items-center justify-center",
                    isDialog ? "w-[300px]" : "w-[340px] lg:w-[380px]"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEvent?.key ?? "idle"}
                            initial={{ opacity: 0, scale: 0.94, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <ClashCard event={currentEvent} allChars={allChars} teamAChars={teamAChars} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <TeamColumn
                    fighters={enrichedB} variant="secondary" mvp={mvpB}
                    activeAttacker={activeAttacker} activeDefender={activeDefender}
                    latestKO={latestKO} latestHeal={latestHeal} latestRevive={latestRevive} latestDefend={latestDefend}
                    isDialog={isDialog}
                />
            </div>

            {/* Combat feed */}
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    <span className="flex items-center gap-1.5">
                        <Activity className="size-3.5 animate-pulse text-amber-500" />
                        Combat Feed
                    </span>
                    <span className="text-muted-foreground/60 font-mono">{visibleLogs.length} events</span>
                </div>
                <div
                    ref={logRef}
                    className={cn(
                        "flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 scroll-smooth",
                        isDialog ? "h-[160px]" : "h-[140px]"
                    )}
                >
                    {visibleLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/50 italic">
                            Waiting for combat to start…
                        </div>
                    ) : (
                        visibleLogs.map((log) => <LogRow key={log.id} log={log} />)
                    )}
                </div>
            </div>
        </div>
    );
}