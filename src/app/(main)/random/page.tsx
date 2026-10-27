import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterGrid } from "@/components/characters/CharacterGrid";
import { sanitize } from "@/lib/utils";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { RefreshRandomPageButton } from "@/components/filters/RefreshRandomPageButton";
import { UrlParamSyncer } from "@/components/random/UrlParamSyncer";
import { SwipeGrid } from "@/components/shared/SwipeGrid";

export const instant = false;

type PageProps = {
    searchParams: Promise<{ p?: string }>;
};

export default async function Random({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    let charactersPerPage: CharacterWithJoinTeamUniversePowerEnemies[] = [];

    // 1. If URL has saved query parameters, load those exact characters
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

    // 2. If no params exist, sample 12 random characters on the server right away (NO redirect!)
    let isFreshRandom = false;
    if (charactersPerPage.length === 0) {
        isFreshRandom = true;
        charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>([
            { $sample: { size: 12 } }, // Sample first for max speed
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

    const sanitizedCharacters = sanitize(charactersPerPage);
    const characterIdsString = charactersPerPage.map(c => c.id).join(",");

    return (
        <div className="overflow-hidden sm:overflow-visible">
            {/* 🌟 If this was a fresh batch, silently update URL and localStorage on the client without router lockups */}
            {isFreshRandom && <UrlParamSyncer paramKey="lastParams_random" query={`p=${characterIdsString}`} />}

            <div className="flex items justify-end w-full gap-2">
                <RefreshRandomPageButton path="/random" />
                <Button size="sm" variant="outline" asChild>
                    <LoadingLink href={`/compare?mode=bracket&size=8&p=${characterIdsString}`}>
                        <Scale /> <span className="hidden md:inline">Compare randoms in bracket</span>
                    </LoadingLink>
                </Button>
            </div>
            {/* <CharacterGrid characters={sanitizedCharacters} /> */}
            <SwipeGrid
                items={sanitizedCharacters}
                currentPage={1}
                totalPages={1}
                type="character"
                emptyMessage="No characters found."
            />
        </div>
    );
}