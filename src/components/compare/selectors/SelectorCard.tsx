// components/compare/SelectorCard.tsx
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
}