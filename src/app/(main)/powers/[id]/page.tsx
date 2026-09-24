import CharacterCard from "@/components/CharacterCard";
import { collectionCharacters, collectionPowers } from "@/db/mongodb";
import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const power = await collectionPowers.findOne({ id: parseInt(id) });

    if (power === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Power not found</h1>
            </div>
        )
    }

    const powerCharacters = await collectionCharacters.find({ "powers": { $in: [power.id] } }).sort({ rand: 1 }).toArray();

    return (
        <div className="mx-auto pb-8 max-w-[90vw] space-y-5">
            <div className="flex flex-col md:flex-row gap-5 items-center md:items-start ">
                <ViewTransition name={`photo-power-${power.id}`} share="morph">
                    <Image src={power.img} alt={power.name} className="h-52 md:h-48 w-52 rounded-md object-cover" width={500} height={300} />
                </ViewTransition>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{power.name}</h1>
                    <p className="text-md font-light">{power.id}-{power.name}</p>
                    <p className="text-muted-foreground font-medium">{power.description || "No description available."}</p>
                </div>
            </div>
            {/* FilterBar for sorting */}
            <div id="groups-affiliation" className="space-y-2 items-center w-full px-4">
                <p className="text-sm font-light uppercase text-primary mb-2">MEMBERS</p>
                {powerCharacters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                        {powerCharacters.map((character) => (
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
