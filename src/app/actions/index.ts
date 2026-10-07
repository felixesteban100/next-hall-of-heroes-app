"use server";

import { CharacterOption } from "@/components/compare/selectors/CharacterCombobox";
import { collectionCharacters } from "@/db/mongodb";
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
    if (q) {
        const rx = { $regex: q, $options: "i" };
        filter.$or = [
            { name: rx },
            { slug: rx },
            { "biography.fullName": rx },
            { "biography.aliases": rx },
        ];
    }

    return collectionCharacters
        .aggregate<CharacterOption>([
            { $match: filter },
            { $limit: 20 },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    slug: 1,
                    "biography.fullName": 1,
                    "biography.alterEgos": 1,
                    "biography.aliases": 1,
                },
            },
        ])
        .toArray();
}