import { collectionCharacters } from "@/db/mongodb";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { sanitize } from "@/lib/utils";
import { UrlParamSyncer } from "@/components/random/UrlParamSyncer";
import { RandomPageClient, BatchExtreme } from "@/components/random/RandomPageClient";
import { CHARACTER_TIER } from "@/lib/constants";
import { buildEnemiesLookup, buildPowersLookup, buildTeamsLookup, buildUniverseLookup } from "@/lib/character_utils";

export const instant = false;

type PageProps = {
    searchParams: Promise<{ p?: string; pinned?: string }>;
};

// ── Compute interesting facts about this batch ─────────────────────────────────
export function computeExtremes(characters: CharacterWithJoinTeamUniversePowerEnemies[]): BatchExtreme[] {
    if (characters.length === 0) return [];

    const extremes: BatchExtreme[] = [];

    // Highest tier in batch
    const tiers = characters.map(c => c.tier ?? 0).filter(t => t > 0);
    if (tiers.length > 0) {
        const maxTier = Math.max(...tiers);
        const maxTierLabel = (CHARACTER_TIER as any)[maxTier]?.split("/")[0] ?? `Tier ${maxTier}`;
        const maxTierCount = tiers.filter(t => t === maxTier).length;
        if (maxTier >= 7) {
            extremes.push({
                type: "rare_find",
                label: maxTierCount > 1
                    ? `${maxTierCount}× ${maxTierLabel} characters in this batch — rare!`
                    : `${maxTierLabel}-tier character in this batch — rare!`,
                icon: "sparkles",
                color: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
            });
        } else if (maxTier >= 5) {
            extremes.push({
                type: "highest_tier",
                label: `Top tier: ${maxTierLabel} (T${maxTier}) in this batch`,
                icon: "flame",
                color: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
            });
        }
    }

    // Villain vs hero count
    const villains = characters.filter(c => c.biography?.alignment === "bad").length;
    const heroes = characters.filter(c => c.biography?.alignment === "good").length;
    if (villains >= 7) {
        extremes.push({
            type: "villain_count",
            label: `${villains} villains in this batch — heavy dark side`,
            icon: "zap",
            color: "bg-red-500/15 text-red-400 border border-red-500/25",
        });
    } else if (heroes >= 7) {
        extremes.push({
            type: "hero_count",
            label: `${heroes} heroes — almost all good guys`,
            icon: "shield",
            color: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
        });
    } else if (villains > 0 && heroes > 0) {
        extremes.push({
            type: "villain_count",
            label: `${heroes} heroes · ${villains} villains · ${characters.length - heroes - villains} neutral`,
            icon: "zap",
            color: "bg-muted/50 text-muted-foreground border border-muted-foreground/20",
        });
    }

    // Publisher mix
    const publishers = new Map<string, number>();
    for (const c of characters) {
        const pub = (c.biography?.publisher as any)?.name ?? "Unknown";
        publishers.set(pub, (publishers.get(pub) ?? 0) + 1);
    }
    const pubCount = publishers.size;
    if (pubCount >= 4) {
        extremes.push({
            type: "publisher_mix",
            label: `${pubCount} different publishers in this batch`,
            icon: "star",
            color: "bg-violet-500/15 text-violet-400 border border-violet-500/25",
        });
    } else if (pubCount === 1) {
        const [pub] = publishers.keys();
        extremes.push({
            type: "publisher_mix",
            label: `Pure ${pub} batch`,
            icon: "star",
            color: "bg-violet-500/15 text-violet-400 border border-violet-500/25",
        });
    }

    return extremes;
}

export default async function Random({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    let charactersPerPage: CharacterWithJoinTeamUniversePowerEnemies[] = [];

    // 1. If URL has saved query parameters (?p=), load those exact characters
    if (resolvedParams?.p) {
        const ids = resolvedParams.p.split(",").map(id => Number(id)).filter(Boolean);
        if (ids.length > 0) {
            charactersPerPage = await collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>([
                { $match: { id: { $in: ids } } },
                ...buildUniverseLookup(),
                ...buildPowersLookup(),
                ...buildTeamsLookup(),
                ...buildEnemiesLookup(),
                { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },
            ]).toArray();
        }
    }

    // 2. Fresh random batch (with optional pinned IDs mixed in)
    let isFreshRandom = false;
    if (charactersPerPage.length === 0) {
        isFreshRandom = true;
        const pinnedIds = resolvedParams?.pinned
            ? resolvedParams.pinned.split(",").map(Number).filter(Boolean)
            : [];

        const BATCH_SIZE = 12;
        const randomSize = Math.max(0, BATCH_SIZE - pinnedIds.length);

        const [/* pinnedChars,  */randomChars] = await Promise.all([
            /* pinnedIds.length > 0
                ? collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>([
                    { $match: { id: { $in: pinnedIds } } },
                    LOOKUP_STAGE,
                    { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },
                ]).toArray()
                : Promise.resolve([]), */
            randomSize > 0
                ? collectionCharacters.aggregate<CharacterWithJoinTeamUniversePowerEnemies>([
                    { $match: { id: { $nin: pinnedIds } } },
                    { $sample: { size: randomSize } },
                    ...buildUniverseLookup(),
                    ...buildPowersLookup(),
                    ...buildTeamsLookup(),
                    ...buildEnemiesLookup(),
                    { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },
                ]).toArray()
                : Promise.resolve([]),
        ]);

        // Pinned first, then fill with fresh randoms
        charactersPerPage = [/* ...pinnedChars, */ ...randomChars];
    }

    const sanitizedCharacters = sanitize(charactersPerPage);
    const characterIdsString = charactersPerPage.map(c => c.id).join(",");
    const extremes = computeExtremes(charactersPerPage);

    return (
        <div>
            {isFreshRandom && (
                <UrlParamSyncer paramKey="lastParams_random" query={`p=${characterIdsString}`} />
            )}
            <RandomPageClient
                sanitizedCharacters={sanitizedCharacters}
                characterIdsString={characterIdsString}
                isFreshRandom={isFreshRandom}
                extremes={extremes}
            />
        </div>
    );
}