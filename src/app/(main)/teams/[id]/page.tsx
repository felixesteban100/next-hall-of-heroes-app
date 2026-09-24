import CharacterCard from "@/components/CharacterCard";
import { collectionCharacters, collectionTeams } from "@/db/mongodb";
import Link from "next/link";
import Image from "next/image";
import { Suspense, ViewTransition } from "react";
import { cacheLife } from "next/dist/server/use-cache/cache-life"

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    "use cache"
    cacheLife("hours") // or "minutes", "days", "weeks"

    const { id } = await params;

    const team = await collectionTeams.findOne({ id: parseInt(id) });

    if (team === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Team not found</h1>
            </div>
        )
    }

    const teamCharacters = await collectionCharacters.find({ "connections.groupAffiliation": { $in: [team.id] } }).sort({ rand: 1 }).toArray();

    return (
        <div className="mx-auto pb-8 max-w-[90vw] space-y-5">
            <Suspense fallback={<>Loading team...</>}>
                <div className="flex flex-col md:flex-row items-center md:items-start space-x-5">
                    <Suspense fallback={<ViewTransition name={`photo-team-${team.id}`} share="morph">
                        <div className="max-h-40 w-auto rounded-4xl" />
                    </ViewTransition>}>
                        <ViewTransition name={`photo-team-${team.id}`} share="morph">
                            <Image src={team.logo} alt={team.name} className="max-h-40 w-auto rounded-4xl" width={500} height={300} />
                        </ViewTransition>
                    </Suspense>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">{team.name}</h1>
                        <p className="text-md font-light">{team.id}-{team.name}</p>
                        <p className="text-muted-foreground font-medium">{team.description || "No description available."}</p>
                    </div>
                </div>
            </Suspense>

            {/* FilterBar for sorting */}


            <div id="groups-affiliation" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">MEMBERS</p>
                {teamCharacters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                        {teamCharacters.map((character) => (
                            <Link key={character.id} href={`/characters/${character.id}`}>
                                <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No members listed.</p>
                )}
            </div>
        </div>
    )
}
