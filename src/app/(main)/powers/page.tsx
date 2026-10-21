import { PaginationPages } from "@/components/filters/Pagination";
import PowerCard from "@/components/powers/PowerCard";
import { collectionPowers } from "@/db/mongodb";
import { Suspense } from "react";
import PowersFilterBar from "@/components/filters/PowersFilterBar"; // we'll create this
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { sanitize } from "@/lib/utils";
import { seedPowersCollectionActions, seedPowersCollectionCombatRole } from "@/db/seeds";

export const instant = false;

export default async function page({
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
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;

    const sortProperty = params.sort?.toString() || "id";  // default to score not id
    const sortOrientation = params.sortOrientation?.toString() || "desc";
    const name = params.name?.toString() || "";
    const tier = parseInt(params.tier?.toString() || "");
    const combatRole = params.combatRole?.toString() || "";
    const activationType = params.activationType?.toString() || "";

    const query: Record<string, string | number | object> = {};
    if (name) query.name = { $regex: name, $options: "i" };
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

    /* const powersToUpdate: Parameters<typeof seedPowersCollectionCombatRole>[0] = [
        {
            "name": "Illusion Manipulation 👁️🌀",
            "id": 107,
            "combatRole": "Control",
            "actions": [
                { "name": "Phantasm Mirage", "description": "Generate realistic decoy duplicates of the user to confuse targets.", "activationType": "Instant", "range": "Self", "targetType": "Self" },
                { "name": "Sensory Distortion", "description": "Alter an enemy's perception of distance, sound, or terrain layout.", "activationType": "Channeled", "range": "Ranged", "targetType": "Single Target" }
            ]
        },
        {
            "name": "Vibration/Shockwave Manipulation 📳〰️",
            "id": 106,
            "combatRole": "Offensive"
        },
        {
            "name": "Stealth/Camouflage Mastery 🙈👀🤫",
            "id": 105,
            "combatRole": "Utility"
        },
        {
            "name": "Cursed Energy Manipulation 👻⚡",
            "id": 104,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Power/Magic Nullification 🚫⚡",
            "id": 103,
            "combatRole": "Control"
        },
        {
            "name": "Wing Manifestation 🪽",
            "id": 102,
            "combatRole": "Utility"
        },
        {
            "name": "Blood Manipulation 🩸",
            "id": 101,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Control Manipulation 🎮🧠",
            "id": 100,
            "combatRole": "Control"
        },
        {
            "name": "Sword Arts ⚔✨",
            "id": 99,
            "combatRole": "Offensive"
        },
        {
            "name": "Gravity Manipulation 🌍💨↕",
            "id": 98,
            "combatRole": "Control",
            "actions": [
                { "name": "Gravity Crush", "description": "Multiply the gravitational pull on a target, pinning them forcefully to the floor.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Zero-G Well", "description": "Nullify gravity in an enclosed zone, causing objects and foes to float helplessly.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Explosion Manipulation 💥",
            "id": 97,
            "combatRole": "Offensive",
            "actions": [
                { "name": "Detonation Spark", "description": "Trigger an immediate, localized explosion on a targeted surface or object.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Blast Wave", "description": "Unleash a sweeping chain-reaction blast across a wide battlefield area.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Fear inducement 😱",
            "id": 96,
            "combatRole": "Control"
        },
        {
            "name": "Dark force/Darkness/Shadow Manipulation 🌑",
            "id": 95,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Shadow Strike", "description": "Materialize solid tendrils of darkness to lash out and bind an opponent.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Umbral Cloak", "description": "Shroud yourself in absolute darkness, completely masking presence and light.", "activationType": "Action", "range": "Self", "targetType": "Self" }
            ]
        },
        {
            "name": "Cryokinesis, Ice, Cold, Freezing Powers 🧊❄🥶",
            "id": 94,
            "combatRole": "Control",
            "actions": [
                { "name": "Frost Spike", "description": "Shoot sharp shards of jagged ice piercing through the air.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Glacial Freeze", "description": "Flash-freeze the surrounding ground and trap nearby enemies in thick ice.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Archery 🎯🏹",
            "id": 93,
            "combatRole": "Offensive"
        },
        {
            "name": "Elasticity / Superhuman Flexibility📏",
            "id": 92,
            "combatRole": "Utility"
        },
        {
            "name": "Weather Manipulation ⛅🌩🌨🌧☁⛈",
            "id": 91,
            "combatRole": "Control"
        },
        {
            "name": "Electricity Manipulation ⚡",
            "id": 90,
            "combatRole": "Offensive",
            "actions": [
                { "name": "Lightning Bolt", "description": "Discharge a high-voltage bolt of electrical current directly into a target.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Chain Spark", "description": "Release an electric arc that bounces between multiple close-range enemies.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Transformation 💫🚀🧬✨",
            "id": 89,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Insect Arts 🐛🐜🐝🕷🐞🦋🦟",
            "id": 88,
            "combatRole": "Utility"
        },
        {
            "name": "Geokinesis / Earth Manipulation 🌍",
            "id": 87,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Stone Pillar", "description": "Rupture the ground to thrust a massive pillar of rock upward beneath an enemy.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Earthquake Slam", "description": "Send violent seismic tremors rippling across the terrain to destabilize groups.", "activationType": "Channeled", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Mist Manipulation ☁🌫",
            "id": 86,
            "combatRole": "Utility"
        },
        {
            "name": "Aerokinesis / Air Manipulation 💨",
            "id": 85,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Air Blade", "description": "Compress wind into a razor-sharp crescent projectile to slice through targets.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Tornado Vortex", "description": "Spin surrounding air currents into a towering funnel cloud to trap enemies.", "activationType": "Channeled", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Plant Ranged Weaponry 🌱🔫",
            "id": 84,
            "combatRole": "Offensive"
        },
        {
            "name": "Serpent Companionship 🐍",
            "id": 83,
            "combatRole": "Utility"
        },
        {
            "name": "Breathing Techniques 👃💨",
            "id": 82,
            "combatRole": "Utility"
        },
        {
            "name": "Hydrokinesis / Water Powers 💦💧",
            "id": 81,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Water Whip", "description": "Lash out with a high-pressure stream of water to strike or trip an opponent.", "activationType": "Action", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Tidal Surge", "description": "Crest a massive wave of water to sweep across a wide zone.", "activationType": "Channeled", "range": "Ranged", "targetType": "Area of Effect (AoE)" },
                { "name": "Liquid Barrier", "description": "Dense swirling water circles the user, deflecting incoming physical attacks.", "activationType": "Instant", "range": "Self", "targetType": "Self" }
            ]
        },
        {
            "name": "Magnetokinesis 🧲",
            "id": 80,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Metal Projectile Launch", "description": "Hurl nearby metallic debris at high velocities like bullets.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Magnetic Disarm", "description": "Rip weapons and armor right out of the hands and bodies of opponents.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Invisible 👁🙈🚫",
            "id": 79,
            "combatRole": "Utility"
        },
        {
            "name": "Cybernetic Enhancements 🧬🤖",
            "id": 78,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Metamorphosis 🧬🔁",
            "id": 77,
            "combatRole": "Utility"
        },
        {
            "name": "Omnitrix ⌚👽👾",
            "id": 76,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Underwater Adaptation 👃🌊",
            "id": 75,
            "combatRole": "Utility"
        },
        {
            "name": "Ninjutsu",
            "id": 74,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Probability Manipulation 🎲",
            "id": 73,
            "combatRole": "Control"
        },
        {
            "name": "Shapeshifting 🔄",
            "id": 72,
            "combatRole": "Utility"
        },
        {
            "name": "Lantern Ring Mastery 💍",
            "id": 71,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Enhanced Stamina 💪",
            "id": 70,
            "combatRole": "Utility"
        },
        {
            "name": "Energy Constructs ⚡",
            "id": 69,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Animal Mimicry 🐾",
            "id": 68,
            "combatRole": "Utility"
        },
        {
            "name": "Animal Communication 🐾🗣️",
            "id": 67,
            "combatRole": "Utility"
        },
        {
            "name": "Healing Factor 🩺",
            "id": 66,
            "combatRole": "Defensive"
        },
        {
            "name": "Omnipotence ✨",
            "id": 65,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Adaptation 🔄",
            "id": 64,
            "combatRole": "Defensive"
        },
        {
            "name": "Elemental Control 🌍",
            "id": 63,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Reality Warping 🌀",
            "id": 62,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Energy Projection ⚡",
            "id": 61,
            "combatRole": "Offensive"
        },
        {
            "name": "Engineering Genius 🛠️🧠",
            "id": 60,
            "combatRole": "Utility"
        },
        {
            "name": "Genius-Level Intellect 🧠",
            "id": 59,
            "combatRole": "Utility"
        },
        {
            "name": "Martial Arts 🥋",
            "id": 58,
            "combatRole": "Offensive"
        },
        {
            "name": "Pyrokinesis / Fire, Flame Manipulation 🔥",
            "id": 57,
            "combatRole": "Offensive",
            "actions": [
                { "name": "Flame Burst", "description": "Unleash a sudden eruption of scorching flames at a specific target.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Fire Wall", "description": "Crest a blazing barrier of fire to block enemy paths or incoming projectiles.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Diamond Form 💎",
            "id": 56,
            "combatRole": "Defensive"
        },
        {
            "name": "Magic Manipulation",
            "id": 55,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Expert Marksman / Gun Proficiency 🎯🔫",
            "id": 54,
            "combatRole": "Offensive"
        },
        {
            "name": "Superhuman Intelligence 🧠",
            "id": 53,
            "combatRole": "Utility"
        },
        {
            "name": "Enhanced/Superhuman Reflexes ⚡",
            "id": 52,
            "combatRole": "Defensive"
        },
        {
            "name": "Telekinesis 🧠",
            "id": 51,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Kinetic Push", "description": "Unleash a sudden invisible shockwave of mental force to knock back attackers.", "activationType": "Instant", "range": "Ranged", "targetType": "Area of Effect (AoE)" },
                { "name": "Object Levitation", "description": "Lift and hurl heavy environmental objects or projectiles with your mind.", "activationType": "Action", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Psychic Grip", "description": "Lock down an enemy's limbs or suspend them mid-air, neutralizing movement.", "activationType": "Channeled", "range": "Ranged", "targetType": "Single Target" }
            ]
        },
        {
            "name": "Teleportation 🌌",
            "id": 50,
            "combatRole": "Utility"
        },
        {
            "name": "Android Physiology 🤖",
            "id": 49,
            "combatRole": "Defensive"
        },
        {
            "name": "Dragon Physiology 🐉",
            "id": 48,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Lightsaber Combat ⚔️",
            "id": 47,
            "combatRole": "Offensive"
        },
        {
            "name": "Dimensional Travel 🌌",
            "id": 46,
            "combatRole": "Utility",
            "actions": [
                { "name": "Gateway", "description": "Open a spatial portal connecting two distant locations instantly.", "activationType": "Channeled", "range": "Global", "targetType": "Self / AoE" },
                { "name": "Blink Step", "description": "Instantly fold space to teleport a short distance away to evade attacks.", "activationType": "Instant", "range": "Ranged", "targetType": "Self" }
            ]
        },
        {
            "name": "Energy Absorption ⚡",
            "id": 45,
            "combatRole": "Defensive"
        },
        {
            "name": "Claws 🔪",
            "id": 44,
            "combatRole": "Offensive"
        },
        {
            "name": "Enhanced Strength 💪",
            "id": 43,
            "combatRole": "Offensive"
        },
        {
            "name": "Tactical Genius 🧠🔍",
            "id": 42,
            "combatRole": "Utility"
        },
        {
            "name": "Skilled Marksman / Firearm 🎯🔫",
            "id": 41,
            "combatRole": "Offensive"
        },
        {
            "name": "Telepathy 🧠",
            "id": 40,
            "combatRole": "Control",
            "actions": [
                { "name": "Mind Probe", "description": "Read the surface thoughts or immediate intentions of a target.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Mental Static", "description": "Broadcast psychic noise to disrupt enemy concentration and spellcasting.", "activationType": "Channeled", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Regeneration ⚕️",
            "id": 39,
            "combatRole": "Defensive"
        },
        {
            "name": "Web Generation 🕸️",
            "id": 38,
            "combatRole": "Control"
        },
        {
            "name": "Master Detective 🔍",
            "id": 37,
            "combatRole": "Utility"
        },
        {
            "name": "Invulnerability 🔒",
            "id": 36,
            "combatRole": "Defensive"
        },
        {
            "name": "Cosmic Awareness 🌌",
            "id": 35,
            "combatRole": "Utility"
        },
        {
            "name": "Skilled Combatant ⚔️",
            "id": 34,
            "combatRole": "Offensive"
        },
        {
            "name": "Immortality",
            "id": 33,
            "combatRole": "Defensive"
        },
        {
            "name": "Mystic Arts 🧙",
            "id": 32,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Animalistic Agility 🐾",
            "id": 31,
            "combatRole": "Utility"
        },
        {
            "name": "Tactical Expertise 🔍",
            "id": 30,
            "combatRole": "Utility"
        },
        {
            "name": "Hand-to-Hand Combat 👊",
            "id": 29,
            "combatRole": "Offensive"
        },
        {
            "name": "Heat Vision 🔥👀",
            "id": 28,
            "combatRole": "Offensive"
        },
        {
            "name": "Light Manipulation 💡",
            "id": 27,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Photon Laser", "description": "Focus hard light into a concentrated, burning thermal beam.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Flashbang Burst", "description": "Emit an intensely blinding flare of light to disorient everyone nearby.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Detective Skills 🕵️‍♂️",
            "id": 26,
            "combatRole": "Utility"
        },
        {
            "name": "Power Mimicry 💫",
            "id": 25,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Time/Manipulation Travel ⏳",
            "id": 24,
            "combatRole": "Control"
        },
        {
            "name": "Force Field Generation 🛡️",
            "id": 23,
            "combatRole": "Defensive",
            "actions": [
                { "name": "Barrier Dome", "description": "Erect a hard-light protective sphere around the user or allies.", "activationType": "Instant", "range": "Self", "targetType": "Self / AoE" },
                { "name": "Kinetic Shove", "description": "Expand a generated barrier outward to push back surrounding threats.", "activationType": "Action", "range": "Self", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Acrobatics/Superhuman Agility 🤸",
            "id": 22,
            "combatRole": "Utility"
        },
        {
            "name": "Weapon Proficiency 🔫",
            "id": 21,
            "combatRole": "Offensive"
        },
        {
            "name": "Absorption and Mimicry of Materials 🔄",
            "id": 20,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Intangibility 👻",
            "id": 19,
            "combatRole": "Defensive",
            "actions": [
                { "name": "Phase Shift", "description": "Render your molecular structure completely solid-passing so physical attacks clip right through.", "activationType": "Action", "range": "Self", "targetType": "Self" },
                { "name": "Ghost Walk", "description": "Glide seamlessly through solid walls, floors, and physical barriers.", "activationType": "Channeled", "range": "Self", "targetType": "Self" }
            ]
        },
        {
            "name": "Gadgets 🔧",
            "id": 18,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Expert Strategist 🧠",
            "id": 17,
            "combatRole": "Utility"
        },
        {
            "name": "Enhanced Senses 👀",
            "id": 16,
            "combatRole": "Utility"
        },
        {
            "name": "Superhuman Strength 💪",
            "id": 15,
            "combatRole": "Offensive"
        },
        {
            "name": "Advanced Technology 🛠️",
            "id": 14,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Durability 🛡️",
            "id": 13,
            "combatRole": "Defensive"
        },
        {
            "name": "Sorcery 🧙",
            "id": 12,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Enhanced Durability 🛡️💪",
            "id": 11,
            "combatRole": "Defensive"
        },
        {
            "name": "Sound Manipulation 🔊",
            "id": 10,
            "combatRole": "Control",
            "actions": [
                { "name": "Sonic Scream", "description": "Release a concentrated beam of high-frequency sound waves to shatter armor.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Deafening Pulse", "description": "Send out a booming shockwave that disorients and stuns everyone in the area.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Flight ✈️",
            "id": 9,
            "combatRole": "Utility",
            "actions": [
                { "name": "Aerial Dash", "description": "Explode forward at supersonic speed through the air.", "activationType": "Instant", "range": "Self", "targetType": "Self" },
                { "name": "Hover / Levitate", "description": "Maintain a stationary position suspended in mid-air.", "activationType": "Passive", "range": "Self", "targetType": "Self" }
            ]
        },
        {
            "name": "Superhuman Speed 🏃‍♂️💨",
            "id": 8,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Mach Sprint", "description": "Accelerate instantly to blur speeds, leaving behind shockwaves.", "activationType": "Action", "range": "Self", "targetType": "Self" },
                { "name": "Rapid Strikes", "description": "Deliver a flurry of hundreds of punches in the span of a single second.", "activationType": "Instant", "range": "Melee", "targetType": "Single Target" }
            ]
        },
        {
            "name": "Healing ⚕️",
            "id": 7,
            "combatRole": "Defensive"
        },
        {
            "name": "Size Manipulation 📏",
            "id": 6,
            "combatRole": "Hybrid / Versatile"
        },
        {
            "name": "Temporal Manipulation 🕰️",
            "id": 5,
            "combatRole": "Control"
        },
        {
            "name": "Bounty Hunting Skills 🎯",
            "id": 4,
            "combatRole": "Utility"
        },
        {
            "name": "Energy Manipulation ⚡",
            "id": 3,
            "combatRole": "Hybrid / Versatile",
            "actions": [
                { "name": "Energy Bolt", "description": "Fire concentrated beams of pure raw energy at a target.", "activationType": "Instant", "range": "Ranged", "targetType": "Single Target" },
                { "name": "Overload Pulse", "description": "Discharge an omnidirectional shockwave of energy to clear surrounding space.", "activationType": "Action", "range": "Ranged", "targetType": "Area of Effect (AoE)" }
            ]
        },
        {
            "name": "Concussive Blasts 💥",
            "id": 2,
            "combatRole": "Offensive"
        },
        {
            "name": "Breaking the Fourth Wall",
            "id": 1,
            "combatRole": "Utility"
        }
    ]

    seedPowersCollectionCombatRole(powersToUpdate) */

    return (
        <div className="space-y-2 mt-4">
            {/* <div>
                <h1 className="text-2xl font-bold">Powers</h1>
                <p className="text-muted-foreground font-light">
                    {totalPowers} powers across all universes
                </p>
            </div> */}

            <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
                {sanitizedPowers.map((power) => (
                    <LoadingLink key={power.id} href={`/powers/${power.id}`}>
                        <PowerCard power={power} size="default" />
                    </LoadingLink>
                ))}
                {sanitizedPowers.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        No powers found.
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalPowers / pageSize)} />
            </div>
        </div>
    )
}