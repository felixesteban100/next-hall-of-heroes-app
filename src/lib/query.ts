import { collectionPowers, collectionTeams } from "@/db/mongodb";

export async function buildQuery(name: string, gender: string, alignment: string, universe: string, tier: number, character_class: number, team: number, powersParam: number[], character_type: string) {
    // Build MongoDB query filter
    const query: Record<string, any> = {};
    if (name) {
        const regexPattern = { $regex: name, $options: "i" };
        query.$or = [
            { name: regexPattern },
            { "biography.fullName": regexPattern },
            { "biography.aliases": regexPattern },
            { "biography.alterEgos": regexPattern },
        ];
    }
    if (gender) query["appearance.gender"] = gender;
    if (alignment) query["biography.alignment"] = alignment;
    if (universe) query["biography.publisher"] = universe;
    if (character_type) query["character_type"] = character_type;
    if (!Number.isNaN(tier)) query.tier = tier;
    if (!Number.isNaN(team)) {
        // Find the team object corresponding to the selected team ID to get its name string
        const selectedTeamObj = await collectionTeams.findOne({ id: team })
        const teamName = selectedTeamObj ? selectedTeamObj.name : null;

        // Build an $or condition matching either the numeric ID or the string name
        const teamMatchConditions: Array<{ "connections.groupAffiliation": number | string }> = [
            { "connections.groupAffiliation": team },
        ];
        if (teamName) {
            teamMatchConditions.push({ "connections.groupAffiliation": teamName });
        }

        query.$or = query.$or
            ? [...query.$or, { $or: teamMatchConditions }] : teamMatchConditions
    }
    if (!Number.isNaN(character_class)) query.class = character_class;
    if (powersParam.length > 0) {
        const powerConditions: Array<Record<string, any>> = [];

        for (const p of powersParam) {
            const powerId = Number(p);
            let targetName = "";

            // 1. Resolve target power name with passed ID
            const powerObj = await collectionPowers.findOne({ id: powerId });
            if (powerObj && powerObj.name) {
                targetName = powerObj.name;
            }

            const singlePowerOrConditions: Array<Record<string, any>> = [];

            // Direct ID match
            if (!Number.isNaN(powerId)) {
                singlePowerOrConditions.push({ powers: powerId });
            }

            // Direct exact name match
            if (targetName) {
                singlePowerOrConditions.push({ powers: targetName });

                // Partial match A: Character has "Animalistic Agility" -> User searched "animal"
                singlePowerOrConditions.push({
                    powers: { $regex: targetName, $options: "i" }
                });

                // Partial match B: Character has "animal" -> User selected "Animalistic Agility"
                // We split the selected power into key words (e.g., "Animalistic", "Agility", "Animal") 
                // so short tags like "animal" match against the selected term.
                const keywords = targetName
                    .toLowerCase()
                    .split(/\s+/)
                    .filter((w) => w.length > 2); // filter out tiny words like "and", "of"

                if (keywords.length > 0) {
                    const keywordRegex = keywords.join("|");
                    singlePowerOrConditions.push({
                        powers: { $regex: keywordRegex, $options: "i" }
                    });
                }
            }

            powerConditions.push({ $or: singlePowerOrConditions });
        }

        // Combine conditions for all selected powers
        const finalPowerQuery = powerConditions.length === 1
            ? powerConditions[0]
            : { $and: powerConditions };

        query.$or = query.$or
            ? [...query.$or, finalPowerQuery]
            : [finalPowerQuery];
    }

    return query
}