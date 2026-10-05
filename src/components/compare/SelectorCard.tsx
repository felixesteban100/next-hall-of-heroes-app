// components/compare/SelectorCard.tsx
import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Image from "next/image";
import { CharacterCombobox } from "./CharacterCombobox";

interface SelectorCardProps {
    title: string;
    selected: CharacterWithJoinTeamUniversePowerEnemies;
    otherSelectedId: number;
    paramKey: "id1" | "id2";
    variant: "primary" | "secondary";
}

export async function SelectorCard({ title, selected, otherSelectedId, paramKey, variant }: SelectorCardProps) {
    const headingColor = variant === "primary" ? "text-primary" : "text-secondary";

    console.log(otherSelectedId)

    // Fetch lightweight index options for the combobox
    const characterOptions = await collectionCharacters
        .find({ id: { $ne: otherSelectedId } })
        .project<{ id: number; name: string; slug: string }>({ _id: 0, id: 1, name: 1, slug: 1 })
        .sort({ name: 1 })
        .limit(10)
        .toArray();

    return (
        <div className="bg-card border border-muted-foreground/20 rounded-xl p-5 flex flex-col gap-3">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${headingColor}`}>
                {title}
            </h2>
            <div className="flex gap-3 items-center">
                {selected?.images?.md && (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-muted-foreground/20">
                        <Image
                            src={selected.images.md}
                            alt={selected.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}

                <div className="flex-1">
                    <CharacterCombobox
                        paramKey={paramKey}
                        initialOptions={characterOptions}
                        selectedId={selected.id}
                        selectedName={selected.name}
                        selectedSlug={selected.slug}
                        excludeId={otherSelectedId}
                    />
                </div>
            </div>
        </div>
    );
}