"use client"

import { /* Character, */ CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { getCharacterAlignmentColor, getCharacterAlignmentText } from "@/lib/character_utils";
import CharacterBadge from "./CharacterBadge";
import { ViewTransition } from 'react'
// import { Skeleton } from "@/components/ui/skeleton"
import { CharacterBadgeIcon } from "@/lib/characters_utils";

type CharacterCardProps = {
    // character: Character;
    character: CharacterWithJoinTeamUniversePowerEnemies;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function CharacterCard({ character, size = "default" }: CharacterCardProps) {
    return (
        <Card className="group h-full justify-between hover:scale-102 transition-transform duration-300 shadow-foreground shadow-2xl pt-0 overflow-visible">
            <ViewTransition name={`photo-${character.id}`}>
                <Image
                    src={`${character.images.md}`}
                    alt={`${character.name}'s main image`}
                    unoptimized
                    className={`h-80 w-full  object-cover transition-opacity duration-700  rounded-t-xl`}
                    width={800}
                    height={1200}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    style={{ contain: "layout" }}
                />
            </ViewTransition>
            <CardHeader>
                <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={getCharacterAlignmentText(character.biography.alignment)} color={getCharacterAlignmentColor(character.biography.alignment)} />
                </CardAction>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-all duration-500">{character.name}</CardTitle>
            </CardHeader>
            <CardDescription className="flex flex-row justify-between gap-1 w-full px-5">
                {/* {character.biography.origin} */}
                <p>{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown" : character.biography.fullName}</p>
                <span className="text-xs text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                    #{character.id}
                </span>
            </CardDescription>
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

