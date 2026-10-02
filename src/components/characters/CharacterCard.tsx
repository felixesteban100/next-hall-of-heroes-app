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
import { useIsMobile } from "./CharacterGrid";

type CharacterCardProps = {
    character: CharacterWithJoinTeamUniversePowerEnemies;
}

export default function CharacterCard({ character }: CharacterCardProps) {
    const isMobile = useIsMobile();

    const TierIcon = CHARACTER_TIER_ICON[character.tier] ?? CHARACTER_TIER_ICON[0];
    const tierColor = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];

    const ClassIcon = CHARACTER_CLASS_ICON[character.class] ?? CHARACTER_CLASS_ICON[0];
    const classColor = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR] ?? CHARACTER_CLASS_COLOR[0];
    const characterClass = CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]

    const TypeIcon = CHARACTER_TYPE_ICON[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];
    const typeColor = CHARACTER_TYPE_COLOR[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR];

    return (
        <Card
            className="group h-full w-full flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 pt-0 overflow-hidden shadow-none md:hover:shadow-2xl rounded-2xl"
        >
            <div className={`relative ${isMobile ? "flex-1 min-h-0 w-full" : "aspect-[4/4]"} bg-muted/20 overflow-hidden`}>
                <ViewTransition name={`character-${character.id}`}>
                    <Image
                        src={`${character.images.md}`}
                        alt={`${character.name}'s main image`}
                        unoptimized
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ contain: "layout" }}
                    />
                </ViewTransition>
            </div>
            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-5 shrink-0">
                <CardTitle className="text-lg font-bold transition-all duration-500">{character.name}</CardTitle>
                <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={getCharacterAlignmentText(character.biography.alignment)} color={getCharacterAlignmentColor(character.biography.alignment)} />
            </CardHeader>
            <CardDescription className="flex flex-row justify-between items-center gap-1 w-full px-5 shrink-0">
                <div className="flex items-center">
                    <p>{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown" : character.biography.fullName}</p>
                    <span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                        #{character.id}
                    </span>
                </div>
                <Image src={character.biography.publisher.logo} alt="publisher" width={500} height={500} unoptimized className="h-12 w-auto rounded-md" />
            </CardDescription>
            <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0">
                <div className="grid grid-cols-4 w-full divide-x divide-foreground/50 text-center text-xs">
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