import { QueryOptions } from "@/types";
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

/* green lantern doesn't match green lantern II and all the others just one it should add all of the ones that coincide not just the first one*/
export function joinTeam_universe_power_enemies_toCharacter(
    queryOptions: QueryOptions,
    sortBy: string,
    sortDirection: string,
    offset: number,
    howManyPerPage: number
) {
    const baseLookups = [
        { $match: { ...queryOptions } },

        // 1. Powers Lookup (Handles Numeric IDs & Partial/Sub-string Matches for Names)
        {
            $lookup: {
                from: "powers",
                let: { rawPowers: { $ifNull: ["$powers", []] } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    // Match by ID
                                    { $in: ["$id", "$$rawPowers"] },

                                    // Match if DB $name contains any string in$$rawPowers (or vice-versa)
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
                                                                        // DB name contains raw power string (e.g. "Elasticity / Superhuman Flexibility" contains "Elasticity")
                                                                        {
                                                                            $ne: [
                                                                                {
                                                                                    $indexOfCP: [
                                                                                        { $toLower: "$name" },
                                                                                        { $toLower: "$$p" }
                                                                                    ]
                                                                                },
                                                                                -1
                                                                            ]
                                                                        },
                                                                        // Raw power string contains DB name
                                                                        {
                                                                            $ne: [
                                                                                {
                                                                                    $indexOfCP: [
                                                                                        { $toLower: "$$p" },
                                                                                        { $toLower: "$name" }
                                                                                    ]
                                                                                },
                                                                                -1
                                                                            ]
                                                                        }
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
                                                    // Ensure we don't output a fallback string if it partially matched a DB power
                                                    $not: {
                                                        $gt: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$matchedPowers.name",
                                                                        as: "mpName",
                                                                        cond: {
                                                                            $or: [
                                                                                {
                                                                                    $ne: [
                                                                                        {
                                                                                            $indexOfCP: [
                                                                                                { $toLower: "$$mpName" },
                                                                                                { $toLower: "$$item" }
                                                                                            ]
                                                                                        },
                                                                                        -1
                                                                                    ]
                                                                                },
                                                                                {
                                                                                    $ne: [
                                                                                        {
                                                                                            $indexOfCP: [
                                                                                                { $toLower: "$$item" },
                                                                                                { $toLower: "$$mpName" }]
                                                                                        }, -1]
                                                                                }]
                                                                        }
                                                                    }
                                                                }
                                                            }, 0]
                                                    }
                                                }]
                                        }
                                    }
                                }, as: "str", in: { name: "$$str", isFallback: true }
                            }
                        }
                    ]
                }
            }
        },
        { $project: { matchedPowers: 0 } },

        // 2. Universe Lookup
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
        { $unwind: { path: "$biography.publisher", preserveNullAndEmptyArrays: true } },

        // 3. Teams / Group Affiliations Lookup
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
                                                { $not: { $in: ["$$item", "$matchedTeams.name"] } }]
                                        }
                                    }
                                }, as: "strName", in: { name: "$$strName", isFallback: true }
                            }
                        }
                    ]
                }
            }
        },
        { $project: { matchedTeams: 0 } },

        // 4. Enemies Lookup (Matches ID, Name, or Full Name)
        {
            $lookup: {
                from: "characters",
                let: { rawEnemies: "$connections.enemies" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $in: ["$id", { $ifNull: ["$$rawEnemies", []] }] },
                                    { $in: ["$name", { $ifNull: ["$$rawEnemies", []] }] },
                                    { $in: ["$biography.fullName", { $ifNull: ["$$rawEnemies", []] }] }
                                ]
                            }
                        }
                    },
                    { $project: { characters: 0 } }
                ],
                as: "matchedEnemies"
            }
        },
        {
            $addFields: {
                "connections.enemies": {
                    $concatArrays: [
                        "$matchedEnemies",
                        {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $ifNull: ["$connections.enemies", []] },
                                        as: "item",
                                        cond: {
                                            $and: [
                                                { $eq: [{ $type: "$$item" }, "string"] },
                                                { $not: { $in: ["$$item", "$matchedEnemies.name"] } },
                                                { $not: { $in: ["$$item", "$matchedEnemies.biography.fullName"] } }
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
        { $project: { matchedEnemies: 0 } }
    ];

    return [
        ...baseLookups,
        { $sort: { [`${sortBy}`]: sortDirection === "desc" ? -1 : 1 } },
        { $skip: offset },
        { $limit: howManyPerPage }
    ];
}
