import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/selectors/SelectorCard";
import { MatchVerdict } from "@/components/compare/matchesVerdict/MatchVerditct";
import { aggregateTeamScores, computeMatchScore, groupAlignments, groupClasses, avgPowerstats, groupEnemies, groupGenders, groupPowers, groupPublishers, groupRaces, groupTeams, groupTiers, groupWeaknesses, hasNemesisLink, radarData, radarDataFromStats } from "@/lib/compare/compare_utls";
import { StatsRadar } from "@/components/compare/StatRadar";
import { ProfileSlot } from "@/components/compare/ProfileSlot";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import { SparPanel } from "@/components/compare/SparPanel";
import { detectMode, parseIdList } from "@/lib/compare/compareParams";
import { fetchCharactersByIds, fetchFightersById } from "@/lib/compare/fetchCompareEntities";
import { TeamSelectorCard } from "@/components/compare/selectors/TeamSelectorCard";
import VS from "@/components/compare/VS";
import { MemberBreakdown } from "@/components/compare/MembersBreakdown";
import { TeamProfileSlot } from "@/components/compare/TeamProfileSlot";
import { CompareModeToggle } from "@/components/compare/CompareModeToggle";
import TeamMatchVerdict from "@/components/compare/matchesVerdict/TeamMatchVerdict";
import { RowGroupedPills } from "@/components/compare/rows/RowGroupedPills";
import { RowGroupedBadges } from "@/components/compare/rows/RowGroupedBadges";
import { CopySummaryButton } from "@/components/compare/CopySummaryButton";
import { RandomFillButton } from "@/components/compare/RandomFillButton";
import { computeTeamChemistry } from "@/lib/compare/teamChemistry";
// import { BracketView } from "@/components/compare/BracketView";
// import { buildBracket } from "@/lib/compare/bracket";
import { BracketPicker } from "@/components/compare/BracketAddCombobox";
import { DynamicBracketView } from "@/components/compare/BracketView";
import { Character } from "@/types";
import { searchCharacters } from "@/app/actions";

export const instant = false;

type SearchParamsPromise = Promise<{
    id1?: string;
    id2?: string;
    a?: string;
    b?: string;
    p?: string;
    mode?: string;
    size?: string;
}>;

