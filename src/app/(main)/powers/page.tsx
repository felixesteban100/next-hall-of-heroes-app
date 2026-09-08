import { PaginationPages } from "@/components/Pagination";
import PowerCard from "@/components/PowerCard";
import { collectionPowers } from "@/db/mongodb";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

    const powersPerPage = await collectionPowers.find({ name: { $regex: name, $options: "i" } }).skip((page - 1) * pageSize).limit(pageSize).sort({ [sortProperty]: sortOrientation === "asc" ? 1 : -1 }).toArray();
    const totalPowers = await collectionPowers.countDocuments({ name: { $regex: name, $options: "i" } });
    // const universes = await collectionUniverses.find({}).toArray();

    return (
        <div className="min-h-screen space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Powers</h1>
                <p className="text-muted-foreground font-light">
                    {totalPowers} powers across all universes
                </p>
            </div>
            {/* <FilterBar universes={JSON.parse(JSON.stringify(universes))} /> */}
            {/*  overflow-y-auto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {powersPerPage.map((power) => (
                    <Link key={power.id} href={`/powers/${power.id}`}>
                        <PowerCard power={power} size="default" />
                    </Link>
                ))}
            </div>

            <div className="flex justify-center mt-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalPowers / pageSize)} />
            </div>
        </div>
    )
}
