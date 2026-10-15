"use server";

import { collectionCharacters } from "@/db/mongodb";
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

    // ── 1. Fetch selected characters' context ────────────────────────────────
    let publishers = new Set<string>();
    let teamIds = new Set<number>();

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
        teamIds = new Set<number>(
            selected.flatMap((s) =>
                s.teamIds.filter((t): t is number => typeof t === "number")
            )
        );
    }

    const hasSynergyContext = publishers.size > 0 || teamIds.size > 0;

    // ── 2. If searching by query — normal search, score results ─────────────
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
                { $limit: 40 },
                { $project: projection },
            ])
            .toArray();

        return scoreAndStrip(candidates, publishers, teamIds).slice(0, 20);
    }

    // ── 3. No query — intentionally fetch synergy candidates + random fill ───
    const SYNERGY_SLOTS = 5;
    const RANDOM_SLOTS = 15;

    let synergyResults: any[] = [];

    if (hasSynergyContext) {
        // Build a filter that matches publisher OR shared team ID
        const synergyFilter: Record<string, unknown> = {
            ...baseFilter,
            id: { $nin: [...exclude, ...selectedIds] }, // also exclude the selected themselves
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
                { $sample: { size: SYNERGY_SLOTS * 3 } }, // over-fetch so scoring can pick best
                { $project: projection },
            ])
            .toArray();

        // Score and take top SYNERGY_SLOTS
        synergyResults = scoreAndStrip(synergyResults, publishers, teamIds)
            .sort((a, b) => (b.synergyScore ?? 0) - (a.synergyScore ?? 0))
            .slice(0, SYNERGY_SLOTS);
    }

    // Random fill — exclude already fetched synergy ids + selected
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

    // Synergy picks first (already scored), randoms get score 0
    const randoms = randomResults.map((c) => ({
        ...stripSynergyFields(c),
        synergyScore: 0,
    }));

    return [...synergyResults, ...randoms];
}

function scoreAndStrip(
    candidates: any[],
    publishers: Set<string>,
    teamIds: Set<number>
): (CharacterOption & { synergyScore: number })[] {
    return candidates.map((c) => {
        let score = 0;

        // const pub = c.biography?.publisher ?? "";
        // if (pub && publishers.has(pub)) score += 3;

        const cTeams: (number | string)[] = c.connections?.groupAffiliation ?? [];
        if (cTeams.some((t) => typeof t === "number" && teamIds.has(t))) score += 2;

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