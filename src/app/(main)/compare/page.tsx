import Image from "next/image";
import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/SelectorCard";
import { collectionCharacters } from "@/db/mongodb";
import { getCharacterAlignmentText, getCharacterAlignmentTextColor, joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { MatchVerdict } from "@/components/compare/MatchVerditct";
import { computeMatchScore, getEnemyNames, getPowerNames, getPublisher, getTeamNames, hasNemesisLink, radarData } from "@/lib/compare_utls";
import { StatsRadar } from "@/components/compare/StatRadar";
import { ProfileSlot } from "@/components/compare/ProfileSlot";
import { RowsHeader } from "@/components/compare/rows/RowsHeader";
import { Row, RowPillContent, RowTextContent } from "@/components/compare/rows/Row";
import { Cell, EmptyCell } from "@/components/compare/rows/Cell";
import { RowScoreComparer } from "@/components/compare/rows/RowScoreComparer";
import RowBadge from "@/components/compare/rows/RowBadge";
import { getAligmentIcon } from "@/lib/characters_utils";
import { SparPanel } from "@/components/compare/SparPanel";

export const instant = false;

type SearchParamsPromise = Promise<{
    id1: string;
    id2: string;
}>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;

    const entityAIdValue = params.id1 ? Number.parseInt(params.id1, 10) : null;
    const entityBIdValue = params.id2 ? Number.parseInt(params.id2, 10) : null;

    const hasA = entityAIdValue != null && !Number.isNaN(entityAIdValue);
    const hasB = entityBIdValue != null && !Number.isNaN(entityBIdValue);

    const fetchEntity = (hasEntity: boolean, id?: number | null) =>
        hasEntity && id != null
            ? collectionCharacters
                .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                    joinTeam_universe_power_enemies_toCharacter(
                        { id },
                        "id",
                        "desc",
                        0,
                        1,
                        { includeEnemies: true }
                    )
                )
                .next() // Directly retrieves the first document (or null) without array allocation
            : Promise.resolve(null);

    // Execution
    const [entityA, entityB] = await Promise.all([
        fetchEntity(hasA, entityAIdValue),
        fetchEntity(hasB, entityBIdValue),
    ]);

    const TierIconA = entityA
        ? CHARACTER_TIER_ICON[entityA.tier as keyof typeof CHARACTER_TIER_ICON]
        : null;
    const TierIconB = entityB
        ? CHARACTER_TIER_ICON[entityB.tier as keyof typeof CHARACTER_TIER_ICON]
        : null;

    const ClassIconA = entityA ? CHARACTER_CLASS_ICON[entityA.class as keyof typeof CHARACTER_CLASS_ICON] : null;
    const ClassIconB = entityB ? CHARACTER_CLASS_ICON[entityB.class as keyof typeof CHARACTER_CLASS_ICON] : null;

    const AligmentIconA = getAligmentIcon(entityA?.biography.alignment!)
    const AligmentIconB = getAligmentIcon(entityB?.biography.alignment!)

    // after entityA / entityB resolved:
    const scoreA = computeMatchScore(entityA);
    const scoreB = computeMatchScore(entityB);
    const isNemesis =
        !!entityA && !!entityB && hasNemesisLink(entityA, entityB);
    const radar = radarData(entityA, entityB);

    console.log(scoreA?.overall)
    console.log(scoreB?.overall)

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />

            {/* Selector Section */}
            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4 overflow-visible">
                <SelectorCard
                    key={entityA?.id ?? "empty-a"}
                    title="Character A"
                    selected={entityA}
                    otherSelectedId={entityBIdValue ?? undefined}
                    paramKey="id1"
                    variant="primary"
                />
                <div className="flex justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-background font-black text-xl">
                        VS
                    </div>
                </div>
                <SelectorCard
                    key={entityB?.id ?? "empty-b"}
                    title="Character B"
                    selected={entityB}
                    otherSelectedId={entityAIdValue ?? undefined}
                    paramKey="id2"
                    variant="secondary"
                />
            </section>

            <div className="max-w-5xl mx-auto space-y-4 mb-4">
                <MatchVerdict
                    nameA={entityA?.name}
                    nameB={entityB?.name}
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
                            nameA={entityA?.name}
                            nameB={entityB?.name}
                            showA={!!entityA}
                            showB={!!entityB}
                        />
                    </div>
                    <SparPanel
                        scoreA={scoreA?.overall ?? null}
                        scoreB={scoreB?.overall ?? null}
                        nameA={entityA?.name}
                        nameB={entityB?.name}
                    />
                </div>
            </div>

            <main className="max-w-5xl mx-auto bg-card border border-muted-foreground/20 rounded-xl max-h-[80vh] overflow-y-auto relative mb-10 overflow-x-hidden">
                <div className="sticky top-0 z-20 grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                    <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                        Entity Profile
                    </div>
                    <ProfileSlot entity={entityA} variant="primary" />
                    <ProfileSlot entity={entityB} variant="secondary" />
                </div>

                {/* SECTION: POWERSTATS */}
                <RowsHeader
                    text="Combat & Powerstats"
                />

                <RowScoreComparer
                    scoreA={entityA?.powerstats}
                    scoreB={entityB?.powerstats}
                    rows={[
                        { label: "INTELLIGENCE", key: "intelligence" },
                        { label: "STRENGTH", key: "strength" },
                        { label: "SPEED", key: "speed" },
                        { label: "DURABILITY", key: "durability" },
                        { label: "POWER", key: "power" },
                        { label: "COMBAT", key: "combat" },
                        { label: "TOTAL", key: "total", max: 600 }, // Higher max bound for 'total'
                    ]}
                />

                {/* SECTION: MATCH SCORE BREAKDOWN */}
                <RowsHeader
                    text="Match score breakdown"
                />
                <RowScoreComparer scoreA={scoreA} scoreB={scoreB} />

                {/* SECTION: GENERAL & BIOGRAPHY */}
                <RowsHeader
                    text="General Information"
                />

                <Row label="Publisher">
                    {entityA ? (
                        <Cell>
                            <div className="flex flex-col justify-center items-center gap-1">
                                <Image
                                    src={entityA.biography?.publisher?.logo || "/placeholder.png"}
                                    alt={entityA.biography?.publisher?.name || ""}
                                    width={500}
                                    height={500}
                                    className="h-20 w-auto object-contain"
                                />
                                <span className="text-sm font-medium">
                                    {getPublisher(entityA.biography?.publisher)}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <div className="flex flex-col justify-center items-center gap-1">
                                <Image
                                    src={entityB.biography?.publisher?.logo || "/placeholder.png"}
                                    alt={entityB.biography?.publisher?.name || ""}
                                    width={500}
                                    height={500}
                                    className="h-20 w-auto object-contain"
                                />
                                <span className="text-sm font-medium">
                                    {getPublisher(entityB.biography?.publisher)}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <RowBadge
                    label="Tier"
                    entityAAndLogoAExists={(entityA != null && TierIconA != null)}
                    entityBAndLogoBExists={entityB != null && TierIconB != null}
                    IconA={TierIconA}
                    IconB={TierIconB}
                    entityAClassName={CHARACTER_TIER_COLOR[entityA?.tier as keyof typeof CHARACTER_TIER_COLOR].text}
                    entityBClassName={CHARACTER_TIER_COLOR[entityB?.tier as keyof typeof CHARACTER_TIER_COLOR].text}
                    valueA={CHARACTER_TIER[entityA?.tier as keyof typeof CHARACTER_TIER]}
                    valueB={CHARACTER_TIER[entityB?.tier as keyof typeof CHARACTER_TIER]}
                />

                <RowBadge
                    label="Class"
                    entityAAndLogoAExists={(entityA != null && ClassIconA != null)}
                    entityBAndLogoBExists={entityB != null && ClassIconB != null}
                    IconA={ClassIconA}
                    IconB={ClassIconB}
                    entityAClassName={CHARACTER_CLASS_COLOR[entityA?.tier as keyof typeof CHARACTER_CLASS_COLOR].text}
                    entityBClassName={CHARACTER_CLASS_COLOR[entityB?.tier as keyof typeof CHARACTER_CLASS_COLOR].text}
                    valueA={CHARACTER_CLASS[entityA?.tier as keyof typeof CHARACTER_CLASS]}
                    valueB={CHARACTER_CLASS[entityB?.tier as keyof typeof CHARACTER_CLASS]}
                />

                <RowBadge
                    label="Alignment"
                    entityAAndLogoAExists={(entityA != null && AligmentIconA != null)}
                    entityBAndLogoBExists={entityB != null && AligmentIconB != null}
                    IconA={AligmentIconA}
                    IconB={AligmentIconB}
                    entityAClassName={getCharacterAlignmentTextColor(entityA?.biography.alignment!)}
                    entityBClassName={getCharacterAlignmentTextColor(entityB?.biography.alignment!)}
                    valueA={getCharacterAlignmentText(entityA?.biography.alignment!)}
                    valueB={getCharacterAlignmentText(entityB?.biography.alignment!)}
                />

                <RowTextContent
                    label="Tier / Class"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={`Tier ${entityA?.tier ?? "N/A"} / Class ${entityA?.class ?? "N/A"}`}
                    entityBtext={`Tier ${entityB?.tier ?? "N/A"} / Class ${entityB?.class ?? "N/A"}`}
                />

                <RowTextContent
                    label="First Appearance"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.biography?.firstAppearance}
                    entityBtext={entityB?.biography?.firstAppearance}
                />

                <RowTextContent
                    label="Place of Birth"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.biography?.placeOfBirth}
                    entityBtext={entityB?.biography?.placeOfBirth}
                />

                <RowTextContent
                    label="Origin"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.biography?.origin}
                    entityBtext={entityB?.biography?.origin}
                />


                {/* SECTION: PHYSICAL APPEARANCE */}
                <RowsHeader
                    text="Physical Characteristics"
                />

                <RowTextContent
                    label="Race"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.appearance?.race}
                    entityBtext={entityB?.appearance?.race}
                />

                <RowTextContent
                    label="Gender"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.appearance?.gender}
                    entityBtext={entityB?.appearance?.gender}
                />

                <RowTextContent
                    label="Height"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.appearance?.height?.join(" / ")}
                    entityBtext={entityB?.appearance?.height?.join(" / ")}
                />

                <RowTextContent
                    label="Weight"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.appearance?.weight?.join(" / ")}
                    entityBtext={entityB?.appearance?.weight?.join(" / ")}
                />

                <RowTextContent
                    label="Eyes / Hair"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={`${entityA?.appearance?.eyeColor || "N/A"} / ${entityA?.appearance?.hairColor || "N/A"}`}
                    entityBtext={`${entityB?.appearance?.eyeColor || "N/A"} / ${entityB?.appearance?.hairColor || "N/A"}`}
                />

                <RowTextContent
                    label="Description"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAtext={entityA?.appearance?.description}
                    entityBtext={entityB?.appearance?.description}
                />

                {/* SECTION: WORK & BASE */}
                <RowsHeader
                    text="Work & Operations"
                />

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

                {/* SECTION: ABILITIES, TEAMS & ENEMIES */}
                <RowsHeader
                    text="Powers & Connections"
                />

                <RowPillContent
                    label="Special Powers"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={getPowerNames(entityA?.powers)}
                    entityBPillList={getPowerNames(entityB?.powers)}
                />

                <RowPillContent
                    label="Weaknesses"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={entityA?.weaknesses || []}
                    entityBPillList={entityB?.weaknesses || []}
                />

                <RowPillContent
                    label="Teams & Affiliations"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={getTeamNames(entityA?.connections?.groupAffiliation)}
                    entityBPillList={getTeamNames(entityB?.connections?.groupAffiliation)}
                />

                <RowPillContent
                    label="Primary Enemies"
                    entityAexist={entityA != null}
                    entityBexist={entityB != null}
                    entityAPillList={getEnemyNames(entityA?.connections?.enemies)}
                    entityBPillList={getEnemyNames(entityB?.connections?.enemies)}
                />
            </main>
        </div>
    );
}