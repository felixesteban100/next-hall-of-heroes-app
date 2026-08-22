import CharacterCard from "@/components/CharacterCard";
import { collectionCharacters } from "@/db/mongodb";
import Link from "next/link";

export default async function Random() {
    const randomCharacter = await collectionCharacters.aggregate([{ $sample: { size: 8 } }]).toArray();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
            {randomCharacter.map((character) => (
                <Link key={character.id} href={`/characters/${character.slug}`}>
                    <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                </Link>
            ))}
        </div>
    )
}
