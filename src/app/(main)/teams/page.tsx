import { PaginationPages } from "@/components/Pagination";
import TeamCard from "@/components/TeamCard";
import { collectionTeams, collectionUniverses } from "@/db/mongodb";
import Link from "next/link";

export default async function page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined, page?: string, sort?: string, sortOrientation?: string }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;

    const sortProperty = params.sort?.toString() || "id";
    const sortOrientation = params.sortOrientation?.toString() || "desc";

    const name = params.name?.toString() || "";

    const teamsPerPage = await collectionTeams.find({ name: { $regex: name, $options: "i" } }).skip((page - 1) * pageSize).limit(pageSize).sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 }).toArray();
    const totalTeams = await collectionTeams.countDocuments({ name: { $regex: name, $options: "i" } });
    // const universes = await collectionUniverses.find({}).toArray();

    return (
        <div className="min-h-screen space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Teams</h1>
                <p className="text-muted-foreground font-light">
                    {totalTeams} teams across all universes
                </p>
            </div>
            {/* <FilterBar universes={JSON.parse(JSON.stringify(universes))} /> */}
            {/*  overflow-y-auto */}
            {/*  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {teamsPerPage.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                        <TeamCard team={team} size="default" />
                    </Link>
                ))}
            </div>

            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalTeams / pageSize)} />
            </div>
        </div>
    )
}
