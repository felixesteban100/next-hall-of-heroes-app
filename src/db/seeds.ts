import { collectionCharacters, collectionTeams, collectionUniverses } from "./mongodb";
import { AnyBulkWriteOperation } from "mongodb";


/**
 * Generic reusable function to batch update any field across a collection
 * @param updatesMap Object mapping team names (or IDs) to field values
 * @param fieldName The collection field to update (e.g., "alignment", "baseOfOperations")
 */
export async function seedTeamField<T>(
    updatesMap: Record<string, T>,
    fieldName: string
) {
    try {
        const operations = Object.entries(updatesMap).map(([teamName, value]) => ({
            updateOne: {
                filter: { name: { $regex: `^${teamName.trim()}$`, $options: "i" } },
                update: { $set: { [fieldName]: value } },
            },
        }));

        if (operations.length === 0) {
            console.log("No update operations provided.");
            return;
        }

        const result = await collectionTeams.bulkWrite(operations);

        console.log(`Successfully updated field "${fieldName}":`);
        console.log(`- Matched Documents: ${result.matchedCount}`);
        console.log(`- Modified Documents: ${result.modifiedCount}`);
    } catch (error) {
        console.error(`Failed to update field "${fieldName}":`, error);
    }
}

/**
 * Batch seed or update fields for the universes collection
 */
export async function seedUniverses<T>(dataMap: Record<string, T>, fieldName: string) {
    try {
        const operations = Object.entries(dataMap).map(([teamName, value]) => ({
            updateOne: {
                filter: { name: { $regex: `^${teamName.trim()}$`, $options: "i" } },
                update: { $set: { [fieldName]: value } },
                upsert: false, // Set to true if you want to create universes that don't exist yet
            },
        }));

        if (operations.length === 0) {
            console.log("No universe update operations specified.");
            return;
        }

        const result = await collectionUniverses.bulkWrite(operations);

        console.log("Universes update finished:");
        console.log(`- Matched: ${result.matchedCount}`);
        console.log(`- Modified: ${result.modifiedCount}`);
    } catch (error) {
        console.error("Failed to seed universes collection:", error);
    }
}

export async function seedTeamLeadersHybrid(leaderMap: Record<string, string[]>) {
    try {
        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // 1. Collect all leader search terms
        const allLeaderNames = Array.from(
            new Set(Object.values(leaderMap).flat().map((name) => name.trim()))
        );

        // 2. Query DB using INCLUDES / CONTAINS regex (no ^ or $ anchors)
        // Matches "Batman", "The Batman", "Batman (Bruce Wayne)", etc.
        const regexConditions = allLeaderNames.map((name) => ({
            name: { $regex: escapeRegex(name), $options: "i" },
        }));

        const foundCharacters = await collectionCharacters.find({ $or: regexConditions }).toArray();

        // 3. Build bulk update operations
        const operations: AnyBulkWriteOperation<any>[] = [];

        for (const [teamName, leaderSearchNames] of Object.entries(leaderMap)) {
            const mixedLeaders: (number | string)[] = [];

            for (const searchName of leaderSearchNames) {
                const cleanSearchName = searchName.trim();
                const searchRegex = new RegExp(escapeRegex(cleanSearchName), "i");

                // Find all characters whose name INCLUDES the search term
                const matchingChars = foundCharacters.filter((char) =>
                    searchRegex.test(char.name)
                );

                if (matchingChars.length > 0) {
                    // Push ALL matching character IDs
                    matchingChars.forEach((char) => {
                        if (!mixedLeaders.includes(char.id)) {
                            mixedLeaders.push(char.id);
                        }
                    });
                } else {
                    // Not found -> Push raw string name fallback
                    if (!mixedLeaders.includes(cleanSearchName)) {
                        console.warn(`⚠️ Character matching "${cleanSearchName}" not found in DB. Storing string fallback for team "${teamName}".`);
                        mixedLeaders.push(cleanSearchName);
                    }
                }
            }

            if (mixedLeaders.length > 0) {
                operations.push({
                    updateOne: {
                        filter: { name: { $regex: `^${escapeRegex(teamName.trim())}$`, $options: "i" } },
                        update: {
                            $set: {
                                leaders: mixedLeaders,
                                updatedAt: new Date(),
                            },
                        },
                    },
                });
            }
        }

        if (operations.length > 0) {
            const result = await collectionTeams.bulkWrite(operations as any);
            console.log(`\n✅ Finished updating team leaders!`);
            console.log(`- Matched Teams: ${result.matchedCount}`);
            console.log(`- Modified Teams: ${result.modifiedCount}`);
        } else {
            console.log("No teams were updated.");
        }
    } catch (error) {
        console.error("Failed to seed team leaders:", error);
    }
}

