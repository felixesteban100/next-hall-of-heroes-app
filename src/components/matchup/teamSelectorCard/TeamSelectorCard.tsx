import { TeamAddCombobox } from "./TeamAddCombobox";
import RemoveCharacterOfTeamButton from "./RemoveCharacterOfTeamButton";
import { MAX_TEAM_SIZE } from "@/app/(main)/matchup/page";
import { getAllTeamsWithMembers, searchCharacters } from "@/app/actions";
import { CharacterImage } from "@/components/shared/CharacterImage";
import { LoadAllTeamsDropdown } from "./LoadAllTeamsDropdown";

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
    selected: { id: number; name: string; slug: string; image: string; imageFocus: string }[];
    selectedIds: number[];
    excludeIds: number[];
    paramKey: "a" | "b";
    variant: "primary" | "secondary";
    max?: number;
}) {
    const characterOptions = await searchCharacters("", excludeIds, selectedIds);

    const accentText = variant === "primary" ? "text-primary" : "text-secondary";
    const accentBorder = variant === "primary" ? "border-primary/30" : "border-secondary/30";
    const accentBg = variant === "primary" ? "bg-primary/5" : "bg-secondary/5";
    const avatarRing = variant === "primary" ? "border-primary/40" : "border-secondary/40";

    return (
        <div className={`bg-card/80 backdrop-blur-md border ${accentBorder} ${accentBg} rounded-2xl p-3 sm:p-4 flex flex-col gap-3 min-w-0`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-black uppercase tracking-wider truncate ${accentText}`}>
                        {title}
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold tabular-nums shrink-0">
                        {selectedIds.length}/{max}
                    </span>
                </div>
                <div className="shrink-0">
                    <LoadAllTeamsDropdown
                        paramKey={paramKey}
                        excludeIds={excludeIds}
                        fetchTeamsAction={getAllTeamsWithMembers}
                    />
                </div>
            </div>

            {selected.length > 0 ? (
                <div className="max-h-48 sm:max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Auto-fills as many 56px+ slots as fit the card width */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2.5 sm:gap-3.5 justify-items-center">
                        {selected.map((c) => (
                            <div
                                key={c.id}
                                tabIndex={0}
                                className="group relative flex flex-col items-center gap-1 w-full max-w-[4.5rem] outline-none"
                            >
                                {/* Portrait */}
                                <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 ${avatarRing} shrink-0 bg-background/50`}>
                                    <CharacterImage
                                        src={c.image}
                                        alt={c.name}
                                        imageFocus={c.imageFocus}
                                        fill
                                        // sizes="(max-width: 640px) 44px, 48px"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    {/* Remove overlay: works on hover, keyboard focus, and tap-focus on mobile */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                                        <RemoveCharacterOfTeamButton
                                            paramKey={paramKey}
                                            selectedIds={selectedIds}
                                            idsToRemove={[c.id]}
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <span className="text-[10px] sm:text-[9px] text-muted-foreground text-center leading-tight truncate w-full font-medium">
                                    {c.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center py-6 border border-dashed border-muted-foreground/20 rounded-xl bg-background/20">
                    <p className="text-xs text-muted-foreground/50 font-medium">No characters added yet</p>
                </div>
            )}

            {/* Footer Actions: Combobox & Clear */}
            <div className="flex flex-col gap-2 pt-1">
                {selectedIds.length < max && (
                    <TeamAddCombobox
                        excludeIds={excludeIds}
                        initialOptions={characterOptions}
                        paramKey={paramKey}
                        ids={selectedIds}
                        placeholder="Add character to team…"
                    />
                )}

                {selectedIds.length > 1 && (
                    <div className="flex justify-end">
                        <RemoveCharacterOfTeamButton
                            paramKey={paramKey}
                            variant={variant === "primary" ? "default" : "secondary"}
                            selectedIds={selectedIds}
                            idsToRemove={selectedIds}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}