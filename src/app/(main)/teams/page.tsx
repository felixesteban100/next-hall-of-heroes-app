import { PaginationPages } from "@/components/Pagination";
import TeamCard from "@/components/TeamCard";
import { collectionTeams } from "@/db/mongodb";
import Link from "next/link";
import { Suspense } from "react";
import SimpleFilterBar from "@/components/SimpleFilterBar";
import { BrushCleaning } from "lucide-react";
import { FilterBarSkeleton } from "@/components/FilterBarSkeleton";

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
    const sortProperty = params.sort?.toString() || "name";
    const sortOrientation = params.sortOrientation?.toString() || "asc";
    const name = params.name?.toString() || "";

    const query = name ? { name: { $regex: name, $options: "i" } } : {};

    const teamsPerPage = await collectionTeams
        .find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 })
        .toArray();

    const totalTeams = await collectionTeams.countDocuments(query);

    return (
        <div className="min-h-screen space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Teams</h1>
                <p className="text-muted-foreground font-light">
                    {totalTeams} teams across all universes
                </p>
            </div>
            <Suspense fallback={<FilterBarSkeleton />}>
                <SimpleFilterBar
                    placeholder="Search teams..."
                    sortOptions={sortOptions}
                />
            </Suspense>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {teamsPerPage.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                        <TeamCard team={team} size="default" />
                    </Link>
                ))}
                {teamsPerPage.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                        <BrushCleaning />
                        <p className="font-medium">No teams found.</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalTeams / pageSize)} />
            </div>
        </div>
    )
}