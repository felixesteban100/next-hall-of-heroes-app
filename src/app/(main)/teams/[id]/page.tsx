import { collectionCharacters, collectionTeams, collectionUniverses } from "@/db/mongodb";
import Image from "next/image";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { Badge } from "@/components/ui/badge";
import { getCharacterAlignmentColor, getCharacterAlignmentText } from "@/lib/character_utils";
import { MapPin, Globe, Calendar, Award, Globe2, Gauge } from "lucide-react";
import { CharacterBadgeIcon } from "@/lib/characters_utils";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";
import { CharacterAccordionList } from "@/components/characters/CharacterAccordionList";
import { EntityMetadataGrid } from "@/components/shared/EntityMetadataGrid";
import { TeamHeroHeader } from "@/components/teams/TeamHeroHeader";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    "use cache"
    cacheLife("hours")

    const { id } = await params;
    const teamId = parseInt(id);

    const team = await collectionTeams.findOne({ id: teamId });

    if (team === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Team not found</h1>
            </div>
        );
    }

    // 1. Fetch Members
    const teamCharacters = await collectionCharacters
        .find({ "connections.groupAffiliation": { $in: [team.id] } })
        .sort({ name: 1 })
        .toArray();

    // 2. Fetch Universe
    const universe = await collectionUniverses.findOne({ id: team.universe })!

    // 3. Fetch Leaders (if leaders array exists)
    // 1. Separate numeric IDs from fallback strings
    const leaderIds = (team.leaders || [])
        .filter((id): id is number => typeof id === "number" || (!isNaN(Number(id)) && typeof id !== "string"));

    const stringLeaderNames = (team.leaders || []) as Array<number | string>;
    const externalLeaderNames = stringLeaderNames
        .filter((item): item is string => typeof item === "string" && isNaN(Number(item)));

    // 2. Fetch matched characters from DB
    const leaderCharacters = leaderIds.length > 0
        ? await collectionCharacters.find({ id: { $in: leaderIds } }).toArray()
        : [];

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
        ? await collectionTeams.find({ id: { $in: numericEnemyIds } }).toArray()
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
            <TeamHeroHeader team={{ ...team, universe: { id: universe!.id, name: universe!.name, logo: universe?.logo } }} />
            {/* <Suspense fallback={<>Loading team...</>}>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6">
                    <ViewTransition name={`team-${team.id}`} share="morph">
                        <div className="bg-muted/30 p-4 rounded-3xl border flex items-center justify-center shrink-0">
                            <Image
                                src={team.logo}
                                alt={team.name}
                                className="max-w-[20rem] max-h-[10rem] object-contain"
                                width={500}
                                height={300}
                                style={{ contain: "layout" }}
                            />
                        </div>
                    </ViewTransition>

                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold">{team.name}</h1>
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                                #{team.id}
                            </span>

                            {team.alignment && (
                                <Badge className={`${getCharacterAlignmentColor(team.alignment)} gap-1 capitalize text-xs`}>
                                    {CharacterBadgeIcon(team.alignment)} {getCharacterAlignmentText(team.alignment)}
                                </Badge>
                            )}

                            {team.status && (
                                <Badge variant="outline" className="capitalize text-xs">
                                    {team.status}
                                </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground text-sm font-normal">
                            {team.description || "No description available."}
                        </p>

                        <EntityMetadataGrid
                            items={[
                                {
                                    icon: Globe2,
                                    label: "Universe",
                                    value: universe?.name || "Unknown",
                                    href: `/universes/${team.universe}`,
                                },
                                {
                                    icon: MapPin,
                                    label: "Base of Operations",
                                    value: team.baseOfOperations || "Arkham Asylum / Gotham Underground",
                                },
                                {
                                    icon: Calendar,
                                    label: "Debut / First Appearance",
                                    value: team.firstAppearance || "Detective Comics #27 (May 1939)",
                                },
                                {
                                    icon: Gauge,
                                    label: "Avg Power Score",
                                    value: (
                                        <span>
                                            <strong className="text-secondary">52</strong>{" "}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                ({teamCharacters.length} members)
                                            </span>
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </Suspense> */}

            <div id="members" className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-light uppercase text-primary tracking-wider">
                        MEMBERS ({teamCharacters.length})
                    </p>
                </div>
                <CharacterAccordionList characters={teamCharacters} />
            </div>

            <div id="leaders" className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Team Leaders ({leaderCharacters.length + externalLeaderNames.length})
                </h3>
                <MiniEntityGrid
                    entityType="character"
                    showAlignment={true}
                    avatarShape="circle"
                    items={leaderCharacters.map((c) => ({
                        id: c.id,
                        name: c.name,
                        image: c.images?.md,
                        alignment: c.biography?.alignment,
                    }))}
                    externalNames={externalLeaderNames} // Renders missing characters as external badges
                    emptyMessage="No team leaders specified."
                />
            </div>

            <div id="enemies" className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-light uppercase text-primary tracking-wider">
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