import CharacterCard from "@/components/CharacterCard";
import { FilterBar } from "@/components/FilterBar";
import { PaginationPages } from "@/components/Pagination";
import { collectionCharacters, collectionPowers, collectionUniverses } from "@/db/mongodb";
import Link from "next/link";

// import ActiveFiltersBadges from "@/components/ActiveFiltersBadges";
import { BrushCleaning } from "lucide-react";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Suspense } from "react";
import { FilterBarSkeleton } from "@/components/FilterBarSkeleton";

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
      {/* <Suspense fallback={<HomeSkeleton />}> */}
      <HomeContent searchParams={searchParams} />
      {/* </Suspense> */}
    </div>
  );
}

async function HomeContent({
  searchParams
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined,
    page?: string,
    sort?: string,
    sortOrientation?: string,
    gender?: string;
    alignment?: string,
    universe?: string,
    tier?: string,
    class?: string,
    powers?: string;
    character_type?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = 12;

  const sortProperty = params.sort?.toString() || "id";
  const sortOrientation = params.sortOrientation?.toString() || "desc";

  const name = params.name?.toString() || "";
  const gender = params.gender?.toString() || "";
  const alignment = params.alignment?.toString() || "";
  const universe = params.universe?.toString() || "";
  const tier = parseInt(params.tier?.toString() || "");
  const character_class = parseInt(params.class?.toString() || "");
  const powersParam = JSON.parse(params.powers || "[]");
  const character_type = params.character_type?.toString() || "";

  /* make the ones that are undefined or empty string not appear inside the query object */
  const query: Record<string, string | number | object> = {};
  if (name && name != "") query.name = { $regex: name, $options: "i" };
  if (gender && gender != "") query["appearance.gender"] = gender;
  if (alignment && alignment != "") query["biography.alignment"] = alignment;
  if (universe) query["biography.publisher"] = universe;
  if (character_type) query["character_type"] = character_type;
  if (!Number.isNaN(tier)) query.tier = tier;
  if (!Number.isNaN(character_class)) query.class = character_class;
  if (powersParam.length > 0) query.powers = { $in: powersParam.map((c: string) => Number(c)) }

  const charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
    joinTeam_universe_power_enemies_toCharacter(
      query,
      sortProperty,
      sortOrientation,
      (page - 1) * pageSize,
      pageSize,
      // [],
    ),
  ).toArray();



  const totalCharacters = await collectionCharacters.countDocuments(query);
  const universes = await collectionUniverses.find({}).sort({ "id": 1 }).toArray();
  const powers = await collectionPowers.find({}).sort({ "id": -1 }).toArray();

  return (
    <div className="min-h-screen space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Characters</h1>
        <div className="text-muted-foreground font-light flex gap-2 items-center justify-between">
          {totalCharacters} characters across all universes
        </div>
      </div>
      <Suspense
        key={JSON.stringify(params)}
        fallback={<FilterBarSkeleton />}
      >
        <FilterBar
          universes={JSON.parse(JSON.stringify(universes))}
          powers={JSON.parse(JSON.stringify(powers))}
          activeFilterProps={{
            name, gender, alignment, universe,
            tier, character_class, powersParam,
            powers: JSON.parse(JSON.stringify(powers)),
            character_type
          }}
        />
      </Suspense>
      {/*  overflow-y-auto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {charactersPerPage.map((character) => (
          <Link key={character.id} href={`/characters/${character.slug}`}>
            <CharacterCard character={JSON.parse(JSON.stringify(character))} />
          </Link>
        ))}
        {charactersPerPage.length === 0 && (
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
          <PaginationPages currentPage={page} totalPages={Math.ceil(totalCharacters / pageSize)} />
        </Suspense>
      </div>
    </div>
  );
}

/* function HomeSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-12 w-full bg-muted rounded" />
    </div>
  );
} */


// https://claude.ai/chat/c0520f08-a4df-4066-90b9-9bc56681d2ac

// https://ui.shadcn.com/docs/components/radix/card

// https://search.brave.com/search?q=how+to+trigger+the+view+transition+next+js+when+going+back+in+browser&spellcheck=0&source=alteredQuery&conversation=093db314b1127990e73fc3a41d79217c5afa&summary=1

// ?gender=male&sortOrientation=desc&sort=name&alignment=neutral&universe=Shueisha&tier=Tier+1

// const charactersPerPage = await collectionCharacters.find({
//   '$expr': {
//     '$lte': [
//       {
//         '$size': {
//           '$filter': {
//             'input': [
//               '$images.xs', '$images.sm', '$images.md', '$images.lg'
//             ],
//             'as': 'img',
//             'cond': {
//               '$ne': [
//                 '$$img', ''
//               ]
//             }
//           }
//         }
//       }, 1
//     ]
//   }
// }).skip((page - 1) * pageSize).limit(pageSize)/* .sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 }) */.toArray();

// mongodb query for characters with just one valid image url in the images property
// {$expr: {$lte: [{$size: {$filter: {input: ["$images.xs","$images.sm","$images.md","$images.lg"],as: "img",cond: { $ne: ["$$img", ""] }}}},1]}}

// CharacterTier.forEach(async (character) => {
//   await collectionCharacters.updateOne({ slug: character.slug }, { $set: { tier: character.tier } })
// })

// CharacterClassFirstTesting.forEach(async (character) => {
//   await collectionCharacters.updateOne({ slug: character.slug }, { $set: { class: character.character_class } })
// })