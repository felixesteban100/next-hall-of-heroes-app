import { PaginationPages } from "@/components/Pagination";
import PowerCard from "@/components/PowerCard";
import { collectionPowers } from "@/db/mongodb";
import Link from "next/link";
import { Suspense } from "react";
import PowersFilterBar from "@/components/PowersFilterBar"; // we'll create this
import { FilterBarSkeleton } from "@/components/FilterBarSkeleton";

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

    const sortProperty = params.sort?.toString() || "score";  // default to score not id
    const sortOrientation = params.sortOrientation?.toString() || "desc";
    const name = params.name?.toString() || "";
    const tier = parseInt(params.tier?.toString() || "");

    const query: Record<string, string | number | object> = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (!Number.isNaN(tier)) query.tier = tier;

    const powersPerPage = await collectionPowers
        .find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 })
        .toArray();

    const totalPowers = await collectionPowers.countDocuments(query);

    return (
        <div className="min-h-screen space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Powers</h1>
                <p className="text-muted-foreground font-light">
                    {totalPowers} powers across all universes
                </p>
            </div>

            <Suspense fallback={<FilterBarSkeleton />} >
                <PowersFilterBar />
            </Suspense>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {powersPerPage.map((power) => (
                    <Link key={power.id} href={`/powers/${power.id}`}>
                        <PowerCard power={power} size="default" />
                    </Link>
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