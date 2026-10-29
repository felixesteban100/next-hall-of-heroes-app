import { PaginationPages } from "@/components/filters/Pagination";
import { collectionPowers } from "@/db/mongodb";
import { Suspense } from "react";
import PowersFilterBar from "@/components/filters/PowersFilterBar"; // we'll create this
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
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
    const totalPages = Math.ceil(totalPowers / pageSize);

    /* const powersToUpdate: Parameters<typeof seedPowersCollectionActions>[0] = []
    seedPowersCollectionActions(powersToUpdate) */

    return (
        <div className="">
            <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense>

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