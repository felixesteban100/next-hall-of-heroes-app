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

export async function seedCharactersEnemies(characterEnemiesData: { slug: string; enemies: (number | string)[] }[]) {
    try {
        console.log("Starting enemies database seed...");

        // Build a bulk write operation array for max performance
        const bulkOps = characterEnemiesData.map((item) => {
            // Extract numeric ID from slug prefix (e.g. "1-a-bomb/Marvel Comics" -> 1)
            const characterId = parseInt(item.slug.split("-")[0], 10);

            return {
                updateOne: {
                    filter: { id: characterId },
                    update: {
                        $set: {
                            "connections.enemies": item.enemies
                        }
                    }
                }
            };
        });

        if (bulkOps.length === 0) {
            console.log("No enemy seed data found.");
            return;
        }

        const result = await collectionCharacters.bulkWrite(bulkOps);

        console.log(`Successfully updated ${result.modifiedCount} characters with enemy data.`);
        return result;
    } catch (error) {
        console.error("Failed to seed character enemies:", error);
        throw error;
    }
}