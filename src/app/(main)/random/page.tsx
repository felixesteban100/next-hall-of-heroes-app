import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterGrid } from "@/components/characters/CharacterGrid";
import { sanitize } from "@/lib/utils";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { RefreshRandomPageButton } from "@/components/filters/RefreshRandomPageButton";
import { redirect } from "next/navigation";

export const instant = false;


type PageProps = {
    searchParams: Promise<{ p?: string }>;
};

/* this page is very slow */
export default async function Random({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    let charactersPerPage: CharacterWithJoinTeamUniversePowerEnemies[] = [];

    // 1. Load exact IDs from URL params
    if (resolvedParams?.p) {
        const ids = resolvedParams.p.split(",").map(id => Number(id)).filter(Boolean);
        if (ids.length > 0) {
            charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>([
                { $match: { id: { $in: ids } } },
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
            ]).toArray();
        }
    }

    // 2. If no params exist, sample efficiently (Sample FIRST, Lookup SECOND)
    if (charactersPerPage.length === 0) {
        charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
            [
                // Step A: Pick 12 random documents first (fast if collection has index or is small, 
                // but still better than joining the whole collection first)
                { $sample: { size: 12 } },
                // Step B: ONLY lookup universe data for those 12 selected documents!
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
            ]
        ).toArray();

        const randomIds = charactersPerPage.map(c => c.id).join(",");

        // 3. Redirect with the sampled IDs
        redirect(`/random?p=${randomIds}`);
    }

    const sanitizedCharacters = sanitize(charactersPerPage);
    const characterIdsString = charactersPerPage.map(c => c.id).join(",");

    return (
        <div className="flex flex-col mt-4 overflow-visible ">
            <div className="flex items justify-end w-full gap-2">
                <RefreshRandomPageButton path="/random" />
                <Button size="sm" variant="outline" asChild>
                    <LoadingLink href={`/compare?mode=bracket&size=8&p=${characterIdsString}`}>
                        <Scale /> <span className="hidden md:inline">Compare randoms in bracket</span>
                    </LoadingLink>
                </Button>
            </div>
            <CharacterGrid characters={sanitizedCharacters} />
        </div>
    );
}