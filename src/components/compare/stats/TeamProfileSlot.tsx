import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ViewTransition } from "react";
import { ChemistryResult } from "@/lib/compare/teamChemistry";
import { Crown } from "lucide-react";
import { computeMatchScore } from "@/lib/compare/compare_utls";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { CharacterImage } from "@/components/shared/CharacterImage";

type Props = {
    entities: CharacterWithJoinTeamUniversePowerEnemies[];
    variant: "primary" | "secondary";
    powerEstimate?: number;
    chemistry: ChemistryResult | null;
    mvp: string
};

export function TeamProfileSlot({
    entities,
    variant,
    powerEstimate,
    chemistry,
    mvp
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
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full">
                {entities.map(c => ({ ...c, overall: computeMatchScore(c).overall })).sort((a, b) => b.overall - a.overall).map((e) => (
                    <LoadingLink key={e.id} href={`/characters/${e.id}`} className="flex flex-col justify-center items-center">
                        <div
                            key={e.id}
                            /*  sm:w-12 sm:h-12 md:w-14 md:h-14  */
                            className={`relative w-13 h-13 border-2 ${border} bg-card shrink-0 rounded-lg`}
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
                                {/* MVP Star Badge */}
                                {(mvp === e.name) && (
                                    <div
                                        title="Team MVP"
                                        className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-black p-0.5 rounded-full shadow-md border border-background animate-pulse-gold"
                                    >
                                        <Crown className="size-3 fill-black " /> {/* or <Star className="size-3 fill-black" /> */}
                                    </div>
                                )}
                            </ViewTransition>

                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 truncate max-w-28 ${nameColor}`}>
                            {e.name}
                        </span>
                    </LoadingLink>
                ))}
            </div>

            {powerEstimate != null && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                    PowerEstimate {powerEstimate.toFixed(1)}
                </span>
            )}
            {chemistry != null && (
                <span className="text-[10px] text-muted-foreground">
                    Chem{" "}+{chemistry.score}
                </span>
            )}
        </div>
    );
}