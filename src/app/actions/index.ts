"use server";

import { CharacterOption } from "@/components/compare/CharacterCombobox";
import { collectionCharacters } from "@/db/mongodb";
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearDataCache(path?: string, tag?: string) {
    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag, { expire: 0 });
}

export async function searchCharacters(query: string, excludeId?: number) {
    const q = query.trim();
    const filter: Record<string, unknown> = {};

    if (excludeId != null && !Number.isNaN(Number(excludeId))) {
        filter.id = { $ne: Number(excludeId) };
    }

    if (q) {
        const rx = { $regex: q, $options: "i" };
        filter.$or = [
            { name: rx },
            { slug: rx },
            { "biography.fullName": rx },
            { "biography.alterEgos": rx },
            { "biography.aliases": rx }, // works if aliases are strings in an array
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