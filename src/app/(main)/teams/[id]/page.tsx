import { collectionCharacters, collectionTeams, collectionUniverses } from "@/db/mongodb";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";
import { CharacterAccordionList } from "@/components/characters/CharacterAccordionList";
import { TeamHeroHeader } from "@/components/teams/TeamHeroHeader";
import { Filter } from "mongodb";
import { Character } from "@/types";
import { LoadingLink } from "@/components/shared/LoadingLink";
import CompareWithButton from "@/components/shared/CompareWithButton";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    /* "use cache"
    cacheLife("hours") */

    const { id } = await params;
    const teamId = parseInt(id);

    const team = await collectionTeams.findOne({ id: teamId });

    if (team === null) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center">
                <h1 className="text-2xl font-bold">Team not found</h1>
            </div>
        );
    }

    // 1. Fetch Members
    const teamCharacters = await collectionCharacters
        .find({
            $or: [
                { "connections.groupAffiliation": { $in: [team.id] } },
                { "connections.groupAffiliation": team.name }
            ]
        })
        .sort({ name: 1 })
        .toArray();

    // 2. Fetch Universe
    const universe = await collectionUniverses.findOne({ id: team.universe })!

    const rawLeaders = (team.leaders || []) as Array<number | string>;

    const leaderIds: number[] = [];
    const leaderStringTerms: string[] = [];

    // a. Separate numeric IDs from string search terms
    for (const item of rawLeaders) {
        if (typeof item === "number") {
            leaderIds.push(item);
        } else if (typeof item === "string" && item.trim() !== "") {
            const parsedNum = Number(item);
            if (!isNaN(parsedNum)) {
                leaderIds.push(parsedNum);
            } else {
                leaderStringTerms.push(item);
            }
        }
    }

    // b. Construct type-safe $or query
    const orConditions: Filter<Character>[] = [];

    if (leaderIds.length > 0) {
        orConditions.push({ id: { $in: leaderIds } });
    }
    if (leaderStringTerms.length > 0) {
        orConditions.push({ name: { $in: leaderStringTerms } });
        orConditions.push({ "biography.fullName": { $in: leaderStringTerms } });
    }

    // c. Execute Query
    const filter: Filter<Character> = {
        ...(orConditions.length > 0 ? { $or: orConditions } : {}),
        ...(universe?.name ? { "biography.publisher": universe.name } : {}),
    };

    const dbLeaderCharacters = orConditions.length > 0
        ? await collectionCharacters.find(filter).sort({ name: 1 }).toArray()
        : [];

    // d. Identify remaining string leaders that were NOT found in DB
    const matchedNames = new Set([
        ...dbLeaderCharacters.map((c) => c.name.toLowerCase()),
        ...dbLeaderCharacters
            .map((c) => c.biography?.fullName?.toLowerCase())
            .filter((name): name is string => Boolean(name)),
    ]);

    const externalLeaders = leaderStringTerms
        .filter((term) => !matchedNames.has(term.toLowerCase()))
        .map((name) => ({ name, isFallback: true as const }));

    // 4. Fetch Enemy Teams (if enemyTeamIds array exists)
    // Separate numeric DB IDs from string-only external factions
    const enemyTeamIds = (team.enemyTeamIds ?? []) as Array<number | string>;

    const numericEnemyIds = enemyTeamIds
        .filter((id): id is number => typeof id === "number" || !isNaN(Number(id)))
        .map(Number);

    const stringEnemyNames = enemyTeamIds
        .filter((id): id is string => typeof id === "string" && isNaN(Number(id)));

    // Fetch DB enemy teams
    const enemyTeams = numericEnemyIds.length > 0
        ? await collectionTeams.find({ id: { $in: numericEnemyIds }, universe: universe?.id }).toArray()
        : [];

    // 5. Compute Average Powerstats via MongoDB Aggregation
    const statsResult = await collectionCharacters.aggregate([
        { $match: { "connections.groupAffiliation": { $in: [teamId] } } },
        {
            $group: {
                _id: null,
                avgTotal: { $avg: "$powerstats.total" },
                avgCombat: { $avg: "$powerstats.combat" },
                avgStrength: { $avg: "$powerstats.strength" },
                memberCount: { $sum: 1 }
            }
        }
    ]).toArray();

    const stats = statsResult[0] || { avgTotal: 0, avgCombat: 0, avgStrength: 0, memberCount: 0 };

    return (
        <div className="mx-auto pb-8 max-w-[90vw] space-y-6 mt-4">
            <TeamHeroHeader
                team={{
                    ...team,
                    universe: { id: universe!.id, name: universe!.name, logo: universe?.logo },
                    avgPowerScore: stats.avgTotal,
                    membersCount: teamCharacters.length
                }}
            />

            <div id="members" className="space-y-3">
                <div className="flex items-center justify-between">
                    <LoadingLink href={`/characters?universe=${universe?.value}&team=${team.id}`} className="text-sm font-medium uppercase text-primary tracking-wider hover:underline">
                        MEMBERS ({teamCharacters.length})
                    </LoadingLink>
                    <CompareWithButton mode="team" ids={teamCharacters.map(c => c.id)} />
                </div>
                <CharacterAccordionList characters={teamCharacters} />
            </div>

            <div id="leaders" className="space-y-3">
                <h3 className="text-sm font-medium uppercase tracking-wider text-primary">
                    Team Leaders ({dbLeaderCharacters.length + externalLeaders.length})
                </h3>
                <MiniEntityGrid
                    entityType="character"
                    showAlignment={true}
                    avatarShape="circle"
                    items={dbLeaderCharacters.map((c) => ({
                        id: c.id,
                        name: c.name,
                        image: c.images?.md,
                        alignment: c.biography?.alignment,
                    }))}
                    externalNames={externalLeaders.map(c => c.name)} // Renders missing characters as external badges
                    emptyMessage="No team leaders specified."
                />
            </div>

            <div id="enemies" className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase text-primary tracking-wider">
                        ENEMIES ({team.enemyTeamIds?.length})
                    </p>
                </div>
                {/* Enemy / Rival Factions Section */}
                {((enemyTeams.length > 0) || stringEnemyNames.length > 0) && (
                    <MiniEntityGrid
                        items={enemyTeams}
                        externalNames={stringEnemyNames}
                        entityType="team"
                        showAlignment
                    />
                )}
            </div>
        </div>
    );
}