import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Power } from "@/types";
import { ViewTransition } from "react";

type PowerCardProps = {
    power: Power;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function PowerCard({ power, size }: PowerCardProps) {
    return (
        <Card /* size={size} */ className="h-full hover:scale-102 transition-transform duration-300 shadow hover:shadow-xl">
            {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
            <ViewTransition name={`photo-power-${power.id}`} share="morph">
                <Image
                    src={`${power.img}`}
                    alt={`${power.name}'s image`}
                    className={`w-full object-cover ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-t-xl`}
                    width={800}
                    height={1200}
                    unoptimized
                />
            </ViewTransition>
            <CardHeader>
                {/* <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={CharacterAlignmentText(character.biography.alignment)} color={CharacterAlignmentColor(character.biography.alignment)} />
                </CardAction> */}
                <CardTitle className="text-lg font-bold flex items-center justify-between gap-2 min-w-0">
                    <span className="truncate" title={power.name}>
                        {power.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                        #{power.id}
                    </span>
                </CardTitle>

                {/* Clamp descriptions to max 2 lines for uniform height */}
                <CardDescription className="line-clamp-2 text-xs">
                    {power.description || "No description available."}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}