import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Universe } from "@/types";
import { ViewTransition } from "react";

type UniverseCardProps = {
    universe: Universe;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function UniverseCard({ universe, size }: UniverseCardProps) {
    return (
        <Card /* size={size} */ className="group h-full justify-between hover:scale-102 transition-transform duration-300 shadow hover:shadow-xl pt-0">
            {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
            <ViewTransition name={`photo-universe-${universe.id}`} share="morph">
                <div className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-40"} relative rounded-t-xl `}>
                    {/* <Image src={character.biography.publisher.logo} alt={`${character.name}'s image`} className="translate-y-5 group-hover:-translate-y-10 w-auto h-8 object-cover transition-all duration-500 animate-spin" width={800} height={1200} /> */}
                    {universe.background !== "" &&
                        <Image
                            src={universe.background}
                            alt={`${universe.name}'s background`}
                            className={`absolute opacity-0 group-hover:opacity-100 w-full h-full object-cover transition-opacity duration-300`}
                            width={800}
                            height={1200}
                            style={{ contain: "layout" }}
                        />
                    }
                    <Image
                        src={`${universe.logo}`}
                        alt={`${universe.name}'s image`}
                        // className={`w-full object-cover ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-t-xl`}
                        className={`${universe.background !== "" && "group-hover:opacity-0"} absolute inset-0 w-full h-full object-cover transition-opacity duration-800`}
                        width={800}
                        height={1200}
                    />
                </div>
            </ViewTransition>
            <CardHeader>
                {/* <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={CharacterAlignmentText(character.biography.alignment)} color={CharacterAlignmentColor(character.biography.alignment)} />
                </CardAction> */}
                <CardTitle className="text-lg font-bold">
                    {universe.name} <span className="text-xs text-muted-foreground font-medium">#{universe.id}</span>
                </CardTitle>
                <CardDescription>
                    {universe.description ? universe.description.slice(0, 100) + "..." : "No description available."}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}