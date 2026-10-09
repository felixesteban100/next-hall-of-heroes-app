import { Frown, Mars, Meh, PersonStanding, Smile, Venus } from "lucide-react";

export function getCharacterAlignmentColor(alignment: string) {
    switch (alignment) {
        case "good":
            // return "text-green-500 bg-transparent font-bold";
            return "bg-green-400 text-black";
        case "neutral":
            // return "text-yellow-500 bg-transparent font-bold";
            return "bg-yellow-400 text-black";
        case "bad":
            // return "text-red-500 bg-transparent font-bold";
            return "bg-red-600 text-white";
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

export function getCharacterGenderTextColor(gender: string) {
    return gender === "Male" ? "text-blue-500" : "text-pink-500"
}

export function getCharacterGenderIcon(gender: string) {
    return gender === "Male" ? Mars : Venus
}

export function getCharacterRaceIcon(race: string) {
    switch (race) {
        default:
            return PersonStanding
    }
}

export function getRandom10Ids(ids: number[], count = 10) {
    const temp = [...ids];
    const result = [];
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * temp.length);
        result.push(temp.splice(index, 1)[0]);
    }
    return result;
}


export function joinTeam_universe_power_enemies_toCharacter(
    queryOptions: Record<string, any>,
    sortBy: string,
    sortDirection: string,
    offset: number,
    howManyPerPage: number,
    options: { includeEnemies?: boolean } = {}  // ← add this
) {
    const { includeEnemies = true } = options;

    return [
        { $match: { ...queryOptions } },
        { $sort: { [sortBy]: sortDirection === "desc" ? -1 : 1, _id: 1 } },
        { $skip: offset },
        { $limit: howManyPerPage },
        ...buildUniverseLookup(),
        ...(includeEnemies ? buildPowersLookup() : []),
        ...(includeEnemies ? buildTeamsLookup() : []),
        ...(includeEnemies ? buildEnemiesLookup() : []),
        ...(includeEnemies === false ?
            [{
                $project: {
                    id: 1,
                    name: 1,
                    images: 1,
                    tier: 1,
                    class: 1,
                    character_type: 1,
                    "biography.fullName": 1,
                    "biography.alignment": 1,
                    "biography.publisher.logo": 1,  // or just .logo if that's all CardFooter uses
                    "appearance.gender": 1,
                    "powerstats.total": 1,     // if you show the score
                }
            }] : []
        )
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

// 4. Enemies Lookup Stage
export function buildEnemiesLookup() {
    const publisherToString = (fieldPath: string) => ({
        $toLower: {
            $trim: {
                input: {
                    $let: {
                        vars: { pub: { $ifNull: [fieldPath, null] } },
                        in: {
                            $cond: {
                                if: { $eq: [{ $type: "$$pub" }, "string"] },
                                then: "$$pub",
                                else: {
                                    $ifNull: [
                                        "$$pub.name",
                                        { $ifNull: ["$$pub.value", ""] }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return [
        {
            $lookup: {
                from: "characters",
                let: {
                    enemies: { $ifNull: ["$connections.enemies", []] },
                    parentPublisher: publisherToString("$biography.publisher")
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    // At least one enemy matches this character
                                    {
                                        $anyElementTrue: {
                                            $map: {
                                                input: "$$enemies",
                                                as: "e",
                                                in: {
                                                    $or: [
                                                        // Exact ID match
                                                        {
                                                            $eq: [
                                                                { $toString: "$id" },
                                                                { $toString: "$$e" }
                                                            ]
                                                        },
                                                        // Regex name match (case-insensitive)
                                                        {
                                                            $regexMatch: {
                                                                input: { $ifNull: ["$name", ""] },
                                                                regex: { $toString: "$$e" },
                                                                options: "i"
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    // Same publisher
                                    {
                                        $eq: [
                                            publisherToString("$biography.publisher"),
                                            "$$parentPublisher"
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            name: 1,
                            image: "$images.md",
                            alignment: "$biography.alignment"
                        }
                    }
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
                                            $not: {
                                                $anyElementTrue: {
                                                    $map: {
                                                        input: "$resolvedEnemies",
                                                        as: "r",
                                                        in: {
                                                            $or: [
                                                                // matched by ID
                                                                {
                                                                    $eq: [
                                                                        { $toString: "$$r.id" },
                                                                        { $toString: "$$e" }
                                                                    ]
                                                                },
                                                                // matched by name (same regex logic)
                                                                {
                                                                    $regexMatch: {
                                                                        input: { $ifNull: ["$$r.name", ""] },
                                                                        regex: { $toString: "$$e" },
                                                                        options: "i"
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
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