"use server";

import { collectionCharacters } from "@/db/mongodb";
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearDataCache(path?: string, tag?: string) {
    if (path) revalidatePath(path);
    if (tag) revalidateTag(tag, { expire: 0 });
}

export async function searchCharacters(query: string, excludeId?: number) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    // Escape regex special characters to prevent invalid regex errors
    const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter: Record<string, unknown> = { name: { $regex: sanitizedQuery, $options: "i" } };
    if (excludeId != null && !Number.isNaN(Number(excludeId))) {
        filter.id = { $ne: Number(excludeId) };
    }

    const characters = await collectionCharacters
        .find(filter)
        .project<{ id: number; name: string; slug: string }>({
            _id: 0,
            id: 1,
            name: 1,
            slug: 1,
        })
        .limit(15)
        .toArray();

    return characters;
}