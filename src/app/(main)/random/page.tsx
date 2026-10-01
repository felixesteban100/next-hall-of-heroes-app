import { CacheClearButton } from "@/components/filters/CacheClearButton";
import CharacterCard from "@/components/characters/CharacterCard";
import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Link from "next/link";

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

    return (
        <div className="min-h-screen flex flex-col mt-4">
            <h1 className="text-2xl font-bold">Random Characters</h1>
            <div className="text-muted-foreground font-light">
                8 random characters across all universes
            </div>
            <CacheClearButton path="/characters/random" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 ">
                {charactersPerPage.map((character) => (
                    <Link key={character.id} href={`/characters/${character.slug}`}>
                        <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                    </Link>
                ))}
            </div>
        </div>
    )
}
