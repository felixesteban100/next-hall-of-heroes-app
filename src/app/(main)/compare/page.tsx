import Image from "next/image";
import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/selectors/SelectorCard";
import { getCharacterAlignmentText, getCharacterAlignmentTextColor } from "@/lib/character_utils";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { MatchVerdict } from "@/components/compare/MatchVerditct";
import { computeMatchScore, getEnemyNames, getPowerNames, getTeamNames, hasNemesisLink, joinUnique, maxClass, maxTier, mergeEnemies, mergePowerNames, mergeTeams, mergeWeaknesses, radarData, radarDataFromStats, uniquePublishers } from "@/lib/compare_utls";
import { StatsRadar } from "@/components/compare/StatRadar";
import { ProfileSlot } from "@/components/compare/ProfileSlot";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { Row, RowPillContent, RowTextContent } from "@/components/compare/rows/Row";
import { Cell, EmptyCell } from "@/components/compare/rows/Cell";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import { RowBadge, RowBadges } from "@/components/compare/rows/RowBadge";
import { getAligmentIcon } from "@/lib/characters_utils";
import { SparPanel } from "@/components/compare/SparPanel";
import { detectMode, parseIdList } from "@/lib/compareParams";
import { fetchCharactersByIds } from "@/lib/fetchCompareEntities";
import { TeamSelectorCard } from "@/components/compare/selectors/TeamSelectorCard";
import VS from "@/components/compare/VS";
import { aggregateScores, avgPowerstats } from "@/lib/compare_utls"; // if you added these
import { MemberBreakdown } from "@/components/compare/MembersBreakdown";
import { TeamProfileSlot } from "@/components/compare/TeamProfileSlot";
import { CompareModeToggle } from "@/components/compare/CompareModeToggle";

export const instant = false;

