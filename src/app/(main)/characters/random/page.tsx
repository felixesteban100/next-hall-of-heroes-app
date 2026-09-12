import { CacheClearButton } from "@/components/CacheClearButton";
import CharacterCard from "@/components/CharacterCard";
import { collectionCharacters } from "@/db/mongodb";
import Link from "next/link";
// import { unstable_noStore as noStore } from "next/cache";
import { connection } from 'next/server'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function Random() {
    // noStore();
    await connection()
    const randomCharacter = await collectionCharacters.aggregate([{ $sample: { size: 8 } }]).toArray();

    return (
        <div className="flex flex-col gap-4">
            <CacheClearButton path="/characters/random" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {randomCharacter.map((character) => (
                    <Link key={character.id} href={`/characters/${character.slug}`}>
                        <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                    </Link>
                ))}
            </div>
        </div>
    )
}
