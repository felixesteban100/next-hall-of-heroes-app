import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Power } from "@/types";

type PowerCardProps = {
    power: Power;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function PowerCard({ power, size }: PowerCardProps) {
    return (
        <Card /* size={size} */ className="h-full hover:scale-102 transition-transform duration-300 shadow hover:shadow-xl">
            {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
            <Image
                src={`${power.img}`}
                alt={`${power.name}'s image`}
                className={`w-full object-cover ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-t-xl`}
                width={800}
                height={1200}
            />
            <CardHeader>
                {/* <CardAction>
                    <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={CharacterAlignmentText(character.biography.alignment)} color={CharacterAlignmentColor(character.biography.alignment)} />
                </CardAction> */}
                <CardTitle>{power.name}</CardTitle>
                <CardDescription>
                    {power.description ? `${power.description.slice(0, 100)}...` : "No description available."}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}