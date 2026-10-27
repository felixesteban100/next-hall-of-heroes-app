import { PaginationPages } from "@/components/filters/Pagination";
import { collectionPowers } from "@/db/mongodb";
import { Suspense } from "react";
import PowersFilterBar from "@/components/filters/PowersFilterBar"; // we'll create this
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import { sanitize } from "@/lib/utils";
import { seedPowersCollectionActions, seedPowersCollectionCombatRole } from "@/db/seeds";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import PowerCard from "@/components/powers/PowerCard";

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
        <div className="space-y-2 mt-4">
            <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
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
            </div> */}
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