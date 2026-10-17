import { TeamAddCombobox } from "./TeamAddCombobox";
import RemoveCharacterOfTeamButton from "./RemoveCharacterOfTeamButton";
import { MAX_TEAM_SIZE } from "@/app/(main)/compare/page";
import { searchCharacters } from "@/app/actions";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { Button } from "@/components/ui/button";

export async function TeamSelectorCard({
    title,
    selected,
    selectedIds,
    excludeIds,
    paramKey,
    variant,
    max = MAX_TEAM_SIZE,
}: {
    title: string;
    selected: { id: number; name: string; slug: string, image: string, imageFocus: string }[];
    selectedIds: number[];
    excludeIds: number[];
    paramKey: "a" | "b";
    variant: "primary" | "secondary";
    max?: number;
}) {


    // Fetch lightweight index options for the combobox
    const characterOptions = await searchCharacters("", excludeIds, selectedIds)

    return (
        <div className="bg-card border border-muted-foreground/20 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between text-xs">
                <span className={`${variant === "primary" ? "text-primary" : "text-secondary"} uppercase font-bold tracking-widest`}>
                    {title}
                </span>
                <span className="text-muted-foreground">
                    {selectedIds.length} / {max}
                </span>
            </div>

            <div className="flex flex-col gap-2 items-center">
                <div className="flex flex-wrap gap-2">
                    {selected.map((c) => (
                        <div
                            key={c.id}
                            className={`rounded-full px-1 py-[3px] flex gap-2 justify-start items-center ${variant === "primary" ? "bg-primary/10 border border-primary" : "bg-secondary/10 border border-secondary"}`}
                        >
                            <CharacterImage
                                src={c.image}
                                alt={c.name}
                                imageFocus={c.imageFocus}
                                fill
                                className="w-12 h-12 rounded-full shrink-0"
                            />
                            <span>{c.name}</span>
                            <RemoveCharacterOfTeamButton
                                paramKey={paramKey}
                                selectedIds={selectedIds}
                                idsToRemove={[c.id]}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 w-full">
                    {selectedIds.length < max && (
                        <TeamAddCombobox
                            excludeIds={excludeIds}
                            initialOptions={characterOptions} // optional from server
                            paramKey={paramKey}
                            ids={selectedIds}
                            // onAdd={(id) => write([...selectedIds, id])}
                            placeholder="Add character…"
                        />
                    )}
                </div>

                {selectedIds.length > 1 &&
                    <RemoveCharacterOfTeamButton
                        paramKey={paramKey}
                        variant={variant === "primary" ? "default" : "secondary"}
                        selectedIds={selectedIds}
                        idsToRemove={selectedIds}
                    />}
            </div>
        </div>
    );
}