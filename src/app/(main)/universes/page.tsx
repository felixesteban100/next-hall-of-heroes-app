import { PaginationPages } from "@/components/Pagination";
// import TeamCard from "@/components/TeamCard";
import UniverseCard from "@/components/UniverseCard";
import { collectionUniverses } from "@/db/mongodb";
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

    const universesPerPage = await collectionUniverses.find({ name: { $regex: name, $options: "i" } }).skip((page - 1) * pageSize).limit(pageSize).sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 }).toArray();
    const totalUniverses = await collectionUniverses.countDocuments({ name: { $regex: name, $options: "i" } });
    // const universes = await collectionUniverses.find({}).toArray();

    return (
        <div className="min-h-screen space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Universes</h1>
                <p className="text-muted-foreground font-light">
                    {totalUniverses} universes across all universes
                </p>
            </div>
            {/* <FilterBar universes={JSON.parse(JSON.stringify(universes))} /> */}
            {/*  overflow-y-auto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {universesPerPage.map((universe) => (
                    <Link key={universe.id} href={`/universes/${universe.id}`}>
                        <UniverseCard universe={universe} size="default" />
                    </Link>
                ))}
            </div>

            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalUniverses / pageSize)} />
            </div>
        </div>
    )
}
