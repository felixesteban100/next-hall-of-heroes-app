import { collectionCharacters, collectionTeams, collectionUniverses } from "@/db/mongodb";
import Image from "next/image";
import { ViewTransition } from "react";
import { CharacterAccordionList } from "@/components/characters/CharacterAccordionList";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import { CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON, CHARACTER_TYPE_LABEL } from "@/lib/constants";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";
import { MasonryGallery } from "@/components/shared/MasonryGallery";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { getRandom10Ids } from "@/lib/character_utils";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const universe = await collectionUniverses.findOne({ id: parseInt(id) });

    if (universe === null) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center">
                <h1 className="text-2xl font-bold">Universe not found</h1>
            </div>
        );
    }

    const universeTeams = await collectionTeams.find({ "universe": universe.id }).sort({ name: 1 }).toArray();
    const universeCharacters = await collectionCharacters.find({ "biography.publisher": universe.name }).sort({ name: 1 }).toArray();

    const TypeIcon = CHARACTER_TYPE_ICON[universe.type as keyof typeof CHARACTER_TYPE_ICON]
    const typeColors = CHARACTER_TYPE_COLOR[universe.type as keyof typeof CHARACTER_TYPE_ICON]

    return (
        <div className="mx-auto pb-8 max-w-[90vw] space-y-6 mt-4">
            {/* Header with Quick Stats Bar */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6  pb-6">
                <ViewTransition name={`universe-${universe.id}`} share="morph">
                    <div className=" p-4 rounded-3xl  flex items-center justify-center shrink-0">
                        <Image
                            src={universe.logo}
                            alt={universe.name}
                            className="max-w-[20rem] max-h-[10rem] object-contain"
                            width={500}
                            height={300}
                            style={{ contain: "layout" }}
                        />
                    </div>
                </ViewTransition>

                <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold">{universe.name}</h1>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            #{universe.id}
                        </span>

                        <Badge className={`${typeColors.bg} ${typeColors.foreground}`}><TypeIcon size={16} className="mr-1" /> Type {CHARACTER_TYPE_LABEL[universe.type as keyof typeof CHARACTER_TYPE_LABEL]}</Badge>
                    </div>

                    <p className="text-muted-foreground text-sm font-normal">
                        {universe.description || "No description available."}
                    </p>

                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary shrink-0" />
                            <span>Characters: <strong className="text-foreground">{universeCharacters.length}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-primary shrink-0" />
                            <span>Teams: <strong className="text-foreground">{universeTeams.length}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Characters Section */}
            <div id="universe-characters" className="space-y-3">
                <div className="flex items-center justify-between">
                    <LoadingLink href={`/characters?universe=${universe.name}`} className="text-sm font-medium uppercase text-primary tracking-wider hover:underline">
                        CHARACTERS ({universeCharacters.length})
                    </LoadingLink>
                    <LoadingLink href={`/compare?a=${getRandom10Ids(universeCharacters.map(c => c.id)).join(",")}`}>
                        Compare characters (max 10 random)
                    </LoadingLink>
                </div>
                <CharacterAccordionList characters={universeCharacters} />
            </div>

            {/* Compact Grid for Teams */}
            <div id="universe-teams" className="space-y-3">
                <p className="text-sm font-medium uppercase text-primary tracking-wider">
                    TEAMS ({universeTeams.length})
                </p>
                <MiniEntityGrid
                    items={universeTeams}
                    entityType="team"
                    showAlignment={true}
                />
            </div>

            {/* gallery of comics */}
            {universe.comics.length > 0 &&
                <div id="gallery" className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Gallery
                    </p>

                    <MasonryGallery images={Object.fromEntries(universe.comics.map((comic, index) => [String(index), comic]))} characterName={universe.name} />
                </div>
            }
        </div>
    );
}