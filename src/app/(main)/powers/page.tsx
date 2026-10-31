import { PaginationPages } from "@/components/filters/Pagination";
import { collectionPowers } from "@/db/mongodb";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import { seedPowersCollectionActions, seedPowersCollectionCombatRole } from "@/db/seeds";
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

    const sortProperty = params.sort?.toString() || "score"; // 🚀 Default to score
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

    /* const powersToUpdate: Parameters<typeof seedPowersCollectionActions>[0] = []
    seedPowersCollectionActions(powersToUpdate) */

    return (
        <div className="">
            {/* <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense> */}
            <EntityFilterBar
                type="power"
                sortOptions={[
                    { value: "score", label: "Score" },
                    { value: "name", label: "Name" },
                    { value: "id", label: "Id" },
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