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

// //5. Overall addition State
// export function buildOverallScoreStage() {
//     const tierScore = (value: any, scores: Record<number, number>, fallback: number) => ({
//         $switch: {
//             branches: Object.entries(scores).map(([key, score]) => ({
//                 case: { $eq: [value, Number(key)] },
//                 then: score,
//             })),
//             default: fallback,
//         },
//     });

//     return [
//         {
//             $addFields: {
//                 _overallSortScore: {
//                     $let: {
//                         vars: {
//                             tierPoints: tierScore("$tier", {
//                                 0: 5, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100,
//                             }, 5),

//                             classPoints: tierScore("$class", {
//                                 0: 10, 1: 50, 2: 45, 3: 55, 4: 35, 5: 70,
//                             }, 10),

//                             powerPoints: {
//                                 $let: {
//                                     vars: {
//                                         powerList: { $ifNull: ["$powers", []] },
//                                     },
//                                     in: {
//                                         $cond: [
//                                             { $eq: [{ $size: "$$powerList" }, 0] },
//                                             0,
//                                             {
//                                                 $min: [
//                                                     100,
//                                                     {
//                                                         $divide: [
//                                                             {
//                                                                 $sum: {
//                                                                     $map: {
//                                                                         input: "$$powerList",
//                                                                         as: "p",
//                                                                         in: {
//                                                                             $cond: [
//                                                                                 { $eq: ["$$p.isFallback", true] },
//                                                                                 6,
//                                                                                 {
//                                                                                     $add: [
//                                                                                         {
//                                                                                             $multiply: [
//                                                                                                 0.55,
//                                                                                                 {
//                                                                                                     $min: [
//                                                                                                         100,
//                                                                                                         {
//                                                                                                             $convert: {
//                                                                                                                 input: "$$p.score",
//                                                                                                                 to: "double",
//                                                                                                                 onError: 0,
//                                                                                                                 onNull: 0,
//                                                                                                             },
//                                                                                                         },
//                                                                                                     ],
//                                                                                                 },
//                                                                                             ],
//                                                                                         },
//                                                                                         {
//                                                                                             $multiply: [
//                                                                                                 0.45,
//                                                                                                 tierScore("$$p.tier", {
//                                                                                                     0: 5,
//                                                                                                     1: 12,
//                                                                                                     2: 22,
//                                                                                                     3: 35,
//                                                                                                     4: 48,
//                                                                                                     5: 60,
//                                                                                                     6: 72,
//                                                                                                     7: 82,
//                                                                                                     8: 90,
//                                                                                                     9: 96,
//                                                                                                     10: 100,
//                                                                                                 }, 5),
//                                                                                             ],
//                                                                                         },
//                                                                                     ],
//                                                                                 },
//                                                                             ],
//                                                                         },
//                                                                     },
//                                                                 },
//                                                             },
//                                                             {
//                                                                 $add: [
//                                                                     1,
//                                                                     {
//                                                                         $multiply: [
//                                                                             { $size: "$$powerList" },
//                                                                             0.07,
//                                                                         ],
//                                                                     },
//                                                                 ],
//                                                             },
//                                                         ],
//                                                     },
//                                                 ],
//                                             },
//                                         ],
//                                     },
//                                 },
//                             },

//                             threatPoints: {
//                                 $min: [
//                                     100,
//                                     {
//                                         $multiply: [
//                                             { $size: { $ifNull: ["$connections.enemies", []] } },
//                                             12.5,
//                                         ],
//                                     },
//                                 ],
//                             },

//                             weaknessPenalty: {
//                                 $min: [
//                                     15,
//                                     {
//                                         $multiply: [
//                                             {
//                                                 $size: {
//                                                     $filter: {
//                                                         input: { $ifNull: ["$weaknesses", []] },
//                                                         as: "weakness",
//                                                         cond: {
//                                                             $and: [
//                                                                 { $eq: [{ $type: "$$weakness" }, "string"] },
//                                                                 {
//                                                                     $ne: [
//                                                                         { $trim: { input: "$$weakness" } },
//                                                                         "",
//                                                                     ],
//                                                                 },
//                                                             ],
//                                                         },
//                                                     },
//                                                 },
//                                             },
//                                             3,
//                                         ],
//                                     },
//                                 ],
//                             },
//                         },
//                         in: {
//                             $round: [
//                                 {
//                                     $max: [
//                                         0,
//                                         {
//                                             $min: [
//                                                 100,
//                                                 {
//                                                     $subtract: [
//                                                         {
//                                                             $add: [
//                                                                 {
//                                                                     $multiply: [
//                                                                         { $ifNull: ["$powerstats.total", 0] },
//                                                                         0.35,
//                                                                     ],
//                                                                 },
//                                                                 { $multiply: ["$$tierPoints", 0.22] },
//                                                                 { $multiply: ["$$classPoints", 0.08] },
//                                                                 { $multiply: ["$$powerPoints", 0.25] },
//                                                                 { $multiply: ["$$threatPoints", 0.1] },
//                                                             ],
//                                                         },
//                                                         "$$weaknessPenalty",
//                                                     ],
//                                                 },
//                                             ],
//                                         },
//                                     ],
//                                 },
//                                 1,
//                             ],
//                         },
//                     },
//                 },
//             },
//         },
//     ];
// }