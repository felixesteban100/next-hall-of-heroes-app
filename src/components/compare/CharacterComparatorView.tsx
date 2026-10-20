"use client"

import { CompareMode } from "@/lib/compare/compareParams";
import { groupAlignments, groupClasses, groupEnemies, groupGenders, groupPowers, groupPublishers, groupRaces, groupTeams, groupTiers, groupWeaknesses, avgTeamPowerstats, hasNemesisLink, radarData, radarDataFromStats, TeamAggregate, MatchBreakdown, simulateSpar } from "@/lib/compare/compare_utls";
import { BattlePanel } from "@/components/compare/BattlePanel";
import { ProfileSlot } from "@/components/compare/ProfileSlot";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import { MemberBreakdown } from "@/components/compare/MembersBreakdown";
import { TeamProfileSlot } from "@/components/compare/TeamProfileSlot";
import MatchVerdict from "@/components/compare/MatchVerdict";
import { RowGroupedPills } from "@/components/compare/rows/RowGroupedPills";
import { RowGroupedBadges } from "@/components/compare/rows/RowGroupedBadges";
import { computeTeamChemistry } from "@/lib/compare/teamChemistry";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { MatchPredictionOverlay } from "./MatchPredictionOverlay";
import { cn } from "@/lib/utils";


type CompareTab = "overview" | "combat" | "stats" | "info";

const TABS: { id: CompareTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "combat", label: "Combat" },
    { id: "stats", label: "Stats" },
    { id: "info", label: "Info" },
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

                <div className={`transition-all duration-500 ${hasBothSides && showPredictionOverlay ? "filter blur-md pointer-events-none select-none opacity-50 max-h-[450px] overflow-hidden" : "opacity-100 max-h-none"}`}>

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
                                nemesisPairs={nemesisPairs}
                            />

                            <div className={`mx-auto  border-muted-foreground/20 rounded-xl relative overflow-x-hidden bg-transparent border-0`}>
                                {/* grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] */}
                                <div className="grid grid-cols-2 bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                                    {/* <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                                        {mode === "team" ? "Team profile" : "Entity profile"}
                                    </div> */}

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
                        </div>
                    )}

                    {/* COMBAT TAB */}
                    {activeTab === "combat" && (
                        <div className="mb-4">
                            <BattlePanel
                                radar={radar}
                                powerEstimateA={teamA.powerEstimate}
                                powerEstimateB={teamB.powerEstimate}
                                nameA={entityAName}
                                nameB={entityBName}
                                showRadarA={!!entityA && !showPredictionOverlay}
                                showRadarB={!!entityB && !showPredictionOverlay}
                                teamAChars={entitiesA}
                                teamBChars={entitiesB}
                            />
                        </div>
                    )}

                    {/* STATS TAB */}
                    {activeTab === "stats" && (
                        <div className={`mx-auto bg-card border border-muted-foreground/20 rounded-xl relative mb-10 overflow-x-hidden`}>
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
                        </div>
                    )}

                    {/* INFO TAB */}
                    {activeTab === "info" && (
                        <div className={`mx-auto bg-card border border-muted-foreground/20 rounded-xl relative mb-10 overflow-x-hidden`}>
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

                </div>
            </div>
        </>
    )
}