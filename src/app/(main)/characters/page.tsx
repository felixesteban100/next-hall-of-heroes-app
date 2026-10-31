import { FilterBar } from "@/components/filters/FilterBar";
import { PaginationPages } from "@/components/filters/Pagination";
import {
    collectionCharacters,
    collectionPowers,
    collectionTeams,
    collectionUniverses,
} from "@/db/mongodb";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { sanitize } from "@/lib/utils";
import { seedCharactersDescription } from "@/db/seeds";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import { buildQuery } from "@/lib/query";


export const instant = false;

type SearchParamsPromise = Promise<{
    [key: string]: string | string[] | undefined;
    page?: string;
    sort?: string;
    sortOrientation?: string;
    gender?: string;
    alignment?: string;
    universe?: string;
    tier?: string;
    class?: string;
    powers?: string;
    character_type?: string;
}>;

export default async function CharactersPage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;

    const sortProperty = params.sort?.toString() || "id";
    const sortOrientation = params.sortOrientation?.toString() || "desc";

    const name = params.name?.toString() || "";
    const gender = params.gender?.toString() || "";
    const alignment = params.alignment?.toString() || "";
    const universe = params.universe?.toString() || "";
    const team = parseInt(params.team?.toString() || "");
    const tier = parseInt(params.tier?.toString() || "");
    const character_class = parseInt(params.class?.toString() || "");
    const powersParam = JSON.parse(params.powers || "[]");
    const character_type = params.character_type?.toString() || "";

    const queryBuilderParams = {
        name, gender, alignment, universe, team, tier, character_class, powersParam, character_type
    }

    const query = await buildQuery(queryBuilderParams)

    // 🚀 FIX: Run all independent queries in PARALLEL via Promise.all
    const [charactersPerPage, totalCharacters, universes, teams, powers] = await Promise.all([
        collectionCharacters
            .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                joinTeam_universe_power_enemies_toCharacter(
                    query,
                    sortProperty,
                    sortOrientation,
                    (page - 1) * pageSize,
                    pageSize,
                    { includeEnemies: true }
                )
            )
            .toArray(),
        collectionCharacters.countDocuments(query),
        collectionUniverses
            .find({}, { projection: { id: 1, name: 1, _id: 0 } })
            .sort({ id: 1 })
            .toArray(),

        collectionTeams
            .find({}, { projection: { id: 1, name: 1, universe: 1, _id: 0 } })
            .sort({ id: 1 })
            .toArray(),

        collectionPowers
            .find({}, { projection: { id: 1, name: 1, _id: 0 } })
            .sort({ name: 1 })
            .toArray(),
    ]);

    const sanitizedCharacters = sanitize(charactersPerPage);
    const sanitizedUniverses = sanitize(universes);
    const sanitizedTeams = sanitize(teams);
    const sanitizedPowers = sanitize(powers);
    const totalPages = Math.ceil(totalCharacters / pageSize);

    // const charactersToUpdate = 
    // seedCharactersDescription(charactersToUpdate)

    return (
        <div className="">
            {/* <div>
                <h1 className="text-2xl font-bold">Characters</h1>
                <div className="text-muted-foreground font-light flex gap-2 items-center justify-between">
                    {totalCharacters} characters across all universes
                </div>
            </div>*/}

            <FilterBar
                universes={sanitizedUniverses}
                teams={sanitizedTeams}
                powers={sanitizedPowers}
                activeFilterProps={{
                    name,
                    gender,
                    alignment,
                    universe,
                    tier,
                    character_class,
                    powersParam,
                    team,
                    powers: sanitizedPowers,
                    character_type,
                    teams: sanitizedTeams,
                }}
            />

            <SwipeGrid
                items={sanitizedCharacters}
                currentPage={page}
                totalPages={totalPages}
                type="character"
                emptyMessage="No characters found."
            />

            <div className="hidden md:flex justify-center py-4">
                <PaginationPages
                    currentPage={page}
                    totalPages={Math.ceil(totalCharacters / pageSize)}
                />
            </div>
        </div>
    );
}