// db/seed/seedCharacters.ts
/** Extract numeric id from slug like "982-mary-marvel/DC Comics" → 982 */
export function idFromSlug(slug: string): number {
    const n = parseInt(slug.split("-")[0], 10);
    if (Number.isNaN(n)) {
        throw new Error(`Invalid slug (no leading id): ${slug}`);
    }
    return n;
}

type SeedItem = {
    slug: string;
    /** Any fields to $set on the character doc (dot-paths allowed) */
    data: Record<string, unknown>;
};

/**
 * Generic bulk update by slug → id.
 * Example data:
 * [
 *   { slug: "982-mary-marvel/DC Comics", data: { powerstats: { ... }, tier: 5 } },
 *   { slug: "989-ares/DC Comics", data: { "connections.enemies": [720] } },
 * ]
 */
export async function seedCharacters(items: SeedItem[]) {
    try {
        console.log("Starting characters seed...");

        const bulkOps: Parameters<typeof collectionCharacters.bulkWrite>[0] = items.map((item) => {
            const characterId = idFromSlug(item.slug);

            return {
                updateOne: {
                    filter: { id: characterId },
                    update: {
                        $set: item.data,
                    },
                },
            };
        });

        if (bulkOps.length === 0) {
            console.log("No character seed data found.");
            return;
        }

        const result = await collectionCharacters.bulkWrite(bulkOps, {
            ordered: false, // keep going if one id is missing
        });

        console.log(
            `Characters seed: matched=${result.matchedCount}, modified=${result.modifiedCount}`
        );
        return result;
    } catch (error) {
        console.error("Failed to seed characters:", error);
        throw error;
    }
}

export async function seedCharactersPowerstats(
    rows: { slug: string; powerstats: Record<string, number> }[]
) {
    return seedCharacters(
        rows.map(({ slug, powerstats }) => ({
            slug,
            data: { powerstats },
        }))
    );
}

export async function seedCharactersEnemies(
    characterEnemiesData: { slug: string; enemies: (number | string)[] }[]
) {
    return seedCharacters(
        characterEnemiesData.map(({ slug, enemies }) => ({
            slug,
            data: { "connections.enemies": enemies },
        }))
    );
}

export async function seedCharactersTier(
    rows: { slug: string; tier: number; class?: number }[]
) {
    return seedCharacters(
        rows.map(({ slug, tier, class: cls }) => ({
            slug,
            data: {
                tier,
                ...(cls != null ? { class: cls } : {}),
            },
        }))
    );
}

export async function seedCharactersRelativesList(
    data: { slug: string; relatives: string }[]
) {
    return seedCharacters(
        data.map(({ slug, relatives }) => ({
            slug,
            data: {
                // join to match current schema
                "connections.relatives": relatives,
            },
        }))
    );
}

export async function seedCharactersDescription(
    data: { slug: string; description: string }[]
) {
    return seedCharacters(
        data.map(({ slug, description }) => ({
            slug,
            data: {
                "appearance.description": description,
            },
        }))
    );
}