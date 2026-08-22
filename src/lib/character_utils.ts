import { QueryOptions } from "@/types";

export function getCharacterAlignmentColor(alignment: string) {
    switch (alignment) {
        case "good":
            return "bg-green-500 text-black";
        case "neutral":
            return "bg-yellow-500 text-black";
        case "bad":
            return "bg-red-500 text-white";
        default:
            return "bg-gray-500 text-foreground";
    }
}

export function getCharacterAlignmentText(alignment: string) {
    switch (alignment) {
        case "good":
            return "Hero";
        case "neutral":
            return "Anti-Hero";
        case "bad":
            return "Villain";
        default:
            return "Unknown";
    }
}

export function joinTeam_universe_power_enemies_toCharacter(queryOptions: QueryOptions, sortBy: string, sortDirection: string, offset: number, howManyPerPage: number/* , charactersNames: string[] */) {
    // Implementation for joining team, universe, power, and enemies to a character
    const baseLookups = [
        { $match: { ...queryOptions } },
        {
            $lookup: {
                from: "powers",
                localField: "powers",
                foreignField: "id",
                as: "powers",
            },
        },
        {
            $lookup: {
                from: "universes",
                localField: "biography.publisher",
                foreignField: "value",
                pipeline: [{ $project: { teams: 0 } }],
                as: "biography.publisher",
            },
        },
        { $unwind: "$biography.publisher" },
        {
            $lookup: {
                from: "teams",
                localField: "connections.groupAffiliation",
                foreignField: "id",
                pipeline: [{ "$project": { "universe": 0 } }],
                as: "connections.groupAffiliation",
            },
        },
        {
            $lookup: {
                from: "enemies",
                localField: "connections.enemies",
                foreignField: "id",
                pipeline: [{ $project: { characters: 0 } }],
                as: "connections.enemies",
            },
        },
    ]

    // if (sortBy === 'random') {
    //     return [
    //         ...baseLookups,
    //         { $sample: { size: howManyPerPage } },
    //     ]
    // }

    // if (charactersNames.length > 1 && sortBy === "names_sended") {
    //     return [
    //         {
    //             $addFields: {
    //                 names_sended: {
    //                     $indexOfArray: [charactersNames.map(c => c.toLowerCase().trim()), { $toLower: "$name" }]
    //                 }
    //             }
    //         },
    //         ...baseLookups,
    //         { $skip: offset },
    //         { $limit: howManyPerPage },
    //         { $sort: { [`${sortBy}`]: sortDirection === "desc" ? -1 : 1 } },
    //     ]
    // }



    return [
        ...baseLookups,
        { $sort: { [`${sortBy}`]: sortDirection === "desc" ? -1 : 1 } },
        { $skip: offset },
        { $limit: howManyPerPage },
    ]
}