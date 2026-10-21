// components/compare/BracketPicker.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { TeamAddCombobox } from "@/components/compare/selectors/TeamAddCombobox";
import { CharacterOption } from "@/types";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { MAX_BRACKET_SIZE } from "@/app/(main)/compare/page";
import RemoveCharacterOfTeamButton from "../selectors/RemoveCharacterOfTeamButton";

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
        if (nextIds.length) {
            params.set("p", nextIds.slice(0, MAX_BRACKET_SIZE).join(","));
        } else {
            params.delete("p");
        }
        params.delete("a");
        params.delete("b");
        params.delete("id1");
        params.delete("id2");

        pushParams(params);
    };

    // Map selected IDs to match the selected array structure used by TeamSelectorCard
    // const selectedCharacters = ids.map((id) => {
    //     const char = characters.find((c) => c.id === id);
    //     return {
    //         id,
    //         name: char ? char.name : `ID: ${id}`,
    //         slug: char?.slug || "",
    //         image: char?.images?.md,
    //         imageFocus: char?.imageFocus || "",
    //     };
    // });

    const selectedCharacters = ids.map((id) => {
        const char = characters.find((c) => c.id === id);
        return {
            id,
            name: char ? char.name : `ID: ${id}`,
            slug: char?.slug || "",
            image: char?.images?.md,
            imageFocus: char?.imageFocus || "",
        };
    });

    const accentText = "text-primary";
    const accentBorder = "border-primary/30";
    const accentBg = "bg-primary/5";
    const avatarRing = "border-primary/40";

    return (
        <div className={`bg-card border ${accentBorder} ${accentBg} rounded-xl p-4 flex flex-col gap-3`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest ${accentText}`}>
                    Bracket Roster
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {ids.length} / {size}
                </span>
            </div>

            {/* Roster grid — portrait cards */}
            {selectedCharacters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {selectedCharacters.map((c) => (
                        <div key={c.id} className="group relative flex flex-col items-center gap-0.5 w-12">
                            {/* Portrait */}
                            <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${avatarRing} shrink-0 bg-card`}>
                                <CharacterImage
                                    src={c.image}
                                    alt={c.name}
                                    imageFocus={c.imageFocus}
                                    fill
                                    className="w-12 h-12 rounded-md shrink-0 object-cover"
                                />
                                {/* Remove button on hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <RemoveCharacterOfTeamButton
                                        paramKey={"a" as any} // bracket uses param "p", but we can handle removal locally via write or pass custom handler if needed
                                        selectedIds={ids}
                                        idsToRemove={[c.id]}
                                    />
                                </div>
                            </div>
                            {/* Name */}
                            <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full font-medium">
                                {c.name}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center py-4 border border-dashed border-muted-foreground/20 rounded-lg">
                    <p className="text-xs text-muted-foreground/50">No characters added yet</p>
                </div>
            )}

            {/* Add combobox */}
            {ids.length < size && (
                <div className="w-full">
                    <TeamAddCombobox
                        paramKey="p"
                        ids={ids}
                        excludeIds={excludeIds}
                        initialOptions={initialOptions}
                        max={size}
                        placeholder={`Add fighter ${ids.length} of ${size}…`}
                    />
                </div>
            )}

            {/* Clear all */}
            {ids.length > 1 && (
                <button
                    type="button"
                    onClick={() => write([])}
                    className="text-xs text-muted-foreground hover:text-foreground text-center py-1 transition-colors"
                >
                    Clear bracket roster
                </button>
            )}
        </div>
    );
}

// "use client";

// import { useSearchParams } from "next/navigation";
// import { useParamLoading } from "@/components/layout/ParamLoadingContext";
// import { TeamAddCombobox } from "@/components/compare/selectors/TeamAddCombobox";
// import { CharacterOption } from "@/types";
// import { X } from "lucide-react";
// import { CharacterImage } from "../shared/CharacterImage";
// import { MAX_BRACKET_SIZE } from "@/app/(main)/compare/page";

// type Props = {
//     ids: number[];
//     size: number;
//     excludeIds: number[];
//     initialOptions?: CharacterOption[];
//     characters?: CharacterOption[]; // Full character objects for rendering badges
// };

// export function BracketPicker({
//     ids,
//     size,
//     excludeIds,
//     initialOptions = [],
//     characters = [],
// }: Props) {
//     const searchParams = useSearchParams();
//     const { pushParams } = useParamLoading();

//     const write = (nextIds: number[]) => {
//         const params = new URLSearchParams(searchParams.toString());

//         params.set("mode", "bracket");
//         // params.set("size", String(size));
//         if (nextIds.length) {
//             params.set("p", nextIds.slice(0, MAX_BRACKET_SIZE).join(","));
//         } else {
//             params.delete("p");
//         }
//         params.delete("a");
//         params.delete("b");
//         params.delete("id1");
//         params.delete("id2");

//         pushParams(params);
//     };

//     const handleRemove = (idToRemove: number) => {
//         write(ids.filter((id) => id !== idToRemove));
//     };

//     return (
//         <div className="flex flex-col rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm transition-all">
//             {/* Header / Roster Counter */}
//             <div className="flex items-center justify-between pb-1 border-b border-border/50">
//                 <div className="flex items-center gap-2">
//                     <span className="text-sm font-bold text-foreground">Bracket Roster</span>
//                 </div>
//                 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
//                     {ids.length} / {size}
//                 </span>
//             </div>

//             {/* Selected Fighter Badges Grid */}
//             {ids.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                     {ids.map((id) => {
//                         const char = characters.find((c) => c.id === id);
//                         return (
//                             <div
//                                 key={id}
//                                 className="group flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-foreground"
//                             >
//                                 {char?.images.md ? (
//                                     <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-border">
//                                         <CharacterImage
//                                             src={char.images.md}
//                                             alt={char.name}
//                                             imageFocus={char.imageFocus}
//                                             width={400}
//                                             height={500}
//                                             className="w-full h-full"
//                                         />
//                                     </div>
//                                 ) : (
//                                     <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
//                                         #
//                                     </span>
//                                 )}

//                                 <span className="truncate max-w-[120px]">
//                                     {char ? char.name : `ID: ${id}`}
//                                 </span>

//                                 <button
//                                     type="button"
//                                     onClick={() => handleRemove(id)}
//                                     className="p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
//                                     title="Remove fighter"
//                                 >
//                                     <X className="w-3 h-3" />
//                                 </button>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {/* Combobox Search Input Container */}
//             {ids.length < size && (
//                 <div className="rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
//                     <TeamAddCombobox
//                         paramKey="p"
//                         ids={ids}
//                         excludeIds={excludeIds}
//                         initialOptions={initialOptions}
//                         max={size}
//                         placeholder={`Add fighter ${ids.length} of ${size}…`}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }