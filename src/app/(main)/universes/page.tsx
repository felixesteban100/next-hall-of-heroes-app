import { PaginationPages } from "@/components/filters/Pagination";
import { collectionUniverses } from "@/db/mongodb";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import { EntityFilterBar } from "@/components/filters/EntityFilterBar";

export const instant = false;

export default async function UniversePage({
    searchParams
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined,
        page?: string,
        sort?: string,
        sortOrientation?: string,
        name?: string,
        type?: string,
        modes?: string,
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;
    const sortProperty = params.sort?.toString() || "id";
    const sortOrientation = params.sortOrientation?.toString() || "desc";

    const name = params.name?.toString() || "";
    const universeType = params.type?.toString() || "";
    const modesParam = params.modes?.toString() || "";
    const modes = modesParam ? modesParam.split(",") : [];

    const query: Record<string, any> = {};

    if (name) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let regexPattern = escaped;

        const hasStarts = modes.includes("startsWith");
        const hasEnds = modes.includes("endsWith");
        const hasExact = modes.includes("exact");

        if (hasExact || (hasStarts && hasEnds)) {
            regexPattern = `^${escaped}$`;
        } else if (hasStarts) {
            regexPattern = `^${escaped}`;
        } else if (hasEnds) {
            regexPattern = `${escaped}$`;
        }

        const nameRegex = { $regex: regexPattern, $options: "i" };
        query.$or = [{ name: nameRegex }, { description: nameRegex }];
    }

    if (universeType) query.type = universeType;

    const universesPerPage = await collectionUniverses
        .find(query)
        .sort({ [sortProperty]: sortOrientation === "desc" ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

    const sanitizedUniverses = sanitize(universesPerPage);

    const totalUniverses = await collectionUniverses.countDocuments(query);
    const totalPages = Math.ceil(totalUniverses / pageSize);
    // console.log((await collectionUniverses.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))

    return (
        <div className="">
            {/* <Suspense fallback={<FilterBarSkeleton />}  >
                <SimpleFilterBar
                    placeholder="Search universes..."
                    sortOptions={sortOptions}
                />
            </Suspense> */}
            <EntityFilterBar
                type="universe"
                sortOptions={[
                    { value: "id", label: "Id" },
                    { value: "name", label: "Name" },
                ]}
            />

            <SwipeGrid
                items={sanitizedUniverses}
                currentPage={page}
                totalPages={totalPages}
                type={"universe"}
                emptyMessage="No universes found."
            />
            <div className="hidden sm:flex justify-center pb-4">
                <PaginationPages currentPage={page} totalPages={Math.ceil(totalUniverses / pageSize)} />
            </div>
        </div>
    )
}