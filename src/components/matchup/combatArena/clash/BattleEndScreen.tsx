import { ChevronRight, Activity, Trophy, Star, Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { CombatEvent, BattleMetadata } from "@/lib/matchup/combat/types/types";
import { TeamSection } from "./BattleEndTeamSection";
import { BattleEndAwards } from "./BattleEndAwards";
import { BattleEndSummary } from "./BattleEndSummary";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

// ── Battle End Screen ─────────────────────────────────────────────────────────

export function BattleEndScreen({
    isVictory,
    event,
    meta,
}: {
    isVictory: boolean;
    event: CombatEvent;
    meta: BattleMetadata | undefined;
}) {
    return (
        <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-xl flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 pb-2 pt-16 [scrollbar-width:none] sm:gap-3 sm:px-3">
            <BattleEndSummary isVictory={isVictory} event={event} meta={meta} />

            {/* ── Collapsible sections ── */}
            {meta && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="relative z-10 flex min-w-0 flex-col gap-2"
                >
                    <Accordion type="single" collapsible className="flex w-full flex-col gap-2">
                        {/* Overview */}
                        <AccordionItem
                            value="overview"
                            className="relative min-w-0 overflow-hidden rounded-lg border border-muted-foreground/15 bg-background"
                        >
                            <AccordionTrigger className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/10 px-3 py-2 text-left no-underline transition-colors hover:bg-muted/20 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Activity className="size-3.5 shrink-0 text-violet-400 sm:size-4" />
                                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-foreground/80 sm:text-xs">
                                        Overview
                                    </span>
                                </div>
                                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-90" />
                            </AccordionTrigger>
                            <AccordionContent className="mt-1 min-w-0 overflow-hidden rounded-lg border border-muted-foreground/20 bg-background shadow-xl">
                                <div
                                    className="p-2 sm:p-3"
                                    style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "thin" }}
                                >
                                    <div className="flex min-w-0 flex-col gap-2">
                                        {meta.longestStreak.streak > 1 && (
                                            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-2 py-2">
                                                <Flame className="size-3.5 shrink-0 text-green-400" />
                                                <span className="min-w-0 truncate text-[10px] font-bold text-yellow-300 sm:text-xs">
                                                    {meta.longestStreak.name}
                                                </span>
                                                <span className="shrink-0 text-[9px] text-muted-foreground sm:text-[10px]">
                                                    · {meta.longestStreak.streak}-hit streak
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-500/10 px-2 py-2">
                                            <Zap className="size-3.5 shrink-0 text-blue-400" />
                                            <span className="shrink-0 text-[9px] text-muted-foreground sm:text-[10px]">
                                                Hardest hit:
                                            </span>
                                            <span className="min-w-0 truncate text-right text-[10px] font-bold text-red-300 sm:text-xs">
                                                {meta.mostDamageSingleHit.damage} by {meta.mostDamageSingleHit.name.split(" ")[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Team A */}
                        <AccordionItem
                            value="teamA"
                            className="relative min-w-0 overflow-hidden rounded-lg border border-muted-foreground/15 bg-background"
                        >
                            <AccordionTrigger className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/10 px-3 py-2 text-left no-underline transition-colors hover:bg-muted/20 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Trophy className="size-3.5 shrink-0 text-primary sm:size-4" />
                                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-foreground/80 sm:text-xs">
                                        Team A Breakdown
                                    </span>
                                </div>
                                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-90" />
                            </AccordionTrigger>
                            <AccordionContent className="mt-1 min-w-0 overflow-hidden rounded-lg border border-muted-foreground/20 bg-background shadow-xl">
                                <div className="p-2 sm:p-3">
                                    <TeamSection
                                        label="Team A"
                                        fighters={meta.teamAStats}
                                        mvp={meta.mvpA}
                                        variant="primary"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Team B */}
                        <AccordionItem
                            value="teamB"
                            className="relative min-w-0 overflow-hidden rounded-lg border border-muted-foreground/15 bg-background"
                        >
                            <AccordionTrigger className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/10 px-3 py-2 text-left no-underline transition-colors hover:bg-muted/20 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Trophy className="size-3.5 shrink-0 text-secondary sm:size-4" />
                                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-foreground/80 sm:text-xs">
                                        Team B Breakdown
                                    </span>
                                </div>
                                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-90" />
                            </AccordionTrigger>
                            <AccordionContent className="mt-1 min-w-0 overflow-hidden rounded-lg border border-muted-foreground/20 bg-background shadow-xl">
                                <div className="p-2 sm:p-3">
                                    <TeamSection
                                        label="Team B"
                                        fighters={meta.teamBStats}
                                        mvp={meta.mvpB}
                                        variant="secondary"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Awards */}
                        <AccordionItem
                            value="awards"
                            className="relative min-w-0 overflow-hidden rounded-lg border border-muted-foreground/15 bg-background"
                        >
                            <AccordionTrigger className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/10 px-3 py-2 text-left no-underline transition-colors hover:bg-muted/20 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Star className="size-3.5 shrink-0 text-amber-400 sm:size-4" />
                                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-foreground/80 sm:text-xs">
                                        Awards
                                    </span>
                                </div>
                                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-90" />
                            </AccordionTrigger>
                            <AccordionContent className="mt-1 min-w-0 overflow-hidden rounded-lg border border-muted-foreground/20 bg-background shadow-xl">
                                <div className="p-2 sm:p-3">
                                    <BattleEndAwards meta={meta} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </motion.div>
            )}
        </div>
    );
}