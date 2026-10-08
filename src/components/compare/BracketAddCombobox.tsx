"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { TeamAddCombobox } from "@/components/compare/selectors/TeamAddCombobox";
import { CharacterOption } from "@/types";
import { X } from "lucide-react";
import Image from "next/image";

type Props = {
    ids: number[];
    size: number;
    excludeIds: number[];
    initialOptions?: CharacterOption[];
    characters?: CharacterOption[]; // Full character objects for rendering badges
};

export function BracketPicker({
    ids,
    size,
    excludeIds,
    initialOptions = [],
    characters = [],
}: Props) {
    const searchParams = useSearchParams();
    const { pushParams } = useParamLoading();

    const write = (nextIds: number[]) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set("mode", "bracket");
        params.set("size", String(size));
        if (nextIds.length) {
            params.set("p", nextIds.slice(0, size).join(","));
        } else {
            params.delete("p");
        }
        params.delete("a");
        params.delete("b");
        params.delete("id1");
        params.delete("id2");

        pushParams(params);
    };

    const handleRemove = (idToRemove: number) => {
        write(ids.filter((id) => id !== idToRemove));
    };

    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm transition-all">
            {/* Header / Roster Counter */}
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Bracket Roster</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                    {ids.length} / {size}
                </span>
            </div>

            {/* Selected Fighter Badges Grid */}
            {ids.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {ids.map((id) => {
                        const char = characters.find((c) => c.id === id);
                        return (
                            <div
                                key={id}
                                className="group flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-foreground"
                            >
                                {char?.images.md ? (
                                    <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0 border border-border">
                                        <Image
                                            src={char.images.md}
                                            alt={char.name}
                                            fill
                                            sizes="20px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                        #
                                    </span>
                                )}

                                <span className="truncate max-w-[120px]">
                                    {char ? char.name : `ID: ${id}`}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(id)}
                                    className="p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
                                    title="Remove fighter"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Combobox Search Input Container */}
            {ids.length < size && (
                <div className="rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    <TeamAddCombobox
                        paramKey="p"
                        ids={ids}
                        excludeIds={excludeIds}
                        initialOptions={initialOptions}
                        max={size}
                        placeholder={`Add fighter ${ids.length + 1} of ${size}…`}
                    />
                </div>
            )}
        </div>
    );
}