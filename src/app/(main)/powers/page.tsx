import { PaginationPages } from "@/components/filters/Pagination";
import PowerCard from "@/components/powers/PowerCard";
import { collectionPowers } from "@/db/mongodb";
import { Suspense } from "react";
import PowersFilterBar from "@/components/filters/PowersFilterBar"; // we'll create this
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import { LoadingLink } from "@/components/shared/LoadingLink";

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
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;

    const sortProperty = params.sort?.toString() || "id";  // default to score not id
    const sortOrientation = params.sortOrientation?.toString() || "asc";
    const name = params.name?.toString() || "";
    const tier = parseInt(params.tier?.toString() || "");

    const query: Record<string, string | number | object> = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (!Number.isNaN(tier)) query.tier = tier;

    const powersPerPage = await collectionPowers
        .find(query)
        .sort({ [sortProperty]: sortOrientation === "desc" ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

    const totalPowers = await collectionPowers.countDocuments(query);

    // console.log((await collectionPowers.find({}).toArray()).map(c => ({ value: c.value, name: c.name, id: c.id })))

    return (
        <div className="min-h-screen space-y-4 mt-4">
            <div>
                <h1 className="text-2xl font-bold">Powers</h1>
                <p className="text-muted-foreground font-light">
                    {totalPowers} powers across all universes
                </p>
            </div>

            <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
                {powersPerPage.map((power) => (
                    <LoadingLink key={power.id} href={`/powers/${power.id}`}>
                        <PowerCard power={power} size="default" />
                    </LoadingLink>
                ))}
                {powersPerPage.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        No powers found.
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalPowers / pageSize)} />
            </div>
        </div>
    )
}