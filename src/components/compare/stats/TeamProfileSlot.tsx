import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ViewTransition } from "react";
import { computeMatchScore } from "@/lib/compare";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { CharacterImage } from "@/components/shared/CharacterImage";
import ScoreBadgeOnCard from "@/components/shared/ScoreBadgeOnCard";


type Props = {
    entities: CharacterWithJoinTeamUniversePowerEnemies[];
    variant: "primary" | "secondary";
};

export function TeamProfileSlot({
    entities,
    variant,
}: Props) {
    const border =
        variant === "primary" ? "border-primary" : "border-secondary";
    const nameColor =
        variant === "primary" ? "text-primary" : "text-secondary";

    if (!entities.length) {
        return (
            <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed ${border} opacity-40 bg-muted/30`}
                />
                <span className="text-xs">Add characters</span>
            </div>
        );
    }

    return (
        <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full mt-2">
                {entities.map(c => ({ ...c, overall: computeMatchScore(c).overall })).sort((a, b) => b.overall - a.overall).map((e) => (
                    <LoadingLink key={e.id} href={`/characters/${e.id}`} className="flex flex-col justify-center items-center">
                        <div
                            key={e.id}
                            className={`relative w-12 h-12 md:w-20 md:h-20 border-2 ${border} bg-card shrink-0 rounded-lg`}
                            title={e.name}
                        >
                            <ViewTransition name={`character-${e.id}`}>
                                <CharacterImage
                                    src={e.images.md}
                                    alt={e.name}
                                    fill
                                    className="w-full h-full object-cover overflow-hidden rounded-md"
                                    unoptimized
                                    imageFocus={e.imageFocus}
                                />

                            </ViewTransition>
                            <ScoreBadgeOnCard
                                entity={e}
                                score={computeMatchScore(e).overall}
                                side="front"
                            />
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 truncate max-w-28 ${nameColor}`}>
                            {e.name}
                        </span>
                    </LoadingLink>
                ))}
            </div>
        </div>
    );
}