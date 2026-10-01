"use client"

import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { getCharacterAlignmentColor, getCharacterAlignmentText } from "@/lib/character_utils";
import CharacterBadge from "./CharacterBadge";
import { ViewTransition } from 'react'
import { CharacterBadgeIcon } from "@/lib/characters_utils";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON } from "@/lib/constants";
import { Mars, Venus } from "lucide-react";

type CharacterCardProps = {
    character: CharacterWithJoinTeamUniversePowerEnemies;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function CharacterCard({ character, size = "default" }: CharacterCardProps) {
    const TierIcon = CHARACTER_TIER_ICON[character.tier] ?? CHARACTER_TIER_ICON[0];
    const tierColor = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];

    const ClassIcon = CHARACTER_CLASS_ICON[character.class] ?? CHARACTER_CLASS_ICON[0];
    const classColor = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR] ?? CHARACTER_CLASS_COLOR[0];
    const characterClass = CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]

    const TypeIcon = CHARACTER_TYPE_ICON[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];
    const typeColor = CHARACTER_TYPE_COLOR[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];

    return (
        <Card className="group h-full justify-between hover:scale-102 hover:shadow-xl transition-all duration-300 pt-0 overflow-visible">
            <div className="relative">
                <ViewTransition name={`character-${character.id}`}>
                    {/* this image doesn't look full in mobile as in desktop, because the images are vertical not horizontal, and the face of the characters mostly are high in the picture */}
                    {/* <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        unoptimized
                        className={`h-80 w-full  object-cover transition-opacity duration-700  rounded-t-xl`}
                        width={800}
                        height={1200}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ contain: "layout" }}
                    /> */}
                    <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        unoptimized
                        className="w-full aspect-[3/4] sm:h-80 object-cover object-top transition-opacity duration-700 rounded-t-xl"
                        width={800}
                        height={1200}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ contain: "layout" }}
                    />
                </ViewTransition>
            </div>
            <CardHeader className="border-t- border-foreground/50">
                <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={getCharacterAlignmentText(character.biography.alignment)} color={getCharacterAlignmentColor(character.biography.alignment)} />
                </CardAction>
                <CardTitle className="text-lg font-bold transition-all duration-500">{character.name}</CardTitle>
            </CardHeader>
            {size !== "sm" && <CardDescription className="flex flex-row justify-between items-center gap-1 w-full px-5">
                <div className="flex  items-center">
                    <p>{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown" : character.biography.fullName}</p>
                    <span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                        #{character.id}
                    </span>
                </div>
                <Image src={character.biography.publisher.logo} alt="publisher" width={500} height={500} unoptimized className="h-10 w-auto rounded-md" />
            </CardDescription>}
            {size !== "sm" && <CardFooter className="p-0 border border-foreground/10 rounded-b-xl overflow-hidden ">
                <div className="grid grid-cols-4 w-full divide-x divide-foreground/50 text-center py-2 text-xs">
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Gender">
                        {character.appearance.gender === "Female" ? (
                            <Venus className="w-3.5 h-3.5 text-pink-500" />
                        ) : (
                            <Mars className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        <span className="text-[10px] font-medium text-muted-foreground">{character.appearance.gender || "—"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Type">
                        <TypeIcon className={`w-3.5 h-3.5 ${typeColor?.text ?? "text-muted-foreground"}`} />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{character.character_type || "Type"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Tier">
                        <TierIcon className={`w-3.5 h-3.5 ${tierColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">T{character.tier}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Class">
                        <ClassIcon className={`w-3.5 h-3.5 ${classColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">{characterClass?.split("/")[0].split(" ")[0] ?? "?"}</span>
                    </div>
                </div>
            </CardFooter>}
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

/* "use client"

import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { getCharacterAligmentIcon, getCharacterAlignmentTextColor } from "@/lib/character_utils";
import { ViewTransition } from 'react'
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON } from "@/lib/constants";
import { Mars, Venus } from "lucide-react";

type CharacterCardProps = {
    character: CharacterWithJoinTeamUniversePowerEnemies;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function CharacterCard({ character, size = "default" }: CharacterCardProps) {
    const AligmentIcon = getCharacterAligmentIcon(character.biography.alignment)
    const aligmentColor = getCharacterAlignmentTextColor(character.biography.alignment)

    const TierIcon = CHARACTER_TIER_ICON[character.tier] ?? CHARACTER_TIER_ICON[0];
    const tierColor = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];

    const ClassIcon = CHARACTER_CLASS_ICON[character.class] ?? CHARACTER_CLASS_ICON[0];
    const classColor = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR] ?? CHARACTER_CLASS_COLOR[0];
    const characterClass = CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]

    const TypeIcon = CHARACTER_TYPE_ICON[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];
    const typeColor = CHARACTER_TYPE_COLOR[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];

    return (
        <Card className="group h-full justify-between hover:scale-102 hover:shadow-xl transition-all duration-300 pt-0 overflow-visible gap-0">
            <div className="relative">
                <ViewTransition name={`character-${character.id}`}>
                    <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        unoptimized
                        className="w-full aspect-[3/4] sm:h-80 object-cover object-top transition-opacity duration-700 rounded-t-xl"
                        width={800}
                        height={1200}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ contain: "layout" }}
                    />
                </ViewTransition>
            </div>
            <CardHeader className="">
                <div className="flex flex-col items-center justify-center gap-0.5" title="Aligment">
                    <AligmentIcon className={`w-3.5 h-3.5 ${aligmentColor ?? "text-muted-foreground"}`} />
                    <span className="text-[10px] font-medium text-muted-foreground capitalize">{character.biography.alignment}</span>
                </div>
                <CardTitle className="text-lg font-bold transition-all duration-500 justify-between">{character.name}<span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">(#{character.id})</span></CardTitle>
            </CardHeader>
            <CardDescription className="flex flex-row justify-center items-center gap-1 w-full px-5 m-0">
                <div className="flex items-center">
                    <p>{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown" : character.biography.fullName}</p>
                    <span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                        #{character.id}
                    </span>
                </div>
                <Image src={character.biography.publisher.logo} alt="publisher" width={500} height={500} unoptimized className="h-20 w-auto" />
            </CardDescription>
            <CardFooter className="p-0 border border-foreground/10 rounded-b-xl overflow-hidden px-2">
                <div className="grid grid-cols-5 w-full divide-x divide-foreground/50 text-center py-2 text-xs">
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Gender">
                        {character.appearance.gender === "Female" ? (
                            <Venus className="w-3.5 h-3.5 text-pink-500" />
                        ) : (
                            <Mars className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        <span className="text-[10px] font-medium text-muted-foreground">{character.appearance.gender || "—"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Type">
                        <TypeIcon className={`w-3.5 h-3.5 ${typeColor?.text ?? "text-muted-foreground"}`} />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{character.character_type || "Type"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Tier">
                        <TierIcon className={`w-3.5 h-3.5 ${tierColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">T{character.tier}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5" title="Class">
                        <ClassIcon className={`w-3.5 h-3.5 ${classColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">{characterClass?.split("/")[0].split(" ")[0] ?? "?"}</span>
                    </div>
                </div>
            </CardFooter>
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
