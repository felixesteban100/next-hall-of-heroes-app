import { CacheClearButton } from "@/components/filters/CacheClearButton";
import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterGrid } from "@/components/characters/CharacterGrid";
import { sanitize } from "@/lib/utils";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";

export default async function Random() {
    "use cache"
    const charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
        [
            {
                $lookup: {
                    from: "universes",
                    localField: "biography.publisher",
                    foreignField: "value",
                    pipeline: [{ $project: { teams: 0 } }],
                    as: "biography.publisher",
                },
            },
            { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },
            { $sample: { size: 12 } }
        ]
    ).toArray();

    const sanitizedCharacters = sanitize(charactersPerPage);

    return (
        <div className="flex flex-col mt-4 overflow-visible ">
            {/* <h1 className="text-2xl font-bold">Random Characters</h1>
            <div className="text-muted-foreground font-light">
                8 random characters across all universes
            </div> */}
            <div className="flex items justify-end w-full gap-2">
                <CacheClearButton path="/random" />
                <Button size="sm" variant="outline" asChild>
                    <LoadingLink href={`/compare?mode=bracket&size=8&p=${charactersPerPage.map(c => c.id)}`}>
                        <Sparkle /> <span className="hidden md:inline">Compare randoms in bracket</span>
                    </LoadingLink>
                </Button>
            </div>
            <CharacterGrid characters={sanitizedCharacters} />
        </div>
    )
}