export const MAX_TEAM_SIZE = 10; // one constant

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;
    const mode = detectMode(params);

    const size = 8;
    const ids = parseIdList(params.p);
    const fighters = await fetchFightersById(ids);
    const characterOptions = await searchCharacters("", ids)
    // const bouts = buildBracket(fighters, 10);

    // Build id lists for BOTH modes
    const idsA =
        mode === "team"
            ? parseIdList(params.a)
            : params.id1
                ? [Number.parseInt(params.id1, 10)].filter((n) => !Number.isNaN(n))
                : [];

    const idsB =
        mode === "team"
            ? parseIdList(params.b)
            : params.id2
                ? [Number.parseInt(params.id2, 10)].filter((n) => !Number.isNaN(n))
                : [];

    const [entitiesA, entitiesB] = await Promise.all([
        fetchCharactersByIds(idsA),
        fetchCharactersByIds(idsB),
    ]);

    // 1v1 convenience aliases (first member or null)
    const entityA = entitiesA[0] ?? null;
    const entityB = entitiesB[0] ?? null;

    const entityAIdValue = entityA?.id ?? null;
    const entityBIdValue = entityB?.id ?? null;

    const teamA = mode === "team" ? aggregateTeamScores(entitiesA) : null;
    const teamB = mode === "team" ? aggregateTeamScores(entitiesB) : null;

    // 1v1 still uses single scores
    const scoreA = mode === "team" ? teamA?.avg ?? null : computeMatchScore(entityA);
    const scoreB = mode === "team" ? teamB?.avg ?? null : computeMatchScore(entityB);

    // Nemesis: any pair across teams, or only 1v1
    const isNemesis =
        mode === "team"
            ? entitiesA.some((a) => entitiesB.some((b) => hasNemesisLink(a, b)))
            : !!entityA && !!entityB && hasNemesisLink(entityA, entityB);

    // Radar: team avg powerstats or single
    const radar =
        mode === "team"
            ? radarDataFromStats(avgPowerstats(entitiesA), avgPowerstats(entitiesB))
            : radarData(entityA, entityB);

    const hasA = entitiesA.length > 0;
    const hasB = entitiesB.length > 0;

    // Powerstats for bars: team average vs single
    const powerstatsA =
        mode === "team" ? avgPowerstats(entitiesA) : entityA?.powerstats;
    const powerstatsB =
        mode === "team" ? avgPowerstats(entitiesB) : entityB?.powerstats;

    const rosterA = entitiesA.map((e) => ({
        id: e.id,
        name: e.name,
        overall: computeMatchScore(e)?.overall ?? 0,
    }));
    const rosterB = entitiesB.map((e) => ({
        id: e.id,
        name: e.name,
        overall: computeMatchScore(e)?.overall ?? 0,
    }));

    const sharedTeamA = groupTeams(entitiesA).shared.map(c => ({ name: c.name, members: c.members }))
    const sharedTeamB = groupTeams(entitiesB).shared.map(c => ({ name: c.name, members: c.members }))

    const randomSharedTeamA = sharedTeamA[Math.floor(Math.random() * sharedTeamA.length)]
    const randomSharedTeamB = sharedTeamB[Math.floor(Math.random() * sharedTeamB.length)]

    // const lessMembersSharedTeamA = (sharedTeamA ?? []).reduce((min, current) =>
    //     current.members.length < min.members.length ? current : min
    // );
    // const lessMembersSharedTeamB = (sharedTeamB ?? []).reduce((min, current) =>
    //     current.members.length < min.members.length ? current : min, 
    // );

    const entityAName =
        // mode === "team" && lessMembersSharedTeamA ? lessMembersSharedTeamA.name
        mode === "team" && randomSharedTeamA ? randomSharedTeamA.name
            : mode === "team"
                ? "Team A"
                : entityA?.name;

    const entityBName =
        mode === "team" && randomSharedTeamB ? randomSharedTeamB.name
            : mode === "team"
                ? "Team B"
                : entityB?.name;

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

    // after scores are computed:
    const aceAInfo =
        mode === "team" && teamA?.ace
            ? { name: teamA.aceName ?? "Ace", overall: teamA.ace.overall }
            : entityA
                ? { name: entityA.name, overall: scoreA?.overall ?? 0 }
                : null;

    const aceBInfo =
        mode === "team" && teamB?.ace
            ? { name: teamB.aceName ?? "Ace", overall: teamB.ace.overall }
            : entityB
                ? { name: entityB.name, overall: scoreB?.overall ?? 0 }
                : null;

    if (mode === "bracket") {
        return (
            <div className="space-y-4 mt-4">
                <ComparisonHeader title="Bracket" />
                <CompareModeToggle />
                <BracketPicker size={size} ids={ids} excludeIds={[...idsA, ...idsB]} initialOptions={characterOptions} characters={fighters} />
                {/* <BracketView bouts={bouts} size={size} /> */}
                <DynamicBracketView fighters={JSON.parse(JSON.stringify(fighters)).map((c: Character) => ({
                    id: c.id,
                    name: c.name,
                    overall: c.powerstats.total,
                    image: c.images.md,
                }))} />
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />
            <div className="flex flex-wrap gap-2 items-center">
                <CompareModeToggle />
                <RandomFillButton mode={mode} idsA={idsA} idsB={idsB} />
                <CopySummaryButton
                    mode={mode}
                    nameA={entityAName ?? "Side A"}
                    nameB={entityBName ?? "Side B"}
                    avgA={scoreA?.overall}
                    avgB={scoreB?.overall}
                    aceA={mode === "team" ? aceAInfo : null}
                    aceB={mode === "team" ? aceBInfo : null}
                />
            </div>

            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4 overflow-visible">
                {mode === "team" ? (
                    <>
                        <TeamSelectorCard
                            title={entityAName}
                            selected={entitiesA.map((c) => ({
                                id: c.id,
                                name: c.name,
                                slug: c.slug,
                                image: c.images.md
                            }))}
                            selectedIds={idsA}
                            excludeIds={[...idsA, ...idsB]}
                            paramKey="a"
                            variant="primary"
                        />
                        <VS />
                        <TeamSelectorCard
                            title={entityBName}
                            selected={entitiesB.map((c) => ({
                                id: c.id,
                                name: c.name,
                                slug: c.slug,
                                image: c.images.md
                            }))}
                            selectedIds={idsB}
                            excludeIds={[...idsA, ...idsB]}
                            paramKey="b"
                            variant="secondary"
                        />
                    </>
                ) : (
                    <>
                        <SelectorCard
                            key={entityA?.id ?? "empty-a"}
                            title="Character A"
                            selected={entityA}
                            otherSelectedId={entityBIdValue ?? undefined}
                            paramKey="id1"
                            variant="primary"
                        />
                        <VS />
                        <SelectorCard
                            key={entityB?.id ?? "empty-b"}
                            title="Character B"
                            selected={entityB}
                            otherSelectedId={entityAIdValue ?? undefined}
                            paramKey="id2"
                            variant="secondary"
                        />
                    </>
                )}
            </section>

            <div className="max-w-5xl mx-auto space-y-4 mb-4">
                {mode === "team" && teamA && teamB ? (
                    <TeamMatchVerdict nameA={entityAName} nameB={entityBName} isNemesis={isNemesis} teamA={teamA} teamB={teamB} entitiesA={entitiesA} entitiesB={entitiesB} />
                ) : (
                    <MatchVerdict nameA={entityAName} nameB={entityBName} scoreA={scoreA} scoreB={scoreB} isNemesis={isNemesis} />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-muted-foreground/20 bg-card p-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                            Combat radar
                        </h3>
                        <StatsRadar data={radar} nameA={entityAName} nameB={entityBName} showA={!!entityA} showB={!!entityB} />
                    </div>
                    <SparPanel scoreA={scoreA?.overall ?? null} scoreB={scoreB?.overall ?? null} nameA={entityAName} nameB={entityBName} />
                </div>
            </div>

            <main className="max-w-5xl mx-auto bg-card border border-muted-foreground/20 rounded-xl max-h-[80vh] overflow-y-auto relative mb-10 overflow-x-hidden">
                <div className="sticky top-0 z-20 grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                    <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                        {mode === "team" ? "Team profile" : "Entity profile"}
                    </div>

                    {mode === "team" ? (
                        <>
                            <TeamProfileSlot
                                entities={entitiesA}
                                variant="primary"
                                score={scoreA?.overall}
                                chemistry={computeTeamChemistry(entitiesA)}
                            />
                            <TeamProfileSlot
                                entities={entitiesB}
                                variant="secondary"
                                score={scoreB?.overall}
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
                    <MemberBreakdown rosterA={rosterA} rosterB={rosterB} />
                )}

                <RowsHeader text={mode === "team" ? "Combat & Powerstats · team avg" : "Combat & Powerstats"} />
                <RowScoreComparer
                    scoreA={powerstatsA}
                    scoreB={powerstatsB}
                    rows={[
                        { label: "INTELLIGENCE", key: "intelligence" },
                        { label: "STRENGTH", key: "strength" },
                        { label: "SPEED", key: "speed" },
                        { label: "DURABILITY", key: "durability" },
                        { label: "POWER", key: "power" },
                        { label: "COMBAT", key: "combat" },
                        { label: "TOTAL", key: "total", max: 600 },
                    ]}
                />

                <RowsHeader text="Match score breakdown" />
                <RowScoreComparer scoreA={scoreA} scoreB={scoreB} />

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
    );
}