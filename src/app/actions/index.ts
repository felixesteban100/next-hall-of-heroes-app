"use server";

import { collectionCharacters, collectionTeams } from "@/db/mongodb";
import { groupTeams } from "@/lib/compare/compare_utls";
import { CharacterOption } from "@/types";
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearDataCache(path?: string, tag?: string) {
    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag, { expire: 0 });
}

/* export async function searchCharacters(
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
} */

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

    // ── 1. Fetch team affiliations of currently selected characters ──────────
    let activeTeamIdentifiers = new Set<string | number>();

    if (selectedIds.length > 0) {
        const selectedDocs = await collectionCharacters
            .aggregate<{ teamIds: (number | string)[] }>([
                { $match: { id: { $in: selectedIds } } },
                {
                    $project: {
                        _id: 0,
                        teamIds: { $ifNull: ["$connections.groupAffiliation", []] },
                    },
                },
            ])
            .toArray();

        activeTeamIdentifiers = new Set(selectedDocs.flatMap((s) => s.teamIds));
    }

    const hasSynergyContext = activeTeamIdentifiers.size > 0;

    // Helper to score characters based strictly on shared team affiliation
    const scoreAndStrip = (candidates: any[]) => {
        return candidates.map((c) => {
            let score = 0;
            const cTeams: (number | string)[] = c.connections?.groupAffiliation ?? [];

            // Check if this candidate shares any team with selected characters
            if (cTeams.some((t) => activeTeamIdentifiers.has(t))) {
                score = 10; // High score for team synergy
            }

            const { connections, ...rest } = c;
            return { ...rest, synergyScore: score };
        });
    };

    // ── 2. Active Search Query ────────────────────────────────────────────────
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
                { $limit: 50 },
                { $project: projection },
            ])
            .toArray();

        // Score search results and float team synergy matches to top
        return scoreAndStrip(candidates)
            .sort((a, b) => b.synergyScore - a.synergyScore)
            .slice(0, 20);
    }

    // ── 3. Default (No Query) — Fetch Team Teammates First ───────────────────
    const SYNERGY_SLOTS = 5;
    const RANDOM_SLOTS = 15;
    let synergyResults: any[] = [];

    if (hasSynergyContext) {
        const synergyFilter: Record<string, unknown> = {
            ...baseFilter,
            id: { $nin: [...exclude, ...selectedIds] },
            "connections.groupAffiliation": { $in: [...activeTeamIdentifiers] },
        };

        synergyResults = await collectionCharacters
            .aggregate<any>([
                { $match: synergyFilter },
                { $sample: { size: SYNERGY_SLOTS * 3 } },
                { $project: projection },
            ])
            .toArray();

        synergyResults = scoreAndStrip(synergyResults)
            .sort((a, b) => b.synergyScore - a.synergyScore)
            .slice(0, SYNERGY_SLOTS);
    }

    // Fill remaining slots with random non-teammate characters
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

    const randoms = randomResults.map((c) => {
        const { connections, ...rest } = c;
        return { ...rest, synergyScore: 0 };
    });

    return [...synergyResults, ...randoms];
}
/* 
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
} */

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


type SharedTeam = {
    name: string;
    members?: any[];
};

export async function getBestTeamName(entities: any[]): Promise<string | null> {
    if (!entities || entities.length === 0) return null;

    // 1. Get raw candidate teams from groupTeams
    const { shared } = groupTeams(entities);

    if (!shared || shared.length === 0) return null;

    // 2. STRICT FILTER: Keep ONLY teams where EVERY selected character is a member
    // I should make this accept ids also it is just filtering by name but some characters have the id of teams in the connections.groupAffiliation array
    const strictlyShared = shared/* .filter((team: SharedTeam) => {
        return entities.every((entity) => {
            const affiliations: (string | number)[] = entity.connections?.groupAffiliation ?? [];
            return affiliations.some(
                (aff) => String(aff).toLowerCase() === team.name.toLowerCase() || aff === team.name.toLowerCase()
            );
        });
    }); */

    // console.log("strictlyShared", strictlyShared)

    if (strictlyShared.length === 0) return null;

    // 3. Extract the names of the strictly valid shared teams
    const sharedTeamNames = shared.map((t: SharedTeam) => t.name).filter(Boolean);

    // 4. Query DB for total official member count
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

    const teamSizeMap = new Map(sharedTeamsDB.map(t => [t.name, t.totalMembersCount]));
    const selectedCount = entities.length;

    // 5. Score valid teams (favoring tighter/smaller core teams)
    const scoredTeams = strictlyShared.map((team: SharedTeam) => {
        const totalTeamSize = teamSizeMap.get(team.name) ?? 10;
        const tightnessBonus = Math.max(0, 100 - totalTeamSize);
        const hasThePrefix = team.name.toLowerCase().startsWith("the ") ? 20 : 0;

        const score = tightnessBonus + hasThePrefix;

        return {
            name: team.name,
            score,
        };
    });

    scoredTeams.sort((a, b) => b.score - a.score);

    return scoredTeams[0]?.name ?? null;
}