import CharacterCard from "@/components/characters/CharacterCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { PaginationPages } from "@/components/filters/Pagination";
import {
    collectionCharacters,
    collectionPowers,
    collectionTeams,
    collectionUniverses,
} from "@/db/mongodb";
import Link from "next/link";
import { BrushCleaning } from "lucide-react";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Suspense } from "react";

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

export default function Home({ searchParams }: { searchParams: SearchParamsPromise }) {
    return (
        <div className="min-h-screen">
            {/* 
        Keeping Suspense localized inside HomeContent rather than wrapping 
        the whole page preserves View Transitions between character cards.
      */}
            <HomeContent searchParams={searchParams} />
        </div>
    );
}

/* on mobile I must show a loading state when getting to this page from anyother page to this one on the webapp */

async function HomeContent({ searchParams }: { searchParams: SearchParamsPromise }) {
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

    // Build MongoDB query filter
    const query: Record<string, any> = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (gender) query["appearance.gender"] = gender;
    if (alignment) query["biography.alignment"] = alignment;
    if (universe) query["biography.publisher"] = universe;
    if (character_type) query["character_type"] = character_type;
    if (!Number.isNaN(tier)) query.tier = tier;
    if (!Number.isNaN(team)) query["connections.groupAffiliation"] = team;
    if (!Number.isNaN(character_class)) query.class = character_class;
    if (powersParam.length > 0) {
        query.powers = { $in: powersParam.map((c: string) => Number(c)) };
    }

    // 🚀 FIX: Run all independent queries in PARALLEL via Promise.all
    const [charactersPerPage, totalCharacters, universes, teams, powers] = await Promise.all([
        collectionCharacters
            .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                joinTeam_universe_power_enemies_toCharacter(
                    query,
                    sortProperty,
                    sortOrientation,
                    (page - 1) * pageSize,
                    pageSize
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

    // Fast helper to sanitize BSON ObjectIDs without expensive JSON.parse(JSON.stringify())
    // Fast and safe serialization for nested MongoDB documents
    const sanitize = <T,>(docs: T[]): T[] => JSON.parse(JSON.stringify(docs));

    const sanitizedCharacters = sanitize(charactersPerPage);
    const sanitizedUniverses = sanitize(universes);
    const sanitizedTeams = sanitize(teams);
    const sanitizedPowers = sanitize(powers);

    return (
        <div className="min-h-screen space-y-4 mt-4">
            <div>
                <h1 className="text-2xl font-bold">Characters</h1>
                <div className="text-muted-foreground font-light flex gap-2 items-center justify-between">
                    {totalCharacters} characters across all universes
                </div>
            </div>

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

            {/* make each card stickable like shorts or tiktoks where each card stisk while scrolling/swiping down on mobile and maybe even grow fullscreen with transition animations between cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
                {sanitizedCharacters.map((character) => (
                    <Link key={character.id} href={`/characters/${character.slug}`}>
                        <CharacterCard character={character} />
                    </Link>
                ))}
                {sanitizedCharacters.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground font-bold mt-5">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <BrushCleaning />
                            No characters found.
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-4">
                <Suspense fallback={null}>
                    <PaginationPages
                        currentPage={page}
                        totalPages={Math.ceil(totalCharacters / pageSize)}
                    />
                </Suspense>
            </div>
        </div>
    );
}