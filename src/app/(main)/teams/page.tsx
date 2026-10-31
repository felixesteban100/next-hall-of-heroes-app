import { PaginationPages } from "@/components/filters/Pagination";
import { collectionTeams } from "@/db/mongodb";
import { sanitize } from "@/lib/utils";
import { SwipeGrid } from "@/components/shared/SwipeGrid";
import { EntityFilterBar } from "@/components/filters/EntityFilterBar";

export const instant = false;

export default async function TeamsPage({
    searchParams
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined,
        page?: string,
        sort?: string,
        sortOrientation?: string,
        name?: string,
        alignment?: string,
        status?: string,
        modes?: string,
    }>;
}) {
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = 12;
    const sortProperty = params.sort?.toString() || "id";
    const sortOrientation = params.sortOrientation?.toString() || "asc";

    const name = params.name?.toString() || "";
    const alignment = params.alignment?.toString() || "";
    const status = params.status?.toString() || "";
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

    if (alignment) query.alignment = alignment;
    if (status) query.status = status;

    const teamsPerPage = await collectionTeams.aggregate([
        { $match: query },
        { $sort: { [sortProperty]: sortOrientation === "desc" ? -1 : 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        // 🚀 Lookup/join the universes collection by matching universe id
        {
            $lookup: {
                from: "universes", // Make sure this matches your exact MongoDB universes collection name
                localField: "universe",
                foreignField: "id",
                as: "universeData"
            }
        },
        // Unwind the array to turn it into an object (or use preserveNullAndEmptyArrays if a team might lack a universe)
        {
            $unwind: {
                path: "$universeData",
                preserveNullAndEmptyArrays: true
            }
        }
    ]).toArray();

    const sanitizedTeams = sanitize(teamsPerPage);
    const totalTeams = await collectionTeams.countDocuments(query);
    const totalPages = Math.ceil(totalTeams / pageSize);

    // console.log((await collectionTeams.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))

    return (
        <div className="">
            <EntityFilterBar
                type="team"
                sortOptions={[
                    { value: "name", label: "Name" },
                    { value: "id", label: "Id" },
                ]}
            />

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