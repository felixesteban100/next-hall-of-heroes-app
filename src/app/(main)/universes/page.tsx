import { PaginationPages } from "@/components/filters/Pagination";
import UniverseCard from "@/components/universes/UniverseCard";
import { collectionUniverses } from "@/db/mongodb";
import Link from "next/link";
import { Suspense } from "react";
import SimpleFilterBar from "@/components/filters/SimpleFilterBar";
import { BrushCleaning } from "lucide-react";
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";

export const instant = false;

const sortOptions = [
    { value: "name", label: "Name" },
    { value: "id", label: "Id" },
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

    const universesPerPage = await collectionUniverses
        .find(query)
        .sort({ [sortProperty]: sortOrientation === "asc" ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

    const totalUniverses = await collectionUniverses.countDocuments(query);

    // console.log((await collectionUniverses.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))

    return (
        <div className="min-h-screen space-y-4 mt-4">
            <div>
                <h1 className="text-2xl font-bold">Universes</h1>
                <p className="text-muted-foreground font-light">
                    {totalUniverses} universes
                </p>
            </div>
            <Suspense fallback={<FilterBarSkeleton />}  >
                <SimpleFilterBar
                    placeholder="Search universes..."
                    sortOptions={sortOptions}
                />
            </Suspense>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {universesPerPage.map((universe) => (
                    <Link key={universe.id} href={`/universes/${universe.id}`}>
                        <UniverseCard universe={universe} size="default" />
                    </Link>
                ))}
                {universesPerPage.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                        <BrushCleaning />
                        <p className="font-medium">No universes found.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalUniverses / pageSize)} />
            </div>
        </div>
    )
}