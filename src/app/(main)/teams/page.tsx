import { PaginationPages } from "@/components/filters/Pagination";
import { collectionTeams } from "@/db/mongodb";
import { Suspense } from "react";
import SimpleFilterBar from "@/components/filters/SimpleFilterBar";
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";

export const instant = false;

const sortOptions = [
    { value: "id", label: "Id" },
    { value: "name", label: "Name" },
];

export default async function page({
    searchParams
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined,
        page?: string, sort?: string,
        sortOrientation?: string, name?: string
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;
    const sortProperty = params.sort?.toString() || "id";
    const sortOrientation = params.sortOrientation?.toString() || "asc";
    const name = params.name?.toString() || "";

    const query = name ? { name: { $regex: name, $options: "i" } } : {};

    const teamsPerPage = await collectionTeams
        .find(query)
        .sort({ [sortProperty]: sortOrientation === "desc" ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

    const sanitizedTeams = sanitize(teamsPerPage);
    const totalTeams = await collectionTeams.countDocuments(query);
    const totalPages = Math.ceil(totalTeams / pageSize);

    // console.log((await collectionTeams.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))

    return (
        <div className="">
            <Suspense fallback={<FilterBarSkeleton />}>
                <SimpleFilterBar
                    placeholder="Search teams..."
                    sortOptions={sortOptions}
                />
            </Suspense>
            <SwipeGrid
                items={sanitizedTeams}
                currentPage={page}
                totalPages={totalPages}
                type={"team"}
                emptyMessage="No teams found."
            />
            <div className="hidden sm:flex justify-center pb-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalTeams / pageSize)} />
            </div>
        </div>
    )
}