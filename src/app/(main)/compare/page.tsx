import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/selectors/SelectorCard";
import { aggregateTeamScores, computeMatchScore, groupTeams } from "@/lib/compare/compare_utls";
import { detectMode, parseIdList } from "@/lib/compare/compareParams";
import { fetchCharactersByIds, fetchFightersById } from "@/lib/compare/fetchCompareEntities";
import { TeamSelectorCard } from "@/components/compare/selectors/TeamSelectorCard";
import VS from "@/components/compare/VS";
import { CompareModeToggle } from "@/components/compare/CompareModeToggle";
import { CopySummaryButton } from "@/components/compare/CopySummaryButton";
import { RandomFillButton } from "@/components/compare/RandomFillButton";
import { BracketPicker } from "@/components/compare/BracketAddCombobox";
import { DynamicBracketView } from "@/components/compare/BracketView";
import { Character } from "@/types";
import { searchCharacters } from "@/app/actions";
import { sanitize } from "@/lib/utils";
import CharacterComparatorView from "@/components/compare/CharacterComparatorView";

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
        sanitize(await fetchCharactersByIds(idsA)),
        sanitize(await fetchCharactersByIds(idsB)),
    ]);

    // 1v1 convenience aliases (first member or null)
    const entityA = entitiesA[0] ?? null;
    const entityB = entitiesB[0] ?? null;

    const entityAIdValue = entityA?.id ?? null;
    const entityBIdValue = entityB?.id ?? null;

    // const teamA = mode === "team" ? aggregateTeamScores(entitiesA) : computeMatchScore(entityA);
    const teamA = aggregateTeamScores(entitiesA);
    // const teamB = mode === "team" ? aggregateTeamScores(entitiesB) : computeMatchScore(entityB);
    const teamB = aggregateTeamScores(entitiesB);

    const sharedTeamA = groupTeams(entitiesA).shared.map(c => ({ name: c.name, members: c.members }))
    const sharedTeamB = groupTeams(entitiesB).shared.map(c => ({ name: c.name, members: c.members }))
    const randomSharedTeamA = sharedTeamA[Math.floor(Math.random() * sharedTeamA.length)]
    const randomSharedTeamB = sharedTeamB[Math.floor(Math.random() * sharedTeamB.length)]

    const entityAName =
        mode === "team" && entitiesA.length > 1 && randomSharedTeamA ? randomSharedTeamA.name
            : mode === "team"
                ? "Team A"
                : entityA?.name;

    const entityBName =
        mode === "team" && entitiesB.length > 1 && randomSharedTeamB ? randomSharedTeamB.name
            : mode === "team"
                ? "Team B"
                : entityB?.name;

    // after scores are computed:
    const aceAInfo =
        mode === "team" && teamA?.ace
            ? { name: teamA.aceName ?? "Ace", overall: teamA.ace.overall }
            : entityA
                ? { name: entityA.name, overall: teamA?.avg.overall ?? 0 }
                : null;

    const aceBInfo =
        mode === "team" && teamB?.ace
            ? { name: teamB.aceName ?? "Ace", overall: teamB.ace.overall }
            : entityB
                ? { name: entityB.name, overall: teamB?.avg.overall ?? 0 }
                : null;

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />
            <div className="flex flex-wrap gap-2 items-center">
                <CompareModeToggle />
                <RandomFillButton mode={mode} idsA={idsA} idsB={idsB} bracketSize={mode === "bracket" ? 8 : undefined} />
                {
                    mode != "bracket"
                    &&
                    <CopySummaryButton
                        mode={mode}
                        nameA={entityAName ?? "Side A"}
                        nameB={entityBName ?? "Side B"}
                        powerEstimateA={teamA?.powerEstimate}
                        powerEstimateB={teamB?.powerEstimate}
                        aceA={mode === "team" ? aceAInfo : null}
                        aceB={mode === "team" ? aceBInfo : null}
                        fighterCount={fighters.length}
                    />
                }
            </div>

            {mode === "bracket" ?
                <>
                    <BracketPicker size={size} ids={ids} excludeIds={[...idsA, ...idsB]} initialOptions={characterOptions} characters={fighters} />
                    <DynamicBracketView
                        fighters={JSON.parse(JSON.stringify(fighters)).map((c: Character) => ({
                            id: c.id,
                            name: c.name,
                            overall: computeMatchScore(c).overall,
                            image: c.images.md,
                        }))}
                    />
                </>
                :
                <>
                    <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4 overflow-visible">
                        {mode === "team" ? (
                            <>
                                <TeamSelectorCard
                                    title={entityAName}
                                    selected={entitiesA.map((c) => ({
                                        id: c.id,
                                        name: c.name,
                                        slug: c.slug,
                                        image: c.images.md,
                                        imageFocus: c.imageFocus
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
                                        image: c.images.md,
                                        imageFocus: c.imageFocus
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

                    <CharacterComparatorView
                        mode={mode}
                        idsA={idsA}
                        idsB={idsB}
                        teamA={teamA}
                        teamB={teamB}
                        entitiesA={entitiesA}
                        entitiesB={entitiesB}
                        entityA={entityA}
                        entityB={entityB}
                        entityAName={entityAName}
                        entityBName={entityBName}
                    />
                </>
            }
        </div>
    );
}