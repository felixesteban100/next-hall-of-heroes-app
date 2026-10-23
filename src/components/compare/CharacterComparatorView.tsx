"use client"

import { CompareMode } from "@/lib/compare/compareParams";
import { BattlePanel } from "@/components/compare/battle/BattlePanel";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import { MemberBreakdown } from "@/components/compare/MembersBreakdown";
import { RowGroupedPills } from "@/components/compare/rows/RowGroupedPills";
import { RowGroupedBadges } from "@/components/compare/rows/RowGroupedBadges";
import { computeTeamChemistry } from "@/lib/compare/teamChemistry";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { MatchPredictionOverlay } from "./battle/MatchPredictionOverlay";
import { cn } from "@/lib/utils";
import { TeamTacticalOverview } from "./battle/TeamTacticalOverview";
import { StatsRadar } from "./stats/StatRadar";
import { Zap } from "lucide-react";
import MatchVerdict from "./battle/MatchVerdict";
import { TeamProfileSlot } from "./stats/TeamProfileSlot";
import { ProfileSlot } from "./stats/ProfileSlot";
import { avgTeamPowerstats, groupAlignments, groupClasses, groupEnemies, groupGenders, groupPowers, groupPublishers, groupRaces, groupTeams, groupTiers, groupWeaknesses, hasNemesisLink, radarData, radarDataFromStats, TeamAggregate } from "@/lib/compare";
import { PowerFormulaTab } from "./PowerFormulaTab";


type CompareTab = "overview" | "combat" | "stats" | "info" | "calculations";

const TABS: { id: CompareTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "combat", label: "Combat" },
    { id: "stats", label: "Stats" },
    { id: "info", label: "Info" },
    { id: "calculations", label: "Calculations" },
];

type CharacterComparatorViewProps = {
    mode: CompareMode;
    idsA: number[]
    idsB: number[]
    teamA: TeamAggregate,
    teamB: TeamAggregate,
    entitiesA: CharacterWithJoinTeamUniversePowerEnemies[],
    entitiesB: CharacterWithJoinTeamUniversePowerEnemies[],
    entityA: CharacterWithJoinTeamUniversePowerEnemies,
    entityB: CharacterWithJoinTeamUniversePowerEnemies,
    entityAName: string,
    entityBName: string
}