type SearchParamsPromise = Promise<{
    id1?: string;
    id2?: string;
    a?: string;
    b?: string;
    mode?: string;
}>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;
    const mode = detectMode(params);

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

    // Per-character (1v1) OR team average
    const scoreA =
        mode === "team"
            ? aggregateScores(entitiesA)
            : computeMatchScore(entityA);

    const scoreB =
        mode === "team"
            ? aggregateScores(entitiesB)
            : computeMatchScore(entityB);

    // Nemesis: any pair across teams, or only 1v1
    const isNemesis =
        mode === "team"
            ? entitiesA.some((a) => entitiesB.some((b) => hasNemesisLink(a, b)))
            : !!entityA && !!entityB && hasNemesisLink(entityA, entityB);

    // Radar: team avg powerstats or single
    const radar =
        mode === "team"
            ? radarDataFromStats(avgPowerstats(entitiesA), avgPowerstats(entitiesB), /* names */)
            : radarData(entityA, entityB);

    const entityAName =
        mode === "team"
            ? entitiesA.map((c) => c.name).join(", ") || undefined
            : entityA?.name;

    const entityBName =
        mode === "team"
            ? entitiesB.map((c) => c.name).join(", ") || undefined
            : entityB?.name;

    const hasA = entitiesA.length > 0;
    const hasB = entitiesB.length > 0;

    // Powerstats for bars: team average vs single
    const powerstatsA =
        mode === "team" ? avgPowerstats(entitiesA) : entityA?.powerstats;
    const powerstatsB =
        mode === "team" ? avgPowerstats(entitiesB) : entityB?.powerstats;

    // Tier / class: show strongest on the team
    const tierA = mode === "team" ? maxTier(entitiesA) : entityA?.tier ?? null;
    const tierB = mode === "team" ? maxTier(entitiesB) : entityB?.tier ?? null;
    const classA = mode === "team" ? maxClass(entitiesA) : entityA?.class ?? null;
    const classB = mode === "team" ? maxClass(entitiesB) : entityB?.class ?? null;

    const TierIconA = tierA != null ? CHARACTER_TIER_ICON[tierA as keyof typeof CHARACTER_TIER_ICON] : null;
    const TierIconB = tierB != null ? CHARACTER_TIER_ICON[tierB as keyof typeof CHARACTER_TIER_ICON] : null;
    const ClassIconA = classA != null ? CHARACTER_CLASS_ICON[classA as keyof typeof CHARACTER_CLASS_ICON] : null;
    const ClassIconB = classB != null ? CHARACTER_CLASS_ICON[classB as keyof typeof CHARACTER_CLASS_ICON] : null;

    const pubsA = uniquePublishers(entitiesA);
    const pubsB = uniquePublishers(entitiesB);

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

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />
            <CompareModeToggle />

            {/* Selector Section */}
            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4 overflow-visible">
                {mode === "team" ? (
                    <>
                        <TeamSelectorCard
                            title="Team A"
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
                            title="Team B"
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

            {/* rest of the code */}

            <div className="max-w-5xl mx-auto space-y-4 mb-4">
                <MatchVerdict
                    nameA={entityAName}
                    nameB={entityBName}
                    scoreA={scoreA}
                    scoreB={scoreB}
                    isNemesis={isNemesis}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-muted-foreground/20 bg-card p-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                            Combat radar
                        </h3>
                        <StatsRadar
                            data={radar}
                            nameA={entityAName}
                            nameB={entityBName}
                            showA={!!entityA}
                            showB={!!entityB}
                        />
                    </div>
                    <SparPanel
                        scoreA={scoreA?.overall ?? null}
                        scoreB={scoreB?.overall ?? null}
                        nameA={entityAName}
                        nameB={entityBName}
                    />
                </div>
            </div>

            <main className="max-w-5xl mx-auto bg-card border border-muted-foreground/20 rounded-xl max-h-[80vh] overflow-y-auto relative mb-10 overflow-x-hidden">
                <div className="sticky top-0 z-20 grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                    <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                        {mode === "team" ? "Team profile" : "Entity profile"}
                    </div>

                    {mode === "team" ? (
                        <>
                            <TeamProfileSlot entities={entitiesA} variant="primary" score={scoreA?.overall} />
                            <TeamProfileSlot entities={entitiesB} variant="secondary" score={scoreB?.overall} />
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
                <Row label="Publisher">
                    {hasA ? (
                        <Cell>
                            <div className="flex flex-col items-center gap-2">
                                {pubsA.map((p) => (
                                    <div key={p.name} className="flex flex-col items-center gap-1">
                                        <Image
                                            src={p.logo || "/placeholder.png"}
                                            alt={p.name}
                                            width={200}
                                            height={80}
                                            className="h-12 w-auto object-contain"
                                        />
                                        <span className="text-xs font-medium">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {hasB ? (
                        <Cell>
                            <div className="flex flex-col items-center gap-2">
                                {pubsB.map((p) => (
                                    <div key={p.name} className="flex flex-col items-center gap-1">
                                        <Image
                                            src={p.logo || "/placeholder.png"}
                                            alt={p.name}
                                            width={200}
                                            height={80}
                                            className="h-12 w-auto object-contain"
                                        />
                                        <span className="text-xs font-medium">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <RowBadge
                    label={mode === "team" ? "Highest Tier" : "Tier"}
                    entityAAndLogoAExists={hasA && TierIconA != null}
                    entityBAndLogoBExists={hasB && TierIconB != null}
                    IconA={TierIconA}
                    IconB={TierIconB}
                    entityAClassName={CHARACTER_TIER_COLOR[tierA as keyof typeof CHARACTER_TIER_COLOR]?.text}
                    entityBClassName={CHARACTER_TIER_COLOR[tierB as keyof typeof CHARACTER_TIER_COLOR]?.text}
                    valueA={tierA != null ? CHARACTER_TIER[tierA as keyof typeof CHARACTER_TIER] : undefined}
                    valueB={tierB != null ? CHARACTER_TIER[tierB as keyof typeof CHARACTER_TIER] : undefined}
                />

                <RowBadge
                    label={mode === "team" ? "Highest Class" : "Class"}
                    entityAAndLogoAExists={hasA && ClassIconA != null}
                    entityBAndLogoBExists={hasB && ClassIconB != null}
                    IconA={ClassIconA}
                    IconB={ClassIconB}
                    entityAClassName={CHARACTER_CLASS_COLOR[classA as keyof typeof CHARACTER_CLASS_COLOR]?.text}
                    entityBClassName={CHARACTER_CLASS_COLOR[classB as keyof typeof CHARACTER_CLASS_COLOR]?.text}
                    valueA={classA != null ? CHARACTER_CLASS[classA as keyof typeof CHARACTER_CLASS] : undefined}
                    valueB={classB != null ? CHARACTER_CLASS[classB as keyof typeof CHARACTER_CLASS] : undefined}
                />

                <RowBadges
                    label={mode == "team" ? "Aligments" : "Aligment"}
                    entityAAndLogoAExists={hasA}
                    entityBAndLogoBExists={hasB}
                    aligmentsA={entitiesA.map(c => ({
                        name: c.name,
                        icon: getAligmentIcon(c.biography.alignment),
                        className: getCharacterAlignmentTextColor(c?.biography.alignment!),
                        value: getCharacterAlignmentText(c?.biography.alignment!)
                    }))}
                    aligmentsB={entitiesB.map(c => ({
                        name: c.name,
                        icon: getAligmentIcon(c.biography.alignment),
                        className: getCharacterAlignmentTextColor(c?.biography.alignment!),
                        value: getCharacterAlignmentText(c?.biography.alignment!)
                    }))}
                />

                <RowTextContent
                    label="Tier / Class"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => `T${e.tier ?? "?"} / C${e.class ?? "?"}`))
                            : `Tier ${entityA?.tier ?? "N/A"} / Class ${entityA?.class ?? "N/A"}`
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => `T${e.tier ?? "?"} / C${e.class ?? "?"}`))
                            : `Tier ${entityB?.tier ?? "N/A"} / Class ${entityA?.class ?? "N/A"}`
                    }
                />

                <RowTextContent
                    label="First Appearance"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.biography?.firstAppearance))
                            : entityA?.biography?.firstAppearance
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.biography?.firstAppearance))
                            : entityB?.biography?.firstAppearance
                    }
                />

                <RowTextContent
                    label="Place of Birth"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.biography?.placeOfBirth))
                            : entityA?.biography?.placeOfBirth
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.biography?.placeOfBirth))
                            : entityB?.biography?.placeOfBirth
                    }
                />

                <RowTextContent
                    label="Origin"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.biography?.origin))
                            : entityA?.biography?.origin
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.biography?.origin))
                            : entityB?.biography?.origin
                    }
                />

                <RowsHeader text="Physical Characteristics" />
                <RowTextContent
                    label="Race"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.race))
                            : entityA?.appearance?.race
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.race))
                            : entityB?.appearance?.race
                    }
                />

                <RowTextContent
                    label="Gender"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.gender))
                            : entityA?.appearance?.gender
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.gender))
                            : entityB?.appearance?.gender
                    }
                />

                <RowTextContent
                    label="Height"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.height?.join(" / ")))
                            : entityA?.appearance?.height?.join(" / ")
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.height?.join(" / ")))
                            : entityB?.appearance?.height?.join(" / ")
                    }
                />

                <RowTextContent
                    label="Weight"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.weight?.join(" / ")))
                            : entityA?.appearance?.weight?.join(" / ")
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.weight?.join(" / ")))
                            : entityB?.appearance?.weight?.join(" / ")
                    }
                />

                <RowTextContent
                    label="Eyes"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.eyeColor))
                            : entityA?.appearance?.eyeColor
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.eyeColor))
                            : entityB?.appearance?.eyeColor
                    }
                />

                <RowTextContent
                    label="Hair"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.hairColor))
                            : entityA?.appearance?.hairColor
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.hairColor))
                            : entityB?.appearance?.hairColor
                    }
                />

                <RowTextContent
                    label="Description"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAtext={
                        mode === "team"
                            ? joinUnique(entitiesA.map((e) => e.appearance?.description))
                            : entityA?.appearance?.description
                    }
                    entityBtext={
                        mode === "team"
                            ? joinUnique(entitiesB.map((e) => e.appearance?.description))
                            : entityB?.appearance?.description
                    }
                />

                <RowsHeader text="Work & Operations" />
                <RowTextContent
                    label="Occupation"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.work?.occupation}
                    entityBtext={entityB?.work?.occupation}
                />

                <RowTextContent
                    label="Base of Operations"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.work?.base}
                    entityBtext={entityB?.work?.base}
                />

                <RowsHeader text="Powers & Connections" />
                <RowPillContent
                    label="Special Powers"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAPillList={mode === "team" ? mergePowerNames(entitiesA) : getPowerNames(entityA?.powers)}
                    entityBPillList={mode === "team" ? mergePowerNames(entitiesB) : getPowerNames(entityB?.powers)}
                />

                <RowPillContent
                    label="Weaknesses"
                    entityAexist={hasA}
                    entityBexist={hasB}
                    entityAPillList={mode === "team" ? mergeWeaknesses(entitiesA) : entityA?.weaknesses || []}
                    entityBPillList={mode === "team" ? mergeWeaknesses(entitiesB) : entityB?.weaknesses || []}
                />

                <RowPillContent
                    label="Teams & Affiliations"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={mode === "team" ? mergeTeams(entitiesA) : getTeamNames(entityA?.connections?.groupAffiliation) || []}
                    entityBPillList={mode === "team" ? mergeTeams(entitiesB) : getTeamNames(entityB?.connections?.groupAffiliation) || []}
                />

                <RowPillContent
                    label="Primary Enemies"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={mode === "team" ? mergeEnemies(entitiesA) : getEnemyNames(entityA?.connections?.enemies) || []}
                    entityBPillList={mode === "team" ? mergeEnemies(entitiesB) : getEnemyNames(entityB?.connections?.enemies) || []}
                />
            </main>
        </div>
    );
}