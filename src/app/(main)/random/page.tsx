import { CacheClearButton } from "@/components/filters/CacheClearButton";
import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterGrid } from "@/components/characters/CharacterGrid";
import { sanitize } from "@/lib/utils";

export default async function Random() {
    "use cache"
    const charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
        [
            {
                $lookup: {
                    from: "universes",
                    localField: "biography.publisher",
                    foreignField: "value",
                    pipeline: [{ $project: { teams: 0 } }],
                    as: "biography.publisher",
                },
            },
            { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },
            { $sample: { size: 12 } }
        ]
    ).toArray();

    const sanitizedCharacters = sanitize(charactersPerPage);

    return (
        <div className="flex flex-col mt-4 ">
            <h1 className="text-2xl font-bold">Random Characters</h1>
            <div className="text-muted-foreground font-light">
                8 random characters across all universes
            </div>
            <CacheClearButton path="/characters/random" />
            <CharacterGrid characters={sanitizedCharacters} />
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 ">
                {charactersPerPage.map((character) => (
                    <LoadingLink key={character.id} href={`/characters/${character.slug}`}>
                        <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                    </LoadingLink>
                ))}
            </div> */}
        </div>
    )
}
