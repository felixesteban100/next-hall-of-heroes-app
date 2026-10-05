import { CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { Character, CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { LoadingLink } from "../shared/LoadingLink";

export function CharacterMiniCardGrid({ characters }: { characters: CharacterWithJoinTeamUniversePowerEnemies[] | Character[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {characters.map((char) => {
                const TierIcon = CHARACTER_TIER_ICON[char.tier] ?? CHARACTER_TIER_ICON[0];
                const tierColor = CHARACTER_TIER_COLOR[char.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];

                return (
                    <LoadingLink
                        key={char.id}
                        href={`/characters/${char.id}`}
                        className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/60 transition-all hover:border-primary/50 flex flex-col justify-between gap-2 group"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">
                                    {char.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {char.biography.fullName || "—"}
                                </p>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                #{char.id}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
                            <span className={`flex items-center gap-1 text-[11px] font-semibold ${tierColor.text}`}>
                                <TierIcon size={13} /> T{char.tier}
                            </span>
                            <span className="text-muted-foreground text-[10px]">·</span>
                            <span className="text-xs text-muted-foreground capitalize truncate">
                                {char.character_type || "Standard"}
                            </span>
                        </div>
                    </LoadingLink>
                );
            })}
        </div>
    );
}