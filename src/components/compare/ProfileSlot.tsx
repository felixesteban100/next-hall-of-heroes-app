import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Image from "next/image";
import { ViewTransition } from "react";
import { LoadingLink } from "../shared/LoadingLink";

export function ProfileSlot({
    entity,
    variant,
}: {
    entity: CharacterWithJoinTeamUniversePowerEnemies | null;
    variant: "primary" | "secondary";
}) {
    const border =
        variant === "primary" ? "border-primary" : "border-secondary";
    const nameColor =
        variant === "primary" ? "text-primary" : "text-secondary";

    if (!entity) {
        return (
            <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <div
                    className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg border-2 border-dashed ${border} opacity-40 bg-muted/30`}
                />
                <span className="text-xs sm:text-sm">Select a character</span>
            </div>
        );
    }

    return (
        <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <ViewTransition name={`character-${entity.id}`}>
                <div
                    className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 ${border} shadow-md bg-card shrink-0`}
                >
                    <Image
                        src={entity.images?.md}
                        alt={entity.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </ViewTransition>
            <span
                className={`${nameColor} text-xs sm:text-base md:text-lg text-center wrap-break max-w-full`}
            >
                {entity.name}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground italic text-center wrap-break max-w-full">
                {entity.biography?.fullName || "N/A"}
            </span>
            <LoadingLink href={`/characters/${entity.id}`} className="mt-0.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground underline hover:text-primary transition-colors">
                    View Profile
                </span>
            </LoadingLink>
        </div>
    );
}