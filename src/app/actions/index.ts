"use server";

import { collectionCharacters } from "@/db/mongodb";
import { CharacterOption } from "@/types";
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearDataCache(path?: string, tag?: string) {
    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag, { expire: 0 });
}

// app/actions.ts
export async function searchCharacters(
    query: string,
    excludeIds: number | number[] = []
) {
    const exclude = (Array.isArray(excludeIds) ? excludeIds : [excludeIds])
        .map(Number)
        .filter((n) => !Number.isNaN(n));

    const filter: Record<string, unknown> = {};
    if (exclude.length) filter.id = { $nin: exclude };

    const q = query.trim();

    // Build pipeline stages
    const pipeline: any[] = [];

    if (q) {
        const rx = { $regex: q, $options: "i" };
        filter.$or = [
            { name: rx },
            { slug: rx },
            { "biography.fullName": rx },
            { "biography.aliases": rx },
        ];
        pipeline.push({ $match: filter });
        pipeline.push({ $limit: 20 });
    } else {
        // When query is empty, match exclusions and randomize results using $sample
        pipeline.push({ $match: filter });
        pipeline.push({ $sample: { size: 20 } });
    }

    pipeline.push({
        $project: {
            _id: 0,
            id: 1,
            name: 1,
            slug: 1,
            image: 1, // Added image projection if your character options display avatars
            "biography.fullName": 1,
            "biography.alterEgos": 1,
            "biography.aliases": 1,
        },
    });

    return collectionCharacters
        .aggregate<CharacterOption>(pipeline)
        .toArray();
}

export async function sampleCharacterIds(
    count: number,
    excludeIds: number[] = []
) {
    const exclude = excludeIds.map(Number).filter((n) => !Number.isNaN(n));
    const rows = await collectionCharacters
        .aggregate<{ id: number }>([
            { $match: exclude.length ? { id: { $nin: exclude } } : {} },
            { $sample: { size: Math.min(Math.max(count, 1), 10) } },
            { $project: { _id: 0, id: 1 } },
        ])
        .toArray();
    return rows.map((r) => r.id);
}