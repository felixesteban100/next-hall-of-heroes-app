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
import { EntityFilterBar } from "@/components/filters/EntityFilterBar";


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
    modes?: string;
    fields?: string;
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
    const modesParam = params.modes?.toString() || "";
    const modes = modesParam ? modesParam.split(",") : [];
    const fieldsParam = params.fields?.toString() || "";
    const fields = fieldsParam ? fieldsParam.split(",") : [];

    const queryBuilderParams = {
        name, modes, gender, alignment, universe, team, tier, character_class, powersParam, character_type, fields
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
    // };

    return (
        <div className="">
            <EntityFilterBar
                type="character"
                sortOptions={[
                    { value: "id", label: "Id" },
                    { value: "powerstats.total", label: "Power total" },
                    { value: "name", label: "Name" },
                    { value: "appearance.age", label: "Age" },
                ]}
                extraData={{ universes: sanitizedUniverses, teams: sanitizedTeams, powers: sanitizedPowers }}
            />

            {/* being queried by page {sanitizedCharacters.length} */}
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