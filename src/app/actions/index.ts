"use server";

import { collectionCharacters, collectionTeams } from "@/db/mongodb";
import { groupTeams } from "@/lib/compare/compare_utls";
import { CharacterOption } from "@/types";
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearDataCache(path?: string, tag?: string) {
    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag, { expire: 0 });
}

export async function searchCharacters(
    query: string,
    excludeIds: number | number[] = [],
    selectedIds: number[] = []
) {
    const exclude = (Array.isArray(excludeIds) ? excludeIds : [excludeIds])
        .map(Number)
        .filter((n) => !Number.isNaN(n));

    const q = query.trim();
    const baseFilter: Record<string, unknown> = {};
    if (exclude.length) baseFilter.id = { $nin: exclude };

    const projection = {
        _id: 0,
        id: 1,
        name: 1,
        slug: 1,
        image: 1,
        "biography.fullName": 1,
        "biography.alterEgos": 1,
        "biography.aliases": 1,
        "biography.publisher": 1,
        "connections.groupAffiliation": 1,
    };

    let publishers = new Set<string>();
    let teamIds = new Set<string | number>(); // Supports both strings and numbers

    if (selectedIds.length > 0) {
        const selected = await collectionCharacters
            .aggregate<{ publisher: string; teamIds: (number | string)[] }>([
                { $match: { id: { $in: selectedIds } } },
                {
                    $project: {
                        _id: 0,
                        publisher: { $ifNull: ["$biography.publisher", ""] },
                        teamIds: { $ifNull: ["$connections.groupAffiliation", []] },
                    },
                },
            ])
            .toArray();

        publishers = new Set(selected.map((s) => s.publisher).filter(Boolean));
        teamIds = new Set<string | number>(selected.flatMap((s) => s.teamIds));
    }

    const hasSynergyContext = publishers.size > 0 || teamIds.size > 0;

    // ── 2. If searching by query — search, score by synergy, and sort ─────────────
    if (q) {
        const rx = { $regex: q, $options: "i" };
        const filter = {
            ...baseFilter,
            $or: [
                { name: rx },
                { slug: rx },
                { "biography.fullName": rx },
                { "biography.aliases": rx },
            ],
        };

        const candidates = await collectionCharacters
            .aggregate<CharacterOption>([
                { $match: filter },
                { $limit: 50 }, // fetch enough matches to evaluate synergy
                { $project: projection },
            ])
            .toArray();

        // Score all search results and sort highest synergy to the top!
        return scoreAndStrip(candidates, publishers, teamIds)
            .sort((a, b) => (b.synergyScore ?? 0) - (a.synergyScore ?? 0))
            .slice(0, 20);
    }

    const SYNERGY_SLOTS = 5;
    const RANDOM_SLOTS = 15;
    let synergyResults: any[] = [];

    if (hasSynergyContext) {
        const synergyFilter: Record<string, unknown> = {
            ...baseFilter,
            id: { $nin: [...exclude, ...selectedIds] },
            $or: [
                ...(publishers.size > 0
                    ? [{ "biography.publisher": { $in: [...publishers] } }]
                    : []),
                ...(teamIds.size > 0
                    ? [{ "connections.groupAffiliation": { $in: [...teamIds] } }]
                    : []),
            ],
        };

        synergyResults = await collectionCharacters
            .aggregate<any>([
                { $match: synergyFilter },
                { $sample: { size: SYNERGY_SLOTS * 4 } },
                { $project: projection },
            ])
            .toArray();

        synergyResults = scoreAndStrip(synergyResults, publishers, teamIds)
            .sort((a, b) => (b.synergyScore ?? 0) - (a.synergyScore ?? 0))
            .slice(0, SYNERGY_SLOTS);
    }

    const synergyIds = synergyResults.map((c) => c.id);
    const randomFilter = {
        ...baseFilter,
        id: { $nin: [...exclude, ...selectedIds, ...synergyIds] },
    };

    const randomResults = await collectionCharacters
        .aggregate<any>([
            { $match: randomFilter },
            { $sample: { size: RANDOM_SLOTS } },
            { $project: projection },
        ])
        .toArray();

    const randoms = randomResults.map((c) => ({
        ...stripSynergyFields(c),
        synergyScore: 0,
    }));

    return [...synergyResults, ...randoms];
}

