// components/compare/TeamProfileSlot.tsx
import Image from "next/image";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { LoadingLink } from "../shared/LoadingLink";
import { ViewTransition } from "react";
import { ChemistryResult } from "@/lib/compare/teamChemistry";

type Props = {
    entities: CharacterWithJoinTeamUniversePowerEnemies[];
    variant: "primary" | "secondary";
    score?: number | null;
    /** Optional label under avatars; defaults to joined names */
    label?: string;
    chemistry: ChemistryResult | null;
};

export function TeamProfileSlot({
    entities,
    variant,
    score,
    label,
    chemistry
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
                {entities.map((e) => (
                    <div
                        key={e.id}
                        className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 ${border} bg-card shrink-0`}
                        title={e.name}
                    >
                        <ViewTransition name={`character-${e.id}`}>
                            <Image
                                src={e.images?.md || e.images?.sm || "/placeholder.png"}
                                alt={e.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </ViewTransition>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
                {entities.map((e) => (
                    <LoadingLink key={e.id} href={`/characters/${e.id}`}>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 truncate max-w-28 ${nameColor}`}>
                            {e.name}
                        </span>
                    </LoadingLink>
                ))}
            </div>

            {score != null && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                    Avg score {score.toFixed(1)}
                </span>
            )}
            {chemistry != null && (
                <span className="text-[10px] text-muted-foreground">
                    Chem {chemistry.score}
                </span>
            )}
        </div>
    );
}