import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Team } from "@/types";
import { ViewTransition } from "react";

type TeamCardProps = {
    team: Team | Omit<Team, "universe">;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function TeamCard({ team, size }: TeamCardProps) {
    return (
        <Card size={size} className="h-full justify-between hover:scale-102 transition-transform duration-300 shadow hover:shadow-xl">
            {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
            <ViewTransition name={`photo-team-${team.id}`} share="morph">
                <Image
                    src={`${team.logo}`}
                    alt={`${team.name}'s image`}
                    className={`w-full object-cover ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-t-xl`}
                    width={800}
                    height={1200}
                />
            </ViewTransition>
            <CardHeader>
                {/* <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={CharacterAlignmentText(character.biography.alignment)} color={CharacterAlignmentColor(character.biography.alignment)} />
                </CardAction> */}
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                    {team.description ? team.description.slice(0, 100) + "..." : "No description available."}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}