export default function CharacterComparatorView({ mode, teamA, teamB, entitiesA, entitiesB, entityA, entityB, entityAName, entityBName, idsA, idsB }: CharacterComparatorViewProps) {
    const [showPredictionOverlay, setShowPredictionOverlay] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<CompareTab>("overview");

    // Create a composite key that changes whenever IDs, team lists, or modes change
    const matchKey = `${mode}-${idsA}-${idsB}`;

    // Reset prediction overlay and tab to 'overview' every time the match context changes
    useEffect(() => {
        setShowPredictionOverlay(true);
        setActiveTab("overview");
    }, [matchKey]);

    // Determine actual winner based on overall scores calculated by your backend/lib
    const actualWinner = useMemo(() => {
        const valA = teamA.powerEstimate;
        const valB = teamB.powerEstimate;

        if (valA === 0 && valB === 0) return "Draw";

        const d = valA - valB;
        const maxVal = Math.max(valA, valB, 1);
        const pct = Math.abs(d) / maxVal;

        if (pct < 0.06) return "Draw";

        if (valA > valB) return "A";
        if (valB > valA) return "B";
        return "Draw";
    }, [teamA, teamB]);

    // Nemesis: any pair across teams, or only 1v1
    const isNemesis = useMemo(() => {
        const validA = entitiesA.filter(Boolean);
        const validB = entitiesB.filter(Boolean);
        return validA.some((a) => validB.some((b) => hasNemesisLink(a, b)));
    }, [mode, entitiesA, entitiesB, entityA, entityB]);

    const nemesisPairs = useMemo(() => {
        if (mode !== "team") return [];
        const validA = entitiesA.filter(Boolean);
        const validB = entitiesB.filter(Boolean);
        return validA.flatMap(a =>
            validB.filter(b => hasNemesisLink(a, b)).map(b => ({ nameA: a.name, nameB: b.name }))
        );
    }, [mode, entitiesA, entitiesB]);

    // Radar: team avg powerstats or single
    const radar =
        mode === "team"
            ? radarDataFromStats(avgTeamPowerstats(entitiesA), avgTeamPowerstats(entitiesB))
            : radarData(entityA, entityB);

    const hasA = entitiesA.length > 0;
    const hasB = entitiesB.length > 0;

    const rowsBadges = [
        { label: "Publisher", functionGroup: groupPublishers, BadgeComponent: RowGroupedBadges, images: true },
        { label: "Tier", functionGroup: groupTiers, BadgeComponent: RowGroupedBadges },
        { label: "Class", functionGroup: groupClasses, BadgeComponent: RowGroupedBadges },
        { label: "Alignment", functionGroup: groupAlignments, BadgeComponent: RowGroupedBadges },
        { label: "Race", functionGroup: groupRaces, BadgeComponent: RowGroupedBadges },
        { label: "Gender", functionGroup: groupGenders, BadgeComponent: RowGroupedBadges }
    ]

    const rowsPills = [
        { label: "Special Powers", functionGroup: groupPowers, BadgeComponent: RowGroupedPills },
        { label: "Weaknesses", functionGroup: groupWeaknesses, BadgeComponent: RowGroupedPills },
        { label: "Teams & Affiliations", functionGroup: groupTeams, BadgeComponent: RowGroupedPills },
        { label: "Primary Enemies", functionGroup: groupEnemies, BadgeComponent: RowGroupedPills },
    ]

    const hasBothSides = entitiesA.length > 0 && entitiesB.length > 0;

    const mvpA = teamA.aceName ?? "";
    const mvpB = teamB.aceName ?? "";

    return (
        <>
            <div className="relative w-full max-w-5xl">
                {(hasBothSides && showPredictionOverlay) && (
                    <MatchPredictionOverlay
                        entityAName={entityAName}
                        entityBName={entityBName}
                        entitiesA={entitiesA}
                        entitiesB={entitiesB}
                        actualWinner={actualWinner}
                        onReveal={() => setShowPredictionOverlay(false)}
                    />
                )}

                <div className={`transition-all duration-500 ${hasBothSides && showPredictionOverlay ? "filter blur-md pointer-events-none select-none opacity-50 max-h-[400px] overflow-hidden" : "opacity-100 max-h-none"}`}>

                    {/* Tab bar */}
                    <div className="flex gap-1 mb-4 border-b border-muted-foreground/20">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors relative",
                                    activeTab === tab.id
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="space-y-4 mb-4">
                            <MatchVerdict
                                nameA={entityAName}
                                nameB={entityBName}
                                isNemesis={isNemesis}
                                teamA={teamA ?? null}
                                teamB={teamB ?? null}
                                entitiesA={entitiesA}
                                entitiesB={entitiesB}
                            />

                            {isNemesis && (
                                <div className="relative my-4 overflow-hidden rounded-xl border border-red-500/10 bg-gradient-to-r from-red-950/10 via-red-900/10 to-red-950/10 p-3 ">
                                    {/* Ambient background glow pulse */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent animate-pulse pointer-events-none" />

                                    <div className="relative flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3 px-4 py-1 rounded-full border border-red-500/60 bg-red-500/15">
                                            <Zap className="h-3.5 w-3.5 text-red-400 fill-red-500 animate-bounce" />
                                            <span className="text-xs font-black tracking-widest uppercase text-red-400 drop-shadow">
                                                Rival Matchup Detected
                                            </span>
                                            <Zap className="h-3.5 w-3.5 text-red-400 fill-red-500 animate-bounce" />
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                                            {nemesisPairs.map(p => (
                                                <div
                                                    key={`${p.nameA}-${p.nameB}`}
                                                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background/60 border border-border/60 text-xs font-semibold tracking-wide text-foreground shadow-inner"
                                                >
                                                    <span className="text-primary">{p.nameA}</span>
                                                    <span className="text-red-500 font-mono text-[10px]">VS</span>
                                                    <span className="text-secondary">{p.nameB}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`mx-auto  border-muted-foreground/20 rounded-xl relative overflow-x-hidden bg-transparent border-1`}>
                                <div className="grid grid-cols-2 bg-card/10 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                                    {mode === "team" ? (
                                        <>
                                            <TeamProfileSlot
                                                entities={entitiesA}
                                                variant="primary"
                                                powerEstimate={teamA.powerEstimate}
                                                chemistry={computeTeamChemistry(entitiesA)}
                                                mvp={mvpA}
                                            />
                                            <TeamProfileSlot
                                                entities={entitiesB}
                                                variant="secondary"
                                                powerEstimate={teamB.powerEstimate}
                                                chemistry={computeTeamChemistry(entitiesB)}
                                                mvp={mvpB}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ProfileSlot entity={entityA} variant="primary" />
                                            <ProfileSlot entity={entityB} variant="secondary" />
                                        </>
                                    )}
                                </div>

                                {mode === "team" && (
                                    <MemberBreakdown entitiesA={entitiesA} entitiesB={entitiesB} mvpA={mvpA} mvpB={mvpB} />
                                )}
                            </div>
                            <div className="border border-muted-foreground/20 p-4 flex flex-col gap-3 justify-between rounded-md">
                                <TeamTacticalOverview
                                    entitiesA={entitiesA}
                                    entitiesB={entitiesB}
                                    nameA={entityAName}
                                    nameB={entityBName}
                                />
                            </div>
                        </div>
                    )}

                    {/* COMBAT TAB */}
                    {activeTab === "combat" && (
                        <div className="mb-4">
                            <BattlePanel
                                powerEstimateA={teamA.powerEstimate}
                                powerEstimateB={teamB.powerEstimate}
                                nameA={entityAName}
                                nameB={entityBName}
                                teamAChars={entitiesA}
                                teamBChars={entitiesB}
                            />
                        </div>
                    )}

                    {/* STATS TAB */}
                    {activeTab === "stats" && (
                        <div className={`mx-auto bg-card/40 border border-muted-foreground/20 rounded-xl relative mb-10 overflow-x-hidden`}>
                            <RowsHeader text={mode === "team" ? "Combat & Powerstats · team avg" : "Combat & Powerstats"} />
                            <RowScoreComparer
                                scoreA={mode === "team" ? avgTeamPowerstats(entitiesA) : entityA?.powerstats}
                                scoreB={mode === "team" ? avgTeamPowerstats(entitiesB) : entityB?.powerstats}
                                rows={[
                                    { label: "INTELLIGENCE", key: "intelligence" },
                                    { label: "STRENGTH", key: "strength" },
                                    { label: "SPEED", key: "speed" },
                                    { label: "DURABILITY", key: "durability" },
                                    { label: "POWER", key: "power" },
                                    { label: "COMBAT", key: "combat" },
                                    { label: "TOTAL", key: "total" },
                                ]}
                            />

                            <RowsHeader text="Match score breakdown" />
                            <RowScoreComparer
                                scoreA={teamA.avg}
                                scoreB={teamB.avg}
                                rows={[
                                    { label: "Average Powerstats", key: "averagePowerStats" },
                                    { label: "Tier", key: "tier" },
                                    { label: "Class", key: "class" },
                                    { label: "Powers", key: "powers" },
                                    { label: "Threat context", key: "threat" },
                                    { label: "Weakness penalty", key: "weaknessPenalty", isPenalty: true },
                                    { label: "Overall", key: "overall" },
                                ]}
                            />
                            <div className="border border-muted-foreground/20 p-4 flex flex-col gap-3 justify-between rounded-b-md">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                                        Stats radar
                                    </h3>
                                    <StatsRadar data={radar} nameA={entityAName} nameB={entityBName} showA={!!entityA && !showPredictionOverlay} showB={!!entityB && !showPredictionOverlay} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INFO TAB */}
                    {activeTab === "info" && (
                        <div className={`mx-auto bg-card/30 border border-muted-foreground/20 rounded-xl relative mb-10 overflow-x-hidden`}>
                            <RowsHeader text="General Information" />
                            {rowsBadges.map(row => (
                                <row.BadgeComponent
                                    key={row.label}
                                    label={row.label}
                                    hasA={hasA}
                                    hasB={hasB}
                                    groupA={row.functionGroup(entitiesA)}
                                    groupB={row.functionGroup(entitiesB)}
                                    showNames={mode === "team"}
                                    images={row.images}
                                />
                            ))}

                            <RowsHeader text="Powers & Connections" />
                            {rowsPills.map(row => (
                                <row.BadgeComponent
                                    key={row.label}
                                    label={row.label}
                                    hasA={hasA}
                                    hasB={hasB}
                                    groupA={row.functionGroup(entitiesA)}
                                    groupB={row.functionGroup(entitiesB)}
                                    showNames={mode === "team"}
                                />
                            ))}
                        </div>
                    )}

                    {/* FORMULA TAB */}
                    {activeTab === "calculations" && (
                        <PowerFormulaTab
                            sideA={entitiesA}
                            sideB={entitiesB}
                            labelA={entityAName}
                            labelB={entityBName}
                        />
                    )}

                </div>
            </div>
        </>
    )
}