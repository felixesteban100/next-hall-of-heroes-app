import { aggregateTeamScores } from "@/lib/matchup";
import { detectMode, parseIdList } from "@/lib/matchup/matchupParams";
import { fetchCharactersByIds, fetchCharactersJoinedById } from "@/lib/matchup/fetchCompareEntities";
import { TeamSelectorCard } from "@/components/matchup/selectors/TeamSelectorCard";
import VS from "@/components/matchup/VS";
import { CompareModeToggle } from "@/components/matchup/CompareModeToggle";
import { CopySummaryButton } from "@/components/matchup/CopySummaryButton";
import { DynamicBracketView } from "@/components/matchup/bracket/BracketView";
import { getBestTeamName, searchCharacters } from "@/app/actions";
import { sanitize } from "@/lib/utils";
import CharacterComparatorView from "@/components/matchup/CharacterComparatorView";
import { BracketAddCombobox } from "@/components/matchup/bracket/BracketAddCombobox";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { FillSidesDropdown } from "@/components/matchup/FillSidesDropdown";

export const instant = false;

type SearchParamsPromise = Promise<{
    a?: string;
    b?: string;
    p?: string;
    mode?: string;
    a_name?: string;
    b_name?: string;
}>;

export const MAX_TEAM_SIZE = 14;
export const MAX_BRACKET_SIZE = 28;

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;
    const mode = detectMode(params);

    const idsBracket = parseIdList(params.p);
    const [characters, characterOptions] = await Promise.all([
        fetchCharactersJoinedById(idsBracket),
        searchCharacters("", idsBracket)
    ]);

    const idsA = parseIdList(params.a)
    const idsB = parseIdList(params.b)

    const [entitiesA, entitiesB] = await Promise.all([
        sanitize(await fetchCharactersByIds(idsA)),
        sanitize(await fetchCharactersByIds(idsB)),
    ]);

    const teamA = aggregateTeamScores(entitiesA);
    const teamB = aggregateTeamScores(entitiesB);

    const explicitTeamNameA = params.a_name;
    const explicitTeamNameB = params.b_name;

    const [bestTeamNameA, bestTeamNameB] = await Promise.all([
        getBestTeamName(entitiesA, 1),
        getBestTeamName(entitiesB, 1)
    ])

    const entityAName =
        entitiesA.length > 1
            ? (explicitTeamNameA ?? bestTeamNameA ?? "Team A")
            : entitiesA[0]?.name;

    const entityBName =
        entitiesB.length > 1
            ? (explicitTeamNameB ?? bestTeamNameB ?? "Team B")
            : entitiesB[0]?.name;

    const aceAInfo = teamA?.ace ? { name: teamA.aceName ?? "Ace", overall: teamA.ace.overall } : null;
    const aceBInfo = teamB?.ace ? { name: teamB.aceName ?? "Ace", overall: teamB.ace.overall } : null;

    function getInfoForSelector(c: CharacterWithJoinTeamUniversePowerEnemies) {
        return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.images.md,
            imageFocus: c.imageFocus
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-center justify-between gap-3 ">
                <CompareModeToggle />
                <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                    <FillSidesDropdown
                        mode={mode}
                        idsA={idsA}
                        idsB={idsB}
                        idsBracket={idsBracket}
                    />
                    {mode !== "bracket" && (
                        <CopySummaryButton
                            mode={mode}
                            nameA={entityAName ?? "Side A"}
                            nameB={entityBName ?? "Side B"}
                            powerEstimateA={teamA?.powerEstimate}
                            powerEstimateB={teamB?.powerEstimate}
                            aceA={aceAInfo}
                            aceB={aceBInfo}
                            fighterCount={characters.length}
                        />
                    )}
                </div>
            </div>

            {mode === "bracket" ? (
                <>
                    <BracketAddCombobox size={MAX_BRACKET_SIZE} ids={idsBracket} excludeIds={[...idsA, ...idsB]} initialOptions={characterOptions} characters={sanitize(characters)} />
                    <DynamicBracketView characters={sanitize(characters)} />
                </>
            ) : (
                <>
                    <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4 overflow-visible">
                        <TeamSelectorCard
                            title={entityAName}
                            selected={entitiesA.map((c) => getInfoForSelector(c))}
                            selectedIds={idsA}
                            excludeIds={[...idsA, ...idsB]}
                            paramKey="a"
                            variant="primary"
                        />
                        <VS />
                        <TeamSelectorCard
                            title={entityBName}
                            selected={entitiesB.map((c) => getInfoForSelector(c))}
                            selectedIds={idsB}
                            excludeIds={[...idsA, ...idsB]}
                            paramKey="b"
                            variant="secondary"
                        />
                    </section>

                    <CharacterComparatorView
                        mode={mode}
                        idsA={idsA}
                        idsB={idsB}
                        teamA={teamA}
                        teamB={teamB}
                        entitiesA={entitiesA}
                        entitiesB={entitiesB}
                        entityAName={entityAName}
                        entityBName={entityBName}
                    />
                </>
            )}
        </div>
    );
}