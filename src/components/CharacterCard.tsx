"use client"

import { /* Character, */ CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { getCharacterAlignmentColor, getCharacterAlignmentText } from "@/lib/character_utils";
import CharacterBadge from "./CharacterBadge";
import { useState, ViewTransition } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CharacterBadgeIcon } from "@/lib/characters_utils";

type CharacterCardProps = {
    // character: Character;
    character: CharacterWithJoinTeamUniversePowerEnemies;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function CharacterCard({ character, size = "default" }: CharacterCardProps) {
    // const [loadingImage, setLoadingImage] = useState(true);

    // const images = Object.values(character.images).filter((v): v is string => !!v && v !== null && v !== undefined && v !== "" && v !== "-" && v !== character.images.md && !v.includes("/api/images/xs/") && !v.includes("/api/images/sm/"));

    /* const [randomImageIndex, setRandomImageIndex] = useState(0);

    function getRandomImageIndex() {
        if (images.length != 0) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImageIndex(randomIndex);
        }
    } */

    // console.log("CharacterCard: character:", character.name, character.biography.publisher);

    return (
        <Card /* onMouseEnter={getRandomImageIndex} */ className="group h-full justify-between hover:scale-102 transition-transform duration-300 shadow-foreground shadow-2xl pt-0 overflow-visible">
            <ViewTransition name={`photo-${character.id}`}>
                {/* container ensures skeleton and image occupy same area and stack */}
                {/* <div className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-60"} relative rounded-t-xl `}>
                    {loadingImage && <Skeleton className="absolute inset-0 w-full h-full" />}
                    {images.length > 0 && (
                        <Image
                            src={images[randomImageIndex]}
                            alt={`${character.name}'s secondary image`}
                            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${loadingImage ? 'opacity-0' : 'opacity-100'} rounded-t-xl`}
                            width={800}
                            height={1200}
                            unoptimized
                        />
                    )}
                    <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        className={`${images.length > 0 && "group-hover:opacity-0"} absolute inset-0 w-full h-full object-cover transition-opacity duration-700  rounded-t-xl`}
                        width={800}
                        height={1200}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onLoad={() => setLoadingImage(false)}
                    />
                </div> */}
                <Image
                    src={`${character.images.md}`}
                    alt={`${character.name}'s main image`}
                    unoptimized
                    // className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-60"} w-full h-full object-cover transition-opacity duration-700  rounded-t-xl`}
                    className={`h-80 w-full  object-cover transition-opacity duration-700  rounded-t-xl`}
                    width={800}
                    height={1200}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                // onLoad={() => setLoadingImage(false)}
                />
            </ViewTransition>
            <CardHeader>
                <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={getCharacterAlignmentText(character.biography.alignment)} color={getCharacterAlignmentColor(character.biography.alignment)} />
                </CardAction>
                <CardTitle className="text-lg font-bold group-hover: transition-all duration-500">{character.name}</CardTitle>
                <CardDescription className="flex flex-row justify-between gap-1 w-full">
                    {/* {character.biography.origin} */}
                    <p>{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown" : character.biography.fullName}</p>
                    {/* <p>{character.biography.publisher}</p> */}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

/* export function CharacterCardSkeleton({ size = "default" }: { size?: "default" | "sm" | "lg" | undefined }) {
    return (
        <Card className="group  h-full justify-between hover:scale-102 transition-transform duration-300 shadow-foreground shadow-2xl pt-0 overflow-visible">
            <div className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-60"} relative rounded-t-xl `}>
                <Skeleton className="absolute inset-0 w-full h-full" />
            </div>
            <CardHeader>
                <CardAction>
                    <Skeleton className="w-20 h-6" />
                </CardAction>
                <CardTitle className="text-lg font-bold group-hover: transition-all duration-500">
                    <Skeleton className="w-32 h-6" />
                </CardTitle>
                <CardDescription className="flex flex-row justify-between gap-1 w-full">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-4" />
                </CardDescription>
            </CardHeader>
        </Card>
    )
} */

