import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Character, CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Link from "next/link";
import { LoadingLink } from "../shared/LoadingLink";

export function CharacterAccordionList({ characters }: { characters: CharacterWithJoinTeamUniversePowerEnemies[] | Character[] }) {
    // Group characters by alignment
    const heroes = characters.filter(c => c.biography.alignment === "good");
    const villains = characters.filter(c => c.biography.alignment === "bad");
    const neutral = characters.filter(c => c.biography.alignment !== "good" && c.biography.alignment !== "bad");

    const groups = [
        { label: "Heroes & Allies", data: heroes, color: "text-emerald-500" },
        { label: "Neutral / Others", data: neutral, color: "text-amber-500" },
        { label: "Villains & Enemies", data: villains, color: "text-rose-500" },
    ].filter(g => g.data.length > 0);

    return (
        <Accordion type="single" collapsible /* defaultValue={groups[0]?.label} */ className="w-full space-y-2">
            {groups.map(({ label, data, color }) => (
                <AccordionItem key={label} value={label} className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline py-3">
                        <span className="flex items-center gap-2 text-sm font-bold">
                            <span className={`text-base ${color}`}>●</span> {label} ({data.length})
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {data.map((char) => (
                                <LoadingLink
                                    key={char.id}
                                    href={`/characters/${char.id}`}
                                    className="px-2.5 py-1.5 rounded-md border bg-muted/40 hover:bg-primary/10 hover:border-primary text-xs font-medium transition-colors flex items-center gap-1.5"
                                >
                                    <span>{char.name}</span>
                                    <span className="text-[10px] text-muted-foreground">#{char.id}</span>
                                </LoadingLink>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}