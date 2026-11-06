import { collectionPowers, collectionTeams } from "@/db/mongodb";

type Params = {
    name: string;
    modes?: string[]; // 🚀 Accept active search modes array (e.g. ["startsWith", "endsWith"])
    gender: string;
    alignment: string;
    universe: string;
    tier: number;
    character_class: number;
    team: number;
    powersParam: number[];
    character_type: string;
    fields?: string[];
};

export async function buildQuery({
    alignment,
    character_class,
    character_type,
    gender,
    name,
    modes = [],
    powersParam,
    team,
    tier,
    universe,
    fields = [],
}: Params) {
    // Build MongoDB query filter
    const query: Record<string, any> = {};

    if (name) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let regexPattern = escaped;

        const hasStarts = modes.includes("startsWith");
        const hasEnds = modes.includes("endsWith");
        const hasExact = modes.includes("exact");

        if (hasExact || (hasStarts && hasEnds)) {
            regexPattern = `^${escaped}$`;
        } else if (hasStarts) {
            regexPattern = `^${escaped}`;
        } else if (hasEnds) {
            regexPattern = `${escaped}$`;
        }

        const nameRegex = { $regex: regexPattern, $options: "i" };

        // 🚀 Determine target fields (default to ["name"] if array is empty)
        const activeFields = fields.length > 0 ? fields : ["name"];
        const conditions: Array<Record<string, any>> = [];

        if (activeFields.includes("name")) conditions.push({ name: nameRegex });
        if (activeFields.includes("fullName")) conditions.push({ "biography.fullName": nameRegex });
        if (activeFields.includes("aliases")) conditions.push({ "biography.aliases": nameRegex });
        if (activeFields.includes("alterEgos")) conditions.push({ "biography.alterEgos": nameRegex });

        query.$or = conditions;
    }
    if (gender) query["appearance.gender"] = gender;
    if (alignment) query["biography.alignment"] = alignment;
    if (universe) query["biography.publisher"] = universe;
    if (character_type) query["character_type"] = character_type;
    if (!Number.isNaN(tier)) query.tier = tier;

    if (!Number.isNaN(team)) {
        // Find the team object corresponding to the selected team ID to get its name string
        const selectedTeamObj = await collectionTeams.findOne({ id: team });
        const teamName = selectedTeamObj ? selectedTeamObj.name : null;

        // Build an $or condition matching either the numeric ID or the string name
        const teamMatchConditions: Array<{ "connections.groupAffiliation": number | string }> = [
            { "connections.groupAffiliation": team },
        ];
        if (teamName) {
            teamMatchConditions.push({ "connections.groupAffiliation": teamName });
        }

        query.$or = query.$or
            ? [...query.$or, { $or: teamMatchConditions }]
            : teamMatchConditions;
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

                // // Partial match A: Character has "Animalistic Agility" -> User searched "animal"
                // singlePowerOrConditions.push({
                //     powers: { $regex: targetName, $options: "i" }
                // });

                // Partial match B: Character has "animal" -> User selected "Animalistic Agility"
                // const keywords = targetName
                //     .toLowerCase()
                //     .split(/\s+/)
                //     .filter((w) => w.length > 8);

                // if (keywords.length > 0) {
                //     const keywordRegex = keywords.join("|");
                //     singlePowerOrConditions.push({
                //         powers: { $regex: keywordRegex, $options: "i" }
                //     });
                // }
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

    return query;
}