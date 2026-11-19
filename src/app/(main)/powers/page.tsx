import { PaginationPages } from "@/components/filters/Pagination";
import { collectionPowers } from "@/db/mongodb";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import { seedPowersCollectionStatusEffect } from "@/db/seeds";
import { EntityFilterBar } from "@/components/filters/EntityFilterBar";

export const instant = false;

export default async function PowersPage({
    searchParams
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined,
        page?: string,
        sort?: string,
        sortOrientation?: string,
        name?: string,
        tier?: string,
        combatRole?: string,
        activationType?: string,
        modes?: string,
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;

    const sortProperty = params.sort?.toString() || "id"; // 🚀 Default to score
    const sortOrientation = params.sortOrientation?.toString() || "desc";

    const name = params.name?.toString() || "";
    const tier = parseInt(params.tier?.toString() || "");
    const combatRole = params.combatRole?.toString() || "";
    const activationType = params.activationType?.toString() || "";
    const modesParam = params.modes?.toString() || "";
    const modes = modesParam ? modesParam.split(",") : [];

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
        query.$or = [{ name: nameRegex }, { value: nameRegex }];
    }

    if (!Number.isNaN(tier)) query.tier = tier;
    if (combatRole) query.combatRole = combatRole;
    if (activationType) query.activationType = activationType;

    const powersPerPage = await collectionPowers
        .find(query)
        .sort({ [sortProperty]: sortOrientation === "desc" ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

    const sanitizedPowers = sanitize(powersPerPage);
    const totalPowers = await collectionPowers.countDocuments(query);
    const totalPages = Math.ceil(totalPowers / pageSize);

    // const powersToUpdate: Parameters<typeof seedPowersCollectionStatusEffect>[0] = [
    //     {
    //         "name": "Concussive Blasts 💥",
    //         "id": 2,
    //         "statusEffects": [
    //             {
    //                 "type": "stun",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Energy ⚡",
    //         "id": 3,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Bounty Hunting Skills 🎯",
    //         "id": 4,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Temporal 🕰️",
    //         "id": 5,
    //         "statusEffects": [
    //             {
    //                 "type": "time_slow",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "time_acceleration",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Size 📏",
    //         "id": 6,
    //         "statusEffects": [
    //             {
    //                 "type": "size_change",
    //                 "duration": 2,
    //                 "value": 25
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Healing ⚕️",
    //         "id": 7,
    //         "statusEffects": [
    //             {
    //                 "type": "regen",
    //                 "duration": 3,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Superhuman Speed 🏃‍♂️💨",
    //         "id": 8,
    //         "statusEffects": [
    //             {
    //                 "type": "speed_up",
    //                 "duration": 2,
    //                 "value": 25
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Flight ✈️",
    //         "id": 9,
    //         "statusEffects": [
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Sound 🔊",
    //         "id": 10,
    //         "statusEffects": [
    //             {
    //                 "type": "silence",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "stun",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Enhanced Durability 🛡️💪",
    //         "id": 11,
    //         "statusEffects": [
    //             {
    //                 "type": "damage_reduction",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Sorcery 🧙",
    //         "id": 12,
    //         "statusEffects": [
    //             {
    //                 "type": "curse",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Durability 🛡️",
    //         "id": 13,
    //         "statusEffects": [
    //             {
    //                 "type": "damage_reduction",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Advanced Technology 🛠️",
    //         "id": 14,
    //         "statusEffects": [
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Superhuman Strength 💪",
    //         "id": 15,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 25
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Enhanced Senses 👀",
    //         "id": 16,
    //         "statusEffects": [
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Expert Strategist 🧠",
    //         "id": 17,
    //         "statusEffects": [
    //             {
    //                 "type": "focus",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Gadgets 🔧",
    //         "id": 18,
    //         "statusEffects": [
    //             {
    //                 "type": "marked",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Intangibility 👻",
    //         "id": 19,
    //         "statusEffects": [
    //             {
    //                 "type": "phase",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Absorption and Mimicry of Materials 🔄",
    //         "id": 20,
    //         "statusEffects": [
    //             {
    //                 "type": "adaptation",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Weapon Proficiency 🔫",
    //         "id": 21,
    //         "statusEffects": [
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Acrobatics/Superhuman Agility 🤸",
    //         "id": 22,
    //         "statusEffects": [
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "speed_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Force Field Generation 🛡️",
    //         "id": 23,
    //         "statusEffects": [
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 2
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Time Travel ⏳",
    //         "id": 24,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Power Mimicry 💫",
    //         "id": 25,
    //         "statusEffects": [
    //             {
    //                 "type": "power_copy",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Detective Skills 🕵️‍♂️",
    //         "id": 26,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Light 💡",
    //         "id": 27,
    //         "statusEffects": [
    //             {
    //                 "type": "blind",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Heat Vision 🔥👀",
    //         "id": 28,
    //         "statusEffects": [
    //             {
    //                 "type": "burn",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Hand-to-Hand Combat 👊",
    //         "id": 29,
    //         "statusEffects": [
    //             {
    //                 "type": "weaken",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Tactical Expertise 🔍",
    //         "id": 30,
    //         "statusEffects": [
    //             {
    //                 "type": "focus",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Animalistic Agility 🐾",
    //         "id": 31,
    //         "statusEffects": [
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "speed_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Mystic Arts 🧙",
    //         "id": 32,
    //         "statusEffects": [
    //             {
    //                 "type": "curse",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Immortality",
    //         "id": 33,
    //         "statusEffects": [
    //             {
    //                 "type": "death_prevention",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Skilled Combatant ⚔️",
    //         "id": 34,
    //         "statusEffects": [
    //             {
    //                 "type": "focus",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Cosmic Awareness 🌌",
    //         "id": 35,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Invulnerability 🔒",
    //         "id": 36,
    //         "statusEffects": [
    //             {
    //                 "type": "invulnerable",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Master Detective 🔍",
    //         "id": 37,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Web Generation 🕸️",
    //         "id": 38,
    //         "statusEffects": [
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Regeneration ⚕️",
    //         "id": 39,
    //         "statusEffects": [
    //             {
    //                 "type": "regen",
    //                 "duration": 3,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Telepathy 🧠",
    //         "id": 40,
    //         "statusEffects": [
    //             {
    //                 "type": "confuse",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "silence",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Skilled Marksman / Firearm 🎯🔫",
    //         "id": 41,
    //         "statusEffects": [
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Tactical Genius 🧠🔍",
    //         "id": 42,
    //         "statusEffects": [
    //             {
    //                 "type": "focus",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Enhanced Strength 💪",
    //         "id": 43,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Claws 🔪",
    //         "id": 44,
    //         "statusEffects": [
    //             {
    //                 "type": "bleed",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Energy Absorption ⚡",
    //         "id": 45,
    //         "statusEffects": [
    //             {
    //                 "type": "energy_regen",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "damage_reduction",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Dimensional Travel 🌌",
    //         "id": 46,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Lightsaber Combat ⚔️",
    //         "id": 47,
    //         "statusEffects": [
    //             {
    //                 "type": "burn",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Dragon Physiology 🐉",
    //         "id": 48,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "damage_reduction",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Android Physiology 🤖",
    //         "id": 49,
    //         "statusEffects": [
    //             {
    //                 "type": "status_resistance",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Teleportation 🌌",
    //         "id": 50,
    //         "statusEffects": [
    //             {
    //                 "type": "phase",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Telekinesis 🧠",
    //         "id": 51,
    //         "statusEffects": [
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "disarm",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Enhanced/Superhuman Reflexes ⚡",
    //         "id": 52,
    //         "statusEffects": [
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Superhuman Intelligence 🧠",
    //         "id": 53,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Expert Marksman / Gun Proficiency 🎯🔫",
    //         "id": 54,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Magic",
    //         "id": 55,
    //         "statusEffects": [
    //             {
    //                 "type": "curse",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Diamond Form 💎",
    //         "id": 56,
    //         "statusEffects": [
    //             {
    //                 "type": "damage_reduction",
    //                 "duration": 2,
    //                 "value": 25
    //             },
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Pyrokinesis / Fire, Flame 🔥",
    //         "id": 57,
    //         "statusEffects": [
    //             {
    //                 "type": "burn",
    //                 "duration": 3,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Martial Arts 🥋",
    //         "id": 58,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "focus",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Genius-Level Intellect 🧠",
    //         "id": 59,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Engineering Genius 🛠️🧠",
    //         "id": 60,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Energy Projection ⚡",
    //         "id": 61,
    //         "statusEffects": [
    //             {
    //                 "type": "weaken",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Reality Warping 🌀",
    //         "id": 62,
    //         "statusEffects": [
    //             {
    //                 "type": "reality_distortion",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Elemental Control 🌍",
    //         "id": 63,
    //         "statusEffects": [
    //             {
    //                 "type": "elemental_vulnerability",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Adaptation 🔄",
    //         "id": 64,
    //         "statusEffects": [
    //             {
    //                 "type": "adaptation",
    //                 "duration": 2,
    //                 "value": 20
    //             },
    //             {
    //                 "type": "status_resistance",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Omnipotence ✨",
    //         "id": 65,
    //         "statusEffects": [
    //             {
    //                 "type": "reality_distortion",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Healing Factor 🩺",
    //         "id": 66,
    //         "statusEffects": [
    //             {
    //                 "type": "regen",
    //                 "duration": 3,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Animal Communication 🐾🗣️",
    //         "id": 67,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Animal Mimicry 🐾",
    //         "id": 68,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Energy Constructs ⚡",
    //         "id": 69,
    //         "statusEffects": [
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Enhanced Stamina 💪",
    //         "id": 70,
    //         "statusEffects": [
    //             {
    //                 "type": "fatigue_resistance",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Lantern Ring Mastery 💍",
    //         "id": 71,
    //         "statusEffects": [
    //             {
    //                 "type": "shield",
    //                 "duration": 2,
    //                 "value": 2
    //             },
    //             {
    //                 "type": "power_up",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Shapeshifting / Shape-Shifting 🔄",
    //         "id": 72,
    //         "statusEffects": [
    //             {
    //                 "type": "transformation",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Probability 🎲",
    //         "id": 73,
    //         "statusEffects": [
    //             {
    //                 "type": "critical_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Ninjutsu",
    //         "id": 74,
    //         "statusEffects": [
    //             {
    //                 "type": "stealth",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Underwater Adaptation / water 👃🌊",
    //         "id": 75,
    //         "statusEffects": [
    //             {
    //                 "type": "water_breathing",
    //                 "duration": 3,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Breaking the Fourth Wall",
    //         "id": 1,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Omnitrix ⌚👽👾",
    //         "id": 76,
    //         "statusEffects": [
    //             {
    //                 "type": "transformation",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Metamorphosis 🧬🔁",
    //         "id": 77,
    //         "statusEffects": [
    //             {
    //                 "type": "transformation",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Cybernetic Enhancements 🧬🤖",
    //         "id": 78,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Invisible / Invisibility 👁🙈🚫",
    //         "id": 79,
    //         "statusEffects": [
    //             {
    //                 "type": "stealth",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Magnetokinesis 🧲",
    //         "id": 80,
    //         "statusEffects": [
    //             {
    //                 "type": "disarm",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Hydrokinesis / Water Powers 💦💧",
    //         "id": 81,
    //         "statusEffects": [
    //             {
    //                 "type": "wet",
    //                 "duration": 2,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Breathing Techniques 👃💨",
    //         "id": 82,
    //         "statusEffects": [
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "focus",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Serpent Companionship 🐍",
    //         "id": 83,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Plant Ranged Weaponry 🌱🔫",
    //         "id": 84,
    //         "statusEffects": [
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "bleed",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Aerokinesis / Air 💨",
    //         "id": 85,
    //         "statusEffects": [
    //             {
    //                 "type": "slow",
    //                 "duration": 1,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Mist / Cloud / Fog ☁🌫",
    //         "id": 86,
    //         "statusEffects": [
    //             {
    //                 "type": "blind",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "stealth",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Geokinesis / Earth 🌍",
    //         "id": 87,
    //         "statusEffects": [
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 2,
    //                 "value": 15
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Insect Arts 🐛🐜🐝🕷🐞🦋🦟",
    //         "id": 88,
    //         "statusEffects": [
    //             {
    //                 "type": "poison",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "marked",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Transformation 💫🚀🧬✨",
    //         "id": 89,
    //         "statusEffects": [
    //             {
    //                 "type": "transformation",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Electricity / Electrokinesis ⚡",
    //         "id": 90,
    //         "statusEffects": [
    //             {
    //                 "type": "shocked",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "stun",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Weather ⛅🌩🌨🌧☁⛈",
    //         "id": 91,
    //         "statusEffects": [
    //             {
    //                 "type": "wet",
    //                 "duration": 2,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Elasticity / Superhuman Flexibility📏",
    //         "id": 92,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Archery 🎯🏹",
    //         "id": 93,
    //         "statusEffects": [
    //             {
    //                 "type": "accuracy_up",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "marked",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Cryokinesis, Ice, Cold, Freezing Powers 🧊❄🥶",
    //         "id": 94,
    //         "statusEffects": [
    //             {
    //                 "type": "chilled",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "freeze",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Dark force/Darkness/Shadow 🌑",
    //         "id": 95,
    //         "statusEffects": [
    //             {
    //                 "type": "blind",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "weaken",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Fear inducement 😱",
    //         "id": 96,
    //         "statusEffects": [
    //             {
    //                 "type": "fear",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Explosion 💥",
    //         "id": 97,
    //         "statusEffects": [
    //             {
    //                 "type": "burn",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "stun",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Gravity 🌍💨↕",
    //         "id": 98,
    //         "statusEffects": [
    //             {
    //                 "type": "root",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 2,
    //                 "value": 20
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Sword Arts ⚔✨",
    //         "id": 99,
    //         "statusEffects": [
    //             {
    //                 "type": "bleed",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Control Manipulation / Mind Control 🎮🧠",
    //         "id": 100,
    //         "statusEffects": [
    //             {
    //                 "type": "charm",
    //                 "duration": 2,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "confuse",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Blood 🩸",
    //         "id": 101,
    //         "statusEffects": [
    //             {
    //                 "type": "bleed",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "life_drain",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Wing Manifestation 🪽",
    //         "id": 102,
    //         "statusEffects": []
    //     },
    //     {
    //         "name": "Power/Magic Nullification 🚫⚡",
    //         "id": 103,
    //         "statusEffects": [
    //             {
    //                 "type": "power_seal",
    //                 "duration": 2,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Cursed Energy👻⚡",
    //         "id": 104,
    //         "statusEffects": [
    //             {
    //                 "type": "curse",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "burn",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Stealth / Camouflage 🙈👀🤫",
    //         "id": 105,
    //         "statusEffects": [
    //             {
    //                 "type": "stealth",
    //                 "duration": 2,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "evasion_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Vibration/Shockwave 📳〰️",
    //         "id": 106,
    //         "statusEffects": [
    //             {
    //                 "type": "stun",
    //                 "duration": 1,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "slow",
    //                 "duration": 1,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Illusion 👁️🌀",
    //         "id": 107,
    //         "statusEffects": [
    //             {
    //                 "type": "confuse",
    //                 "duration": 2,
    //                 "value": 1
    //             },
    //             {
    //                 "type": "blind",
    //                 "duration": 1,
    //                 "value": 1
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Radiation, Radioactivity, Nuclear Energy☢️",
    //         "id": 108,
    //         "statusEffects": [
    //             {
    //                 "type": "radiation",
    //                 "duration": 3,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "weaken",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     },
    //     {
    //         "name": "Vampire 🧛🩸",
    //         "id": 109,
    //         "statusEffects": [
    //             {
    //                 "type": "life_drain",
    //                 "duration": 2,
    //                 "value": 15
    //             },
    //             {
    //                 "type": "regen",
    //                 "duration": 2,
    //                 "value": 10
    //             },
    //             {
    //                 "type": "strength_up",
    //                 "duration": 2,
    //                 "value": 10
    //             }
    //         ]
    //     }
    // ]
    // seedPowersCollectionStatusEffect(powersToUpdate)

    return (
        <div className="">
            {/* <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense> */}
            <EntityFilterBar
                type="power"
                sortOptions={[
                    { value: "id", label: "Id" },
                    { value: "name", label: "Name" },
                    { value: "score", label: "Score" },
                ]}
            />

            <SwipeGrid
                items={sanitizedPowers}
                currentPage={page}
                totalPages={totalPages}
                type="power"
                emptyMessage="No powers found."
            />

            <div className="hidden sm:flex justify-center pb-4">
                <PaginationPages currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    )
}