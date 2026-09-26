import CharacterCard from "@/components/CharacterCard";
import { collectionCharacters, collectionTeams, collectionUniverses } from "@/db/mongodb";
import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";
import TeamCard from "@/components/TeamCard";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const universe = await collectionUniverses.findOne({ id: parseInt(id) });

    if (universe === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Universe not found</h1>
            </div>
        )
    }

    const universeTeams = await collectionTeams.find({ "universe": universe.id }).sort({ rand: 1 }).toArray();
    const universeCharacters = await collectionCharacters.find({ "biography.publisher": universe.name }).sort({ rand: 1 }).toArray();


    return (
        <div className="mx-auto pb-8 max-w-[90vw] space-y-5">
            <div className="flex flex-col md:flex-row items-center md:items-start space-x-5">
                <ViewTransition name={`photo-universe-${universe.id}`} share="morph">
                    <Image src={universe.logo} alt={universe.name} className="max-h-40 w-auto rounded-4xl" width={500} height={300} style={{ contain: "layout" }} />
                </ViewTransition>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{universe.name}</h1>
                    <p className="text-md font-light">{universe.id}-{universe.name}</p>
                    <p className="text-muted-foreground font-medium">{universe.description || "No description available."}</p>
                </div>
            </div>

            {/* FilterBar for sorting */}

            <div id="groups-affiliation" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">TEAMS ({universeTeams.length})</p>
                {universeTeams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch ">
                        {universeTeams.slice(0, 12).map((team) => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <TeamCard team={JSON.parse(JSON.stringify(team))} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No teams listed.</p>
                )}
            </div>

            <div id="groups-affiliation" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">CHARACTERS ({universeCharacters.length})</p>
                {universeCharacters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                        {universeCharacters.slice(0, 12).map((character) => (
                            <Link key={character.id} href={`/characters/${character.id}`}>
                                <CharacterCard character={JSON.parse(JSON.stringify(character))} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No characters listed.</p>
                )}
            </div>
        </div>
    )
}
