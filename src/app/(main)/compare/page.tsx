import Image from "next/image";
import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/SelectorCard";
import { StatBar } from "@/components/compare/StatBar";
import { PillList } from "@/components/compare/PillList";
import { collectionCharacters } from "@/db/mongodb";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ViewTransition } from "react";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { LoadingLink } from "@/components/shared/LoadingLink";

export const instant = false;

type SearchParamsPromise = Promise<{
    id1: string;
    id2: string;
}>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;
    const entityAIdValue = params.id1 ? parseInt(params.id1) : 70;
    const entityBIdValue = params.id2 ? parseInt(params.id2) : 777;

    const [[entityA], [entityB]] = await Promise.all([
        collectionCharacters
            .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                joinTeam_universe_power_enemies_toCharacter({ id: entityAIdValue }, "id", "desc", 0, 1, { includeEnemies: true })
            )
            .toArray(),
        collectionCharacters
            .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                joinTeam_universe_power_enemies_toCharacter({ id: entityBIdValue }, "id", "desc", 0, 1, { includeEnemies: true })
            )
            .toArray(),
    ]);

    // Helper to extract team names from groupAffiliation array
    const getTeamNames = (teams: any) => {
        if (!teams || !Array.isArray(teams)) return [];
        return teams.map((t) => (typeof t === "string" ? t : t.name || t.value));
    };

    // Helper to extract enemy names from enemies array
    const getEnemyNames = (enemies: any) => {
        if (!enemies || !Array.isArray(enemies)) return [];
        return enemies.map((e) => (typeof e === "string" ? e : e.name));
    };

    // Helper to extract power names from powers array
    const getPowerNames = (powers: any) => {
        if (!powers || !Array.isArray(powers)) return [];
        return powers.map((p) => (typeof p === "string" ? p : p.name || p.value));
    };

    // Helper to safely get publisher string
    const getPublisher = (pub: any) => {
        if (!pub) return "N/A";
        if (typeof pub === "string") return pub;
        return pub.name || pub.value || "N/A";
    };

    if (!entityA || !entityB) {
        return (
            <div className="max-w-5xl mx-auto mt-10 p-4 bg-card border border-muted-foreground/20 rounded-xl text-center">
                <h2 className="text-lg font-bold text-foreground mb-2">Character Not Found</h2>
                <p className="text-muted-foreground">One or both of the characters you are trying to compare could not be found.</p>
            </div>
        );
    }

    const TierIconA = CHARACTER_TIER_ICON[entityA.tier as keyof typeof CHARACTER_TIER_ICON];
    const TierIconB = CHARACTER_TIER_ICON[entityB.tier as keyof typeof CHARACTER_TIER_ICON];

    const ClassIconA = CHARACTER_CLASS_ICON[entityA.class as keyof typeof CHARACTER_CLASS_ICON];
    const ClassIconB = CHARACTER_CLASS_ICON[entityB.class as keyof typeof CHARACTER_CLASS_ICON];

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />

            {/* <Suspense fallback={<div className="text-center text-muted-foreground">Loading comparison...</div>}> */}
            {/* Selector Section */}
            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-10 overflow-visible">
                <SelectorCard
                    key={entityA.id}
                    title="Entity A"
                    selected={entityA}
                    otherSelectedId={entityBIdValue}
                    paramKey="id1"
                    variant="primary"
                />

                <div className="flex justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-background font-black text-xl ">
                        VS
                    </div>
                </div>

                <SelectorCard
                    key={entityB.id}
                    title="Entity B"
                    selected={entityB}
                    otherSelectedId={entityAIdValue}
                    paramKey="id2"
                    variant="secondary"
                />
            </section>

            <main className="max-w-5xl mx-auto bg-card border border-muted-foreground/20 rounded-xl max-h-[80vh] overflow-y-auto relative mb-2">
                {/* Entity Profile Header with Avatar Images */} {/* Sticky Banner Row */}
                <div className="sticky top-0 z-20 grid grid-cols-[120px_1fr_1fr] sm:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold transition-all">
                    <div className="p-4 text-foreground text-sm uppercase tracking-wider flex items-center justify-center">
                        Entity Profile
                    </div>

                    <div className="p-4 border-l border-muted-foreground/20 flex flex-col items-center gap-2">
                        <ViewTransition name={`character-${entityA.id}`}>
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-primary shadow-md bg-card">
                                <Image
                                    src={entityA.images?.md}
                                    alt={entityA.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </ViewTransition>
                        <span className="text-primary text-base sm:text-lg">{entityA.name}</span>
                        <span className="text-xs text-muted-foreground italic">
                            {entityA.biography?.fullName || "N/A"}
                        </span>
                        <LoadingLink href={`/characters/${entityA.id}`} className="mt-1">
                            <span className="text-xs text-muted-foreground underline hover:text-primary transition-colors">
                                View Profile
                            </span>
                        </LoadingLink>
                    </div>

                    <div className="p-4 border-l border-muted-foreground/20 flex flex-col items-center gap-2">
                        <ViewTransition name={`character-${entityB.id}`}>
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-secondary shadow-md bg-card">
                                <Image
                                    src={entityB.images?.md}
                                    alt={entityB.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </ViewTransition>

                        <span className="text-secondary text-base sm:text-lg">{entityB.name}</span>
                        <span className="text-xs text-muted-foreground italic">
                            {entityB.biography?.fullName || "N/A"}
                        </span>
                        <LoadingLink href={`/characters/${entityB.id}`} className="mt-1">
                            <span className="text-xs text-muted-foreground underline hover:text-primary transition-colors">
                                View Profile
                            </span>
                        </LoadingLink>
                    </div>
                </div>

                {/* SECTION: GENERAL & BIOGRAPHY */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    General Information
                </div>

                <Row label="Publisher">
                    <Cell>
                        <div className="flex flex-col justify-center items-center gap-1">
                            <Image
                                src={entityA.biography?.publisher?.logo || "/placeholder.png"}
                                alt={entityA.biography?.publisher?.name}
                                width={500}
                                height={500}
                                className="h-20 w-auto object-contain"
                            />
                            <span className="text-sm font-medium">{getPublisher(entityA.biography?.publisher.name)}</span>
                        </div>
                    </Cell>
                    <Cell>
                        <div className="flex flex-col justify-center items-center gap-1">
                            <Image
                                src={entityB.biography?.publisher?.logo || "/placeholder.png"}
                                alt={entityB.biography?.publisher?.name}
                                width={500}
                                height={500}
                                className="h-20 w-auto object-contain"
                            />
                            <span className="text-sm font-medium">{getPublisher(entityB.biography?.publisher.name)}</span>
                        </div>
                    </Cell>
                </Row>

                <Row label="Tier">
                    <Cell className={`${CHARACTER_TIER_COLOR[entityA.tier as keyof typeof CHARACTER_TIER_COLOR].text} font-bold flex gap-2 items-center justify-center`}>
                        <TierIconA />
                        {CHARACTER_TIER[entityA.tier as keyof typeof CHARACTER_TIER] || "N/A"}
                    </Cell>
                    <Cell className={`${CHARACTER_TIER_COLOR[entityB.tier as keyof typeof CHARACTER_TIER_COLOR].text} font-bold flex gap-2 items-center justify-center`}>
                        <TierIconB />
                        {CHARACTER_TIER[entityB.tier as keyof typeof CHARACTER_TIER] || "N/A"}
                    </Cell>
                </Row>

                <Row label="Class">
                    <Cell className={`${CHARACTER_CLASS_COLOR[entityA.class as keyof typeof CHARACTER_CLASS_COLOR].text} font-bold flex gap-2 items-center justify-center`}>
                        <ClassIconA />
                        {CHARACTER_CLASS[entityA.class as keyof typeof CHARACTER_CLASS] || "N/A"}
                    </Cell>
                    <Cell className={`${CHARACTER_CLASS_COLOR[entityB.class as keyof typeof CHARACTER_CLASS_COLOR].text} font-bold flex gap-2 items-center justify-center`}>
                        <ClassIconB />
                        {CHARACTER_CLASS[entityB.class as keyof typeof CHARACTER_CLASS] || "N/A"}
                    </Cell>
                </Row>

                <Row label="Alignment">
                    <Cell className={(entityA.biography?.alignment) === "good" ? "text-green-400 font-bold capitalize" : (entityA.biography?.alignment) === "neutral" ? "text-yellow-400 font-bold capitalize" : "text-red-400 font-bold capitalize"}>
                        {entityA.biography?.alignment || "N/A"}
                    </Cell>
                    <Cell className={(entityB.biography?.alignment) === "good" ? "text-green-400 font-bold capitalize" : (entityB.biography?.alignment) === "neutral" ? "text-yellow-400 font-bold capitalize" : "text-red-400 font-bold capitalize"}>
                        {entityB.biography?.alignment || "N/A"}
                    </Cell>
                </Row>

                <Row label="Tier / Class">
                    <Cell>Tier {entityA.tier ?? "N/A"} / Class {entityA.class ?? "N/A"}</Cell>
                    <Cell>Tier {entityB.tier ?? "N/A"} / Class {entityB.class ?? "N/A"}</Cell>
                </Row>

                <Row label="First Appearance">
                    <Cell>{entityA.biography?.firstAppearance || "N/A"}</Cell>
                    <Cell>{entityB.biography?.firstAppearance || "N/A"}</Cell>
                </Row>

                <Row label="Place of Birth">
                    <Cell>{entityA.biography?.placeOfBirth || "N/A"}</Cell>
                    <Cell>{entityB.biography?.placeOfBirth || "N/A"}</Cell>
                </Row>

                {/* SECTION: POWERSTATS */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Combat & Powerstats
                </div>

                {["intelligence", "strength", "speed", "durability", "power", "combat", "total"].map((statKey) => {
                    const valA = entityA.powerstats?.[statKey as keyof typeof entityA.powerstats] ?? 0;
                    const valB = entityB.powerstats?.[statKey as keyof typeof entityB.powerstats] ?? 0;

                    return (
                        <Row key={statKey} label={statKey.toUpperCase()}>
                            <Cell>
                                <StatBar value={valA} colorClass="bg-primary" />
                            </Cell>
                            <Cell>
                                <StatBar value={valB} colorClass="bg-secondary" />
                            </Cell>
                        </Row>
                    );
                })}

                {/* SECTION: PHYSICAL APPEARANCE */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Physical Characteristics
                </div>

                <Row label="Race">
                    <Cell>{entityA.appearance?.race || "N/A"}</Cell>
                    <Cell>{entityB.appearance?.race || "N/A"}</Cell>
                </Row>

                <Row label="Gender">
                    <Cell>{entityA.appearance?.gender || "N/A"}</Cell>
                    <Cell>{entityB.appearance?.gender || "N/A"}</Cell>
                </Row>

                <Row label="Height">
                    <Cell>{entityA.appearance?.height?.join(" / ") || "N/A"}</Cell>
                    <Cell>{entityB.appearance?.height?.join(" / ") || "N/A"}</Cell>
                </Row>

                <Row label="Weight">
                    <Cell>{entityA.appearance?.weight?.join(" / ") || "N/A"}</Cell>
                    <Cell>{entityB.appearance?.weight?.join(" / ") || "N/A"}</Cell>
                </Row>

                <Row label="Eyes / Hair">
                    <Cell>{entityA.appearance?.eyeColor || "N/A"} / {entityA.appearance?.hairColor || "N/A"}</Cell>
                    <Cell>{entityB.appearance?.eyeColor || "N/A"} / {entityB.appearance?.hairColor || "N/A"}</Cell>
                </Row>

                {/* SECTION: WORK & BASE */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Work & Operations
                </div>

                <Row label="Occupation">
                    <Cell>{entityA.work?.occupation || "N/A"}</Cell>
                    <Cell>{entityB.work?.occupation || "N/A"}</Cell>
                </Row>

                <Row label="Base of Operations">
                    <Cell>{entityA.work?.base || "N/A"}</Cell>
                    <Cell>{entityB.work?.base || "N/A"}</Cell>
                </Row>

                {/* SECTION: ABILITIES, TEAMS & ENEMIES */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Powers & Connections
                </div>

                <Row label="Special Powers">
                    <Cell>
                        <PillList items={getPowerNames(entityA.powers)} variant="primary" />
                    </Cell>
                    <Cell>
                        <PillList items={getPowerNames(entityB.powers)} variant="secondary" />
                    </Cell>
                </Row>

                <Row label="Weaknesses">
                    <Cell>
                        <PillList items={entityA.weaknesses || []} variant="primary" />
                    </Cell>
                    <Cell>
                        <PillList items={entityB.weaknesses || []} variant="secondary" />
                    </Cell>
                </Row>

                <Row label="Teams & Affiliations">
                    <Cell>
                        <PillList items={getTeamNames(entityA.connections?.groupAffiliation)} variant="primary" />
                    </Cell>
                    <Cell>
                        <PillList items={getTeamNames(entityB.connections?.groupAffiliation)} variant="secondary" />
                    </Cell>
                </Row>

                <Row label="Primary Enemies">
                    <Cell>
                        <PillList items={getEnemyNames(entityA.connections?.enemies)} variant="primary" />
                    </Cell>
                    <Cell>
                        <PillList items={getEnemyNames(entityB.connections?.enemies)} variant="secondary" />
                    </Cell>
                </Row>
            </main>
            {/* </Suspense> */}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[120px_1fr_1fr] sm:grid-cols-[200px_1fr_1fr] border-b border-muted-foreground/20 last:border-b-0 hover:bg-muted-foreground/10 transition-colors">
            <div className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                {label}
            </div>
            {children}
        </div>
    );
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`p-3 sm:p-4 text-center border-r border-muted-foreground/20 last:border-r-0 flex items-center justify-center text-sm sm:text-base ${className}`}>
            {children}
        </div>
    );
}