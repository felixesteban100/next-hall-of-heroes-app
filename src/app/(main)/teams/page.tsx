import { PaginationPages } from "@/components/filters/Pagination";
import { collectionTeams } from "@/db/mongodb";
import { Suspense } from "react";
import SimpleFilterBar from "@/components/filters/SimpleFilterBar";
import { BrushCleaning } from "lucide-react";
import { FilterBarSkeleton } from "@/components/filters/FilterBarSkeleton";
import TeamCard from "@/components/teams/TeamCard";
import { LoadingLink } from "@/components/shared/LoadingLink";

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

    const totalTeams = await collectionTeams.countDocuments(query);

    // console.log((await collectionTeams.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))

    return (
        <div className="min-h-screen space-y-4 mt-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
                {teamsPerPage.map((team) => (
                    <LoadingLink key={team.id} href={`/teams/${team.id}`}>
                        <TeamCard team={team} size="default" />
                    </LoadingLink>
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