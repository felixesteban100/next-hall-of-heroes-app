"use client"

import { CompareMode } from "@/lib/compare/compareParams";
import { groupAlignments, groupClasses, groupEnemies, groupGenders, groupPowers, groupPublishers, groupRaces, groupTeams, groupTiers, groupWeaknesses, avgTeamPowerstats, hasNemesisLink, radarData, radarDataFromStats, TeamAggregate, MatchBreakdown } from "@/lib/compare/compare_utls";
import { StatsRadar } from "@/components/compare/StatRadar";
import { ProfileSlot } from "@/components/compare/ProfileSlot";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import { SparPanel } from "@/components/compare/SparPanel";
import { MemberBreakdown } from "@/components/compare/MembersBreakdown";
import { TeamProfileSlot } from "@/components/compare/TeamProfileSlot";
import MatchVerdict from "@/components/compare/MatchVerdict";
import { RowGroupedPills } from "@/components/compare/rows/RowGroupedPills";
import { RowGroupedBadges } from "@/components/compare/rows/RowGroupedBadges";
import { computeTeamChemistry } from "@/lib/compare/teamChemistry";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { MatchPredictionOverlay } from "./MatchPredictionOverlay";


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

    // Create a composite key that changes whenever IDs, team lists, or modes change
    const matchKey = `${mode}-${idsA}-${idsB}`;

    // Reset prediction overlay to 'true' every time the match context changes
    useEffect(() => {
        setShowPredictionOverlay(true);
    }, [matchKey]);

    // Determine actual winner based on overall scores calculated by your backend/lib
    const actualWinner = useMemo(() => {
        const valA = teamA.powerEstimate;
        const valB = teamB.powerEstimate;

        // If both scores are 0 or missing
        if (valA === 0 && valB === 0) return "Draw";

        const d = valA - valB;
        const maxVal = Math.max(valA, valB, 1);
        const pct = Math.abs(d) / maxVal;

        // Apply the same 6% toss-up rule! If the percentage delta is under 6%, treat it as a Draw/Toss-up
        if (pct < 0.06) {
            return "Draw";
        }

        if (valA > valB) return "A";
        if (valB > valA) return "B";
        return "Draw";
    }, [teamA, teamB]);

    // Nemesis: any pair across teams, or only 1v1
    const isNemesis =
        mode === "team"
            ? entitiesA.some((a) => entitiesB.some((b) => hasNemesisLink(a, b)))
            : !!entityA && !!entityB && hasNemesisLink(entityA, entityB);

    // Radar: team avg powerstats or single
    const radar =
        mode === "team"
            ? radarDataFromStats(avgTeamPowerstats(entitiesA), avgTeamPowerstats(entitiesB))
            : radarData(entityA, entityB);

    const hasA = entitiesA.length > 0;
    const hasB = entitiesB.length > 0;

    const rowsBadges = [
        { label: "Publisher", functionGroup: groupPublishers, BadgeComponent: RowGroupedBadges },
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

    return (
        <>
            <div className="relative w-full max-w-5xl">
                {/* Prediction Overlay covers the comparison until voted */}
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

                {/* Main comparison content (blurred out until prediction is made) */}
                <div className={`transition-all duration-500 ${hasBothSides && showPredictionOverlay ? "filter blur-sm pointer-events-none select-none opacity-40" : "opacity-100"}`}>
                    <div className="mx-auto space-y-4 mb-4">
                        <MatchVerdict nameA={entityAName} nameB={entityBName} isNemesis={isNemesis} teamA={teamA ?? null} teamB={teamB ?? null} entitiesA={entitiesA} entitiesB={entitiesB} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-muted-foreground/20 bg-card p-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                                    Stats radar
                                </h3>
                                <StatsRadar data={radar} nameA={entityAName} nameB={entityBName} showA={!!entityA} showB={!!entityB} />
                            </div>
                            <SparPanel powerEstimateA={teamA.powerEstimate} powerEstimateB={teamB.powerEstimate} nameA={entityAName} nameB={entityBName} />
                        </div>
                    </div>

                    {/* max-h-[80vh] overflow-y-auto */}
                    <main className=" mx-auto bg-card border border-muted-foreground/20 rounded-xl  relative mb-10 overflow-x-hidden bg-transparent border-0">
                        {/* sticky top-0 z-20 */}
                        <div className=" grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                            <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                                {mode === "team" ? "Team profile" : "Entity profile"}
                            </div>

                            {mode === "team" ? (
                                <>
                                    <TeamProfileSlot
                                        entities={entitiesA}
                                        variant="primary"
                                        powerEstimate={teamA.powerEstimate}
                                        chemistry={computeTeamChemistry(entitiesA)}
                                    />
                                    <TeamProfileSlot
                                        entities={entitiesB}
                                        variant="secondary"
                                        powerEstimate={teamB.powerEstimate}
                                        chemistry={computeTeamChemistry(entitiesB)}
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
                            <MemberBreakdown entitiesA={entitiesA} entitiesB={entitiesB} />
                        )}

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
                    </main>
                </div>
            </div>
        </>
    )
}
