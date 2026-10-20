// components/compare/SelectorCard.tsx
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterCombobox } from "./CharacterCombobox";
import { searchCharacters } from "@/app/actions";
import { CharacterImage } from "@/components/shared/CharacterImage";

interface SelectorCardProps {
    title: string;
    selected: CharacterWithJoinTeamUniversePowerEnemies | null;
    otherSelectedId?: number;
    paramKey: "id1" | "id2";
    variant: "primary" | "secondary";
}

export async function SelectorCard({ title, selected, otherSelectedId, paramKey, variant }: SelectorCardProps) {
    const headingColor = variant === "primary" ? "text-primary" : "text-secondary";
    const borderAccent = variant === "primary" ? "border-primary/30" : "border-secondary/30";
    const bgAccent = variant === "primary" ? "bg-primary/5" : "bg-secondary/5";

    const characterOptions = await searchCharacters("", otherSelectedId);

    return (
        <div className={`bg-card border ${borderAccent} ${bgAccent} rounded-xl p-4 flex flex-col gap-3`}>
            <h2 className={`text-xs font-bold uppercase tracking-widest ${headingColor}`}>
                {title}
            </h2>

            {/* Portrait + name when selected */}
            {selected ? (
                <div className="flex flex-col items-center gap-2 py-1">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-muted-foreground/20 shrink-0">
                        <CharacterImage
                            src={selected.images?.md ?? selected.images?.sm ?? ""}
                            alt={selected.name}
                            imageFocus={selected.imageFocus}
                            fill
                            className="object-cover object-top w-full h-full"
                            unoptimized

                        />
                    </div>
                    <span className={`text-sm font-bold ${headingColor} text-center leading-tight`}>
                        {selected.name}
                    </span>
                </div>
            ) : (
                <div className="flex items-center justify-center py-3">
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/40 text-xs">
                        ?
                    </div>
                </div>
            )}

            <CharacterCombobox
                paramKey={paramKey}
                initialOptions={characterOptions}
                selectedId={selected?.id ?? 0}
                selectedName={selected?.name ?? ""}
                selectedSlug={selected?.slug ?? ""}
                selectedImageFocus={selected?.imageFocus ?? ""}
                excludeId={otherSelectedId}
            />
        </div>
    );
}

/* // components/compare/SelectorCard.tsx
// import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Image from "next/image";
import { CharacterCombobox } from "./CharacterCombobox";
import { searchCharacters } from "@/app/actions";
import { CharacterImage } from "@/components/shared/CharacterImage";

interface SelectorCardProps {
    title: string;
    selected: CharacterWithJoinTeamUniversePowerEnemies | null;
    otherSelectedId?: number;
    paramKey: "id1" | "id2";
    variant: "primary" | "secondary";
}

export async function SelectorCard({ title, selected, otherSelectedId, paramKey, variant }: SelectorCardProps) {
    const headingColor = variant === "primary" ? "text-primary" : "text-secondary";

    // Fetch lightweight index options for the combobox
    const characterOptions = await searchCharacters("", otherSelectedId)
    // const characterOptions = await collectionCharacters
    //     .aggregate<{ id: number; name: string; slug: string }>([
    //         {
    //             $match: {
    //                 ...(otherSelectedId != null
    //                     ? { id: { $ne: Number(otherSelectedId) } }
    //                     : {}),
    //             },
    //         },
    //         { $sample: { size: 10 } },
    //         {
    //             $project: {
    //                 _id: 0,
    //                 id: 1,
    //                 name: 1,
    //                 slug: 1,
    //                 "biography.fullName": 1, // string
    //                 "biography.alterEgos": 1, // string
    //                 "biography.aliases": 1 // Array
    //             },
    //         },
    //     ])
    //     .toArray();

    return (
        <div className="bg-card border border-muted-foreground/20 rounded-xl p-5 flex flex-col gap-3">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${headingColor}`}>
                {title}
            </h2>
            <div className="flex gap-3 items-center">
                {selected?.images?.md && (
                    <div className="aspect-4/4 relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-muted-foreground/20">
                        <CharacterImage
                            src={selected.images.md}
                            alt={selected.name}
                            imageFocus={selected.imageFocus}
                            fill
                            className="w-full h-full"
                            unoptimized
                        />
                    </div>
                )}

                <div className="flex-1">
                    <CharacterCombobox
                        paramKey={paramKey}
                        initialOptions={characterOptions}
                        selectedId={selected?.id ?? 0} // or make selectedId optional
                        selectedName={selected?.name ?? ""}
                        selectedSlug={selected?.slug ?? ""}
                        selectedImageFocus={selected?.imageFocus ?? ""}
                        excludeId={otherSelectedId} // only pass if defined
                    />
                </div>
            </div>
        </div>
    );
} */