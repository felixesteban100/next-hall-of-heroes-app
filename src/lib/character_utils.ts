import { Frown, Meh, Smile } from "lucide-react";

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

export function getCharacterAlignmentTextColor(alignment: string) {
    switch (alignment) {
        case "good":
            return "text-green-500";
        case "neutral":
            return "text-yellow-500";
        case "bad":
            return "text-red-500";
        default:
            return "text-gray-500";
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

export function getCharacterAligmentIcon(alignment: string) {
    return alignment === "good" ? Smile : alignment === "bad" ? Frown : Meh
}

export function joinTeam_universe_power_enemies_toCharacter(
    queryOptions: Record<string, any>,
    sortBy: string,
    sortDirection: string,
    offset: number,
    howManyPerPage: number
) {
    return [
        { $match: { ...queryOptions } },
        ...buildPowersLookup(),
        ...buildUniverseLookup(), // Note: Universe runs before Enemies so publisher is resolved
        ...buildTeamsLookup(),
        ...buildEnemiesLookup(),
        { $sort: { [sortBy]: sortDirection === "desc" ? -1 : 1/* , _id: 1 */ } },
        { $skip: offset },
        { $limit: howManyPerPage }
    ];
}


// 1. Powers Pipeline Stage
export function buildPowersLookup() {
    return [
        {
            $lookup: {
                from: "powers",
                let: { rawPowers: { $ifNull: ["$powers", []] } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $in: ["$id", "$$rawPowers"] },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$$rawPowers",
                                                        as: "p",
                                                        cond: {
                                                            $and: [
                                                                { $eq: [{ $type: "$$p" }, "string"] },
                                                                {
                                                                    $or: [
                                                                        { $ne: [{ $indexOfCP: [{ $toLower: "$name" }, { $toLower: "$$p" }] }, -1] },
                                                                        { $ne: [{ $indexOfCP: [{ $toLower: "$$p" }, { $toLower: "$name" }] }, -1] }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "matchedPowers"
            }
        },
        {
            $addFields: {
                powers: {
                    $concatArrays: [
                        "$matchedPowers",
                        {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $ifNull: ["$powers", []] },
                                        as: "item",
                                        cond: {
                                            $and: [
                                                { $eq: [{ $type: "$$item" }, "string"] },
                                                {
                                                    $not: {
                                                        $gt: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$matchedPowers.name",
                                                                        as: "mpName",
                                                                        cond: {
                                                                            $or: [
                                                                                { $ne: [{ $indexOfCP: [{ $toLower: "$$mpName" }, { $toLower: "$$item" }] }, -1] },
                                                                                { $ne: [{ $indexOfCP: [{ $toLower: "$$item" }, { $toLower: "$$mpName" }] }, -1] }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                                as: "str",
                                in: { name: "$$str", isFallback: true }
                            }
                        }
                    ]
                }
            }
        },
        { $project: { matchedPowers: 0 } }
    ];
}

// 2. Universe Lookup Stage
export function buildUniverseLookup() {
    return [
        {
            $lookup: {
                from: "universes",
                let: { rawPublisher: "$biography.publisher" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$id", "$$rawPublisher"] },
                                    { $eq: ["$value", "$$rawPublisher"] },
                                    { $eq: ["$name", "$$rawPublisher"] }
                                ]
                            }
                        }
                    },
                    { $project: { teams: 0 } }
                ],
                as: "biography.publisher"
            }
        },
        { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } }
    ];
}

// 3. Teams Lookup Stage
export function buildTeamsLookup() {
    return [
        {
            $lookup: {
                from: "teams",
                let: { rawAffiliations: "$connections.groupAffiliation" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $in: ["$id", { $ifNull: ["$$rawAffiliations", []] }] },
                                    { $in: ["$name", { $ifNull: ["$$rawAffiliations", []] }] }
                                ]
                            }
                        }
                    },
                    { $project: { universe: 0 } }
                ],
                as: "matchedTeams"
            }
        },
        {
            $addFields: {
                "connections.groupAffiliation": {
                    $concatArrays: [
                        "$matchedTeams",
                        {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $ifNull: ["$connections.groupAffiliation", []] },
                                        as: "item",
                                        cond: {
                                            $and: [
                                                { $eq: [{ $type: "$$item" }, "string"] },
                                                { $not: { $in: ["$$item", "$matchedTeams.name"] } }
                                            ]
                                        }
                                    }
                                },
                                as: "strName",
                                in: { name: "$$strName", isFallback: true }
                            }
                        }
                    ]
                }
            }
        },
        { $project: { matchedTeams: 0 } }
    ];
}

// 4. Enemies Lookup Stage (Fixed Universe Scope)
export function buildEnemiesLookup() {
    return [
        {
            $lookup: {
                from: "characters",
                let: {
                    enemies: { $ifNull: ["$connections.enemies", []] },
                    publisher: { $ifNull: ["$biography.publisher", ""] }, // ← plain string now
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    // Universe guard — same publisher string
                                    {
                                        $or: [
                                            { $eq: ["$$publisher", ""] },
                                            { $eq: ["$biography.publisher", "$$publisher"] },
                                        ]
                                    },
                                    // Match strategies
                                    {
                                        $or: [
                                            // Strategy 1 — numeric ID
                                            { $in: ["$id", "$$enemies"] },
                                            // Strategy 2 — exact name or full name
                                            { $in: ["$name", "$$enemies"] },
                                            { $in: ["$biography.fullName", "$$enemies"] },
                                            // Strategy 3 — substring direction 1 only, min length 5
                                            {
                                                $gt: [{
                                                    $size: {
                                                        $filter: {
                                                            input: "$$enemies",
                                                            as: "e",
                                                            cond: {
                                                                $and: [
                                                                    { $eq: [{ $type: "$$e" }, "string"] },
                                                                    { $gte: [{ $strLenCP: "$$e" }, 5] },
                                                                    { $gte: [{ $strLenCP: "$name" }, 5] },
                                                                    { $ne: [{ $indexOfCP: [{ $toLower: "$name" }, { $toLower: "$$e" }] }, -1] }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }, 0]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { $project: { characters: 0 } }
                ],
                as: "resolvedEnemies"
            }
        },
        {
            $addFields: {
                "connections.enemies": {
                    $concatArrays: [
                        "$resolvedEnemies",
                        {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $ifNull: ["$connections.enemies", []] },
                                        as: "e",
                                        cond: {
                                            $and: [
                                                { $eq: [{ $type: "$$e" }, "string"] },
                                                { $not: { $in: ["$$e", "$resolvedEnemies.name"] } }
                                            ]
                                        }
                                    }
                                },
                                as: "unmatched",
                                in: { name: "$$unmatched", isFallback: true }
                            }
                        }
                    ]
                }
            }
        },
        { $project: { resolvedEnemies: 0 } }
    ];
}