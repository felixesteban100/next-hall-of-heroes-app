// components/compare/TeamProfileSlot.tsx
import Image from "next/image";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

type Props = {
    entities: CharacterWithJoinTeamUniversePowerEnemies[];
    variant: "primary" | "secondary";
    score?: number | null;
    /** Optional label under avatars; defaults to joined names */
    label?: string;
};

export function TeamProfileSlot({
    entities,
    variant,
    score,
    label,
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

    const title =
        label ??
        (entities.length <= 2
            ? entities.map((e) => e.name).join(" · ")
            : `${entities.length} members`);

    return (
        <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            {/* Overlapping avatars */}
            <div className="flex items-center -space-x-3">
                {entities.slice(0, 4).map((e) => (
                    <div
                        key={e.id}
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 ${border} shadow-md bg-card shrink-0`}
                    >
                        <Image
                            src={e.images?.md || e.images?.sm || "/placeholder.png"}
                            alt={e.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            <span
                className={`${nameColor} text-xs sm:text-sm md:text-base font-bold text-center break-words max-w-full`}
            >
                {title}
            </span>

            {score != null && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                    Avg score {score.toFixed(1)}
                </span>
            )}
        </div>
    );
}