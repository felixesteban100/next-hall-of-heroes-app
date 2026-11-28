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

    const powersToUpdate: Parameters<typeof seedPowersCollectionStatusEffect>[0] = [
        {
            "name": "Cosmic Awareness 🌌",
            "id": 35,
            "statusEffects": [
                { "type": "accuracy_up", "duration": 3, "value": 25 },
                { "type": "evasion_up", "duration": 3, "value": 20 }
            ]
        },
        {
            "name": "Engineering Genius 🛠️🧠",
            "id": 60,
            "statusEffects": [
                { "type": "defense_up", "duration": 3, "value": 15 },
                { "type": "energy_regen", "duration": 3, "value": 10 }
            ]
        },
        {
            "name": "Energy ⚡",
            "id": 3,
            "statusEffects": [
                { "type": "energy_restore", "duration": 1, "value": 20 },
                { "type": "damage_up", "duration": 2, "value": 20 }
            ]
        },
        {
            "name": "Dimensional Travel 🌌",
            "id": 46,
            "statusEffects": [
                { "type": "phase", "duration": 2, "value": 1 },
                { "type": "evasion_up", "duration": 2, "value": 25 }
            ]
        },
        {
            "name": "Genius-Level Intellect 🧠",
            "id": 59,
            "statusEffects": [
                { "type": "focus", "duration": 3, "value": 15 },
                { "type": "accuracy_up", "duration": 3, "value": 15 }
            ]
        },
        {
            "name": "Superhuman Intelligence 🧠",
            "id": 53,
            "statusEffects": [
                { "type": "focus", "duration": 2, "value": 10 },
                { "type": "critical_up", "duration": 2, "value": 10 }
            ]
        },
        {
            "name": "Expert Marksman / Gun Proficiency 🎯🔫",
            "id": 54,
            "statusEffects": [
                { "type": "accuracy_up", "duration": 2, "value": 20 },
                { "type": "critical_damage_up", "duration": 2, "value": 25 }
            ]
        },
        {
            "name": "Bounty Hunting Skills 🎯",
            "id": 4,
            "statusEffects": [
                { "type": "marked", "duration": 3, "value": 15 },
                { "type": "target_lock", "duration": 3, "value": 1 }
            ]
        },
        {
            "name": "Animal Communication 🐾🗣️",
            "id": 67,
            "statusEffects": [
                { "type": "distraction", "duration": 2, "value": 15 },
                { "type": "charm", "duration": 1, "value": 1 }
            ]
        },
        {
            "name": "Breaking the Fourth Wall",
            "id": 1,
            "statusEffects": [
                { "type": "reality_distortion", "duration": 2, "value": 30 },
                { "type": "evasion_up", "duration": 2, "value": 30 }
            ]
        },
        {
            "name": "Serpent Companionship 🐍",
            "id": 83,
            "statusEffects": [
                { "type": "poison", "duration": 3, "value": 10 },
                { "type": "root", "duration": 1, "value": 1 }
            ]
        },
        {
            "name": "Elasticity / Superhuman Flexibility📏",
            "id": 92,
            "statusEffects": [
                { "type": "evasion_up", "duration": 3, "value": 20 },
                { "type": "physical_resistance", "duration": 3, "value": 15 }
            ]
        },
        {
            "name": "Wing Manifestation 🪽",
            "id": 102,
            "statusEffects": [
                { "type": "speed_up", "duration": 3, "value": 20 },
                { "type": "evasion_up", "duration": 3, "value": 15 }
            ]
        }
    ]
    seedPowersCollectionStatusEffect(powersToUpdate)

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