function scoreAndStrip(
    candidates: any[],
    publishers: Set<string>,
    teamIds: Set<string | number>
): (CharacterOption & { synergyScore: number })[] {
    return candidates.map((c) => {
        let score = 0;

        // const pub = c.biography?.publisher ?? "";
        // if (pub && publishers.has(pub)) score += 3; // Re-enabled publisher weight

        const cTeams: (number | string)[] = c.connections?.groupAffiliation ?? [];
        if (cTeams.some((t) => teamIds.has(t))) score += 5; // Higher weight for shared teams

        return { ...stripSynergyFields(c), synergyScore: score };
    });
}

function stripSynergyFields(c: any): CharacterOption {
    const { connections, ...rest } = c;
    return rest as CharacterOption;
}

export async function sampleCharacterIds(
    count: number,
    excludeIds: number[] = []
) {
    const exclude = excludeIds.map(Number).filter((n) => !Number.isNaN(n));
    const rows = await collectionCharacters
        .aggregate<{ id: number }>([
            { $match: exclude.length ? { id: { $nin: exclude } } : {} },
            { $sample: { size: Math.min(Math.max(count, 1)) } },
            { $project: { _id: 0, id: 1 } },
        ])
        .toArray();
    return rows.map((r) => r.id);
}


export async function getBestTeamName(entities: any[]): Promise<string | null> {
    const { shared } = groupTeams(entities);
    if (!shared || shared.length === 0) return null;

    // 1. Extract the names of all shared candidate teams
    const sharedTeamNames = shared.map((t: any) => t.name).filter(Boolean);
    if (sharedTeamNames.length === 0) return null;

    // 2. Fetch the true official totalMembersCount from MongoDB for these teams
    const sharedTeamsDB = await collectionTeams.aggregate<{
        id: string;
        name: string;
        totalMembersCount: number
    }>([
        {
            $match: { name: { $in: sharedTeamNames } }
        },
        {
            $lookup: {
                from: "characters",
                let: { teamName: "$name", teamId: "$id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $in: ["$$teamName", { $ifNull: ["$connections.groupAffiliation", []] }] },
                                    { $in: ["$$teamId", { $ifNull: ["$connections.groupAffiliation", []] }] }
                                ]
                            }
                        }
                    },
                    { $count: "count" }
                ],
                as: "memberCountData"
            }
        },
        {
            $addFields: {
                totalMembersCount: {
                    $ifNull: [{ $arrayElemAt: ["$memberCountData.count", 0] }, 0]
                }
            }
        },
        {
            $project: {
                memberCountData: 0
            }
        }
    ]).toArray();

    // Create a lookup map for fast O(1) access to database team sizes
    const teamSizeMap = new Map(sharedTeamsDB.map(t => [t.name, t.totalMembersCount]));

    const selectedCount = entities.length;

    // 3. Score each team factoring in the real database totalMembersCount
    const scoredTeams = shared.map((team: any) => {
        const matchedMembersCount = team.members ? team.members.length : 0;
        const totalTeamSize = teamSizeMap.get(team.name) ?? 10; // fallback if not found

        const coverageRatio = selectedCount > 0 ? matchedMembersCount / selectedCount : 0;
        const isFullRosterMatch = matchedMembersCount === selectedCount;

        // Tighter teams (smaller total roster size) get a massive bonus over bloated universe teams
        const tightnessBonus = Math.max(0, 100 - totalTeamSize);
        const hasThePrefix = team.name.toLowerCase().startsWith("the ") ? 20 : 0;

        const score =
            (matchedMembersCount * 15) +
            (coverageRatio * 40) +
            (isFullRosterMatch ? 100 : 0) +
            tightnessBonus +
            hasThePrefix;

        return {
            name: team.name,
            score,
        };
    });

    scoredTeams.sort((a, b) => b.score - a.score);

    return scoredTeams[0]?.name ?? null;
}