import { MAX_TEAM_SIZE } from "@/app/(main)/matchup/page";
import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import { Frown, Mars, Meh, PersonStanding, Smile, Venus } from "lucide-react";
import { CHARACTER_CLASS_COLOR, CHARACTER_TIER_COLOR, CHARACTER_TYPE_COLOR, POWER_ACTIVATION_TYPE_COLOR, POWER_COMBAT_ROLE_COLOR, POWER_TIER_COLOR } from "./constants";
import { buildEnemiesLookup, buildPowersLookup, buildTeamsLookup, buildUniverseLookup } from "./character_utilsAggregationPipelines";

export function getCharacterAlignmentColor(alignment: string) {
    switch (alignment) {
        case "good":
            // return "text-green-500 bg-transparent font-bold";
            return "bg-green-400 text-white";
        case "neutral":
            // return "text-yellow-500 bg-transparent font-bold";
            return "bg-yellow-400 text-white";
        case "bad":
            // return "text-red-500 bg-transparent font-bold";
            return "bg-red-600 text-white";
        default:
            return "bg-gray-500 text-foreground";
    }
}

export function getCharacterAlignmentColorsNameAndNumber(alignment: string) {
    switch (alignment) {
        case "good":
            return "green-400";
        case "neutral":
            return "yellow-400";
        case "bad":
            return "red-600";
        default:
            return "gray-500";
    }
}

export function getCharacterAlignmentBadgeColors(alignment: string) {
    switch (alignment) {
        case "good":
            return "bg-green-500/15 text-green-400 border border-green-500/25";
        case "neutral":
            return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25";
        case "bad":
            return "bg-red-500/15 text-red-400 border border-red-500/25";
        default:
            return "bg-gray-500/15 text-gray-400 border border-gray-500/25";
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

export function getCharacterAlignmentVarColor(alignment: string) {
    switch (alignment) {
        case "good":
            return "var(--color-green-500)";
        case "neutral":
            return "var(--color-yellow-500)";
        case "bad":
            return "var(--color-red-500)";
        default:
            return "var(--color-gray-500)";
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

export function getAlignmentIcon(alignment: string) {
    return alignment === "good" ? Smile : alignment === "bad" ? Frown : Meh
}

export function getCharacterGenderTextColor(gender: string) {
    return gender.toLowerCase() === "male" ? "text-blue-500" : "text-pink-500"
}

export function getCharacterGenderBackground(gender: string) {
    return gender.toLowerCase() === "male" ? "bg-blue-500" : "bg-pink-500"
}

export function getCharacterGenderIcon(gender: string) {
    return gender.toLowerCase() === "male" ? Mars : Venus
}

export function getCharacterGenderBadgeColors(gender: string) {
    return gender.toLowerCase() === "male" ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" : "bg-pink-500/15 text-pink-400 border border-pink-500/25"
}

export function getCharacterRaceIcon(race: string) {
    switch (race) {
        default:
            return PersonStanding
    }
}

export function getCharacterThematicMix(character: CharacterWithJoinTeamUniversePowerEnemies) {
    const tierColorCharacter = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];
    const classColor = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR] ?? CHARACTER_CLASS_COLOR[0];
    const typeColor = CHARACTER_TYPE_COLOR[(character.character_type === "" ? "unknown" : character.character_type) as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_COLOR["unknown"];
    const alignmentVarColor = getCharacterAlignmentVarColor(character.biography.alignment)

    const thematicMix = `color-mix(in srgb, color-mix(in srgb, color-mix(in srgb, ${tierColorCharacter.var}, ${classColor.var}), ${alignmentVarColor}), ${typeColor.var})`;
    return geThematicMixProperties(thematicMix)
}

export function getPowerThematicMix(power: Power) {
    const tierColorPower = POWER_TIER_COLOR[power.tier as keyof typeof POWER_TIER_COLOR] ?? POWER_TIER_COLOR[0]
    const roleColor = POWER_COMBAT_ROLE_COLOR[power.combatRole as PowerRole];
    const activationColor = POWER_ACTIVATION_TYPE_COLOR[power.activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR];

    const thematicMix = `color-mix(in srgb, color-mix(in srgb, ${tierColorPower.var}, ${roleColor.var}), ${activationColor.var})`;
    return geThematicMixProperties(thematicMix)
}

function geThematicMixProperties(thematicMix: string) {
    return {
        // background: thematicMix,
        background: `color-mix(in srgb, ${thematicMix} 70%, var(--background) 30%)`,
        borderColor: `color-mix(in srgb, ${thematicMix} 80%, var(--foreground) 20%)`,
        // text: `contrast-color(${thematicMix})`,
        // color: `color-mix(in srgb, ${thematicMix} 50%, ${`contrast-color(${thematicMix})`} 50%)`,
        color: `color-mix(in srgb, ${thematicMix} 50%, var(--foreground) 50%)`,
    }
}

export function getRandomIds(ids: number[], count = MAX_TEAM_SIZE) {
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
    options: { includeEnemies?: boolean } = {}
) {
    const { includeEnemies = true } = options;
    const direction = sortDirection === "desc" ? -1 : 1;

    // // Overall must be calculated after powers and enemies are resolved.
    // if (sortBy === "overall") {
    //     return [
    //         { $match: { ...queryOptions } },

    //         ...buildUniverseLookup(),
    //         ...buildPowersLookup(),
    //         ...(includeEnemies ? buildTeamsLookup() : []),
    //         ...buildEnemiesLookup(),

    //         ...buildOverallScoreStage(),

    //         {
    //             $sort: {
    //                 _overallSortScore: direction,
    //                 _id: 1,
    //             },
    //         },
    //         { $skip: offset },
    //         { $limit: howManyPerPage },

    //         { $project: { _overallSortScore: 0, _id: 0 } },

    //         ...(includeEnemies
    //             ? []
    //             : [
    //                 {
    //                     $project: {
    //                         id: 1,
    //                         name: 1,
    //                         images: 1,
    //                         tier: 1,
    //                         class: 1,
    //                         character_type: 1,
    //                         "biography.fullName": 1,
    //                         "biography.alignment": 1,
    //                         "biography.publisher.logo": 1,
    //                         "appearance.gender": 1,
    //                         "powerstats.total": 1,
    //                         imageFocus: 1,
    //                     },
    //                 },
    //             ]),
    //     ];
    // }

    // Keep the existing efficient pipeline for stored fields.
    return [
        { $match: { ...queryOptions } },
        { $sort: { [sortBy]: direction, _id: 1 } },
        { $skip: offset },
        { $limit: howManyPerPage },
        { $project: { _id: 0 } },

        ...buildUniverseLookup(),
        ...(includeEnemies ? buildPowersLookup() : []),
        ...(includeEnemies ? buildTeamsLookup() : []),
        ...(includeEnemies ? buildEnemiesLookup() : []),

        ...(includeEnemies === false
            ? [
                {
                    $project: {
                        id: 1,
                        name: 1,
                        images: 1,
                        tier: 1,
                        class: 1,
                        character_type: 1,
                        "biography.fullName": 1,
                        "biography.alignment": 1,
                        "biography.publisher.logo": 1,
                        "appearance.gender": 1,
                        "powerstats.total": 1,
                        imageFocus: 1,
                        _id: 0,
                    },
                },
            ]
            : []),
    ];
}