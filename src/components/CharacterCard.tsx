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
    const [loadingImage, setLoadingImage] = useState(true);

    const images = Object.values(character.images).filter((v): v is string => !!v && v !== null && v !== undefined && v !== "" && v !== "-" && v !== character.images.md && !v.includes("/api/images/xs/") && !v.includes("/api/images/sm/"));

    const [randomImageIndex, setRandomImageIndex] = useState(0);

    function getRandomImageIndex() {
        if (images.length != 0) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setRandomImageIndex(randomIndex);
        }
    }

    // console.log("CharacterCard: character:", character.name, character.biography.publisher);

    return (
        <Card onMouseEnter={getRandomImageIndex} className="group  h-full justify-between hover:scale-102 transition-transform duration-300 shadow-foreground shadow-2xl pt-0 overflow-visible">
            <ViewTransition name={`photo-${character.id}`}>
                {/* container ensures skeleton and image occupy same area and stack */}
                <div className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-60"} relative rounded-t-xl `}>
                    {/* <Image src={character.biography.publisher.logo} alt={`${character.name}'s image`} className="translate-y-5 group-hover:-translate-y-10 w-auto h-8 object-cover transition-all duration-500 animate-spin" width={800} height={1200} /> */}
                    {loadingImage && <Skeleton className="absolute inset-0 w-full h-full" />}
                    {images.length > 0 && (
                        <Image
                            src={images[randomImageIndex]}
                            alt={`${character.name}'s secondary image`}
                            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${loadingImage ? 'opacity-0' : 'opacity-100'} rounded-t-xl`}
                            width={800}
                            height={1200}
                        />
                    )}
                    <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        className={`${images.length > 0 && "group-hover:opacity-0"} absolute inset-0 w-full h-full object-cover transition-opacity duration-700  rounded-t-xl`}
                        width={800}
                        height={1200}
                        onLoad={() => setLoadingImage(false)}
                    />
                </div>
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

/* export function CharacterCardSkeleton() {
    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0 h-[300px]">
            <div className="absolute inset-0 z-30 bg-gray-200" />
            <CardHeader>
                <CardAction>
                    <CharacterBadge icon={<CircleQuestionMark className="text-gray-500" />} text="..." color="bg-gray-200 text-background" />
                </CardAction>
                <CardTitle className="bg-gray-200 text-background">Loading...</CardTitle>
                <CardDescription className="bg-gray-200 text-background">
                    Loading...
                </CardDescription>
            </CardHeader>
        </Card>
    )
} */

