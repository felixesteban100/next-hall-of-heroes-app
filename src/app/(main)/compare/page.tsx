import Image from "next/image";
import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { SelectorCard } from "@/components/compare/SelectorCard";
import { PillList } from "@/components/compare/PillList";
import { collectionCharacters } from "@/db/mongodb";
import { joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { ViewTransition } from "react";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { Progress } from "@/components/ui/progress";
import { MatchVerdict } from "@/components/compare/MatchVerditct";
import { computeMatchScore, hasNemesisLink, radarData } from "@/lib/compare_utls";
import { StatsRadar } from "@/components/compare/StatRadar";
import { SparPanel } from "@/components/compare/StarPanel";

export const instant = false;

type SearchParamsPromise = Promise<{
    id1: string;
    id2: string;
}>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const params = await searchParams;

    const entityAIdValue = params.id1 ? Number.parseInt(params.id1, 10) : null;
    const entityBIdValue = params.id2 ? Number.parseInt(params.id2, 10) : null;

    const hasA = entityAIdValue != null && !Number.isNaN(entityAIdValue);
    const hasB = entityBIdValue != null && !Number.isNaN(entityBIdValue);

    const [entityA, entityB] = await Promise.all([
        hasA
            ? collectionCharacters
                .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                    joinTeam_universe_power_enemies_toCharacter(
                        { id: entityAIdValue! },
                        "id",
                        "desc",
                        0,
                        1,
                        { includeEnemies: true }
                    )
                )
                .toArray()
                .then((rows) => rows[0] ?? null)
            : Promise.resolve(null),
        hasB
            ? collectionCharacters
                .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
                    joinTeam_universe_power_enemies_toCharacter(
                        { id: entityBIdValue! },
                        "id",
                        "desc",
                        0,
                        1,
                        { includeEnemies: true }
                    )
                )
                .toArray()
                .then((rows) => rows[0] ?? null)
            : Promise.resolve(null),
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

    const TierIconA = entityA
        ? CHARACTER_TIER_ICON[entityA.tier as keyof typeof CHARACTER_TIER_ICON]
        : null;
    const TierIconB = entityB
        ? CHARACTER_TIER_ICON[entityB.tier as keyof typeof CHARACTER_TIER_ICON]
        : null;

    const ClassIconA = entityA ? CHARACTER_CLASS_ICON[entityA.class as keyof typeof CHARACTER_CLASS_ICON] : null;
    const ClassIconB = entityB ? CHARACTER_CLASS_ICON[entityB.class as keyof typeof CHARACTER_CLASS_ICON] : null;

    // after entityA / entityB resolved:
    const scoreA = computeMatchScore(entityA);
    const scoreB = computeMatchScore(entityB);
    const isNemesis =
        !!entityA && !!entityB && hasNemesisLink(entityA, entityB);
    const radar = radarData(entityA, entityB);

    return (
        <div className="space-y-4 mt-4">
            <ComparisonHeader />

            {/* <Suspense fallback={<div className="text-center text-muted-foreground">Loading comparison...</div>}> */}
            {/* Selector Section */}
            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-4 overflow-visible">
                <SelectorCard
                    key={entityA?.id ?? "empty-a"}
                    title="Character A"
                    selected={entityA}
                    otherSelectedId={entityBIdValue ?? undefined}
                    paramKey="id1"
                    variant="primary"
                />
                <div className="flex justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-background font-black text-xl">
                        VS
                    </div>
                </div>
                <SelectorCard
                    key={entityB?.id ?? "empty-b"}
                    title="Character B"
                    selected={entityB}
                    otherSelectedId={entityAIdValue ?? undefined}
                    paramKey="id2"
                    variant="secondary"
                />
            </section>

            <div className="max-w-5xl mx-auto space-y-4 mb-4">
                <MatchVerdict
                    nameA={entityA?.name}
                    nameB={entityB?.name}
                    scoreA={scoreA}
                    scoreB={scoreB}
                    isNemesis={isNemesis}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-muted-foreground/20 bg-card p-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                            Combat radar
                        </h3>
                        <StatsRadar
                            data={radar}
                            nameA={entityA?.name}
                            nameB={entityB?.name}
                            showA={!!entityA}
                            showB={!!entityB}
                        />
                    </div>
                    <SparPanel
                        scoreA={scoreA?.overall ?? null}
                        scoreB={scoreB?.overall ?? null}
                        nameA={entityA?.name}
                        nameB={entityB?.name}
                    />
                </div>
            </div>

            <main className="max-w-5xl mx-auto bg-card border border-muted-foreground/20 rounded-xl max-h-[80vh] overflow-y-auto relative mb-10 overflow-x-hidden">
                {/* Entity Profile Header with Avatar Images */} {/* Sticky Banner Row */}
                <div className="sticky top-0 z-20 grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] bg-card/95 backdrop-blur-md border-b border-muted-foreground/20 text-center font-bold">
                    <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                        Entity Profile
                    </div>
                    <ProfileSlot entity={entityA} variant="primary" />
                    <ProfileSlot entity={entityB} variant="secondary" />
                </div>


                {/* SECTION: GENERAL & BIOGRAPHY */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    General Information
                </div>

                <Row label="Publisher">
                    {entityA ? (
                        <Cell>
                            <div className="flex flex-col justify-center items-center gap-1">
                                <Image
                                    src={entityA.biography?.publisher?.logo || "/placeholder.png"}
                                    alt={entityA.biography?.publisher?.name || ""}
                                    width={500}
                                    height={500}
                                    className="h-20 w-auto object-contain"
                                />
                                <span className="text-sm font-medium">
                                    {getPublisher(entityA.biography?.publisher)}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <div className="flex flex-col justify-center items-center gap-1">
                                <Image
                                    src={entityB.biography?.publisher?.logo || "/placeholder.png"}
                                    alt={entityB.biography?.publisher?.name || ""}
                                    width={500}
                                    height={500}
                                    className="h-20 w-auto object-contain"
                                />
                                <span className="text-sm font-medium">
                                    {getPublisher(entityB.biography?.publisher)}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Tier">
                    {entityA && TierIconA ? (
                        <Cell
                            className={`${CHARACTER_TIER_COLOR[entityA.tier as keyof typeof CHARACTER_TIER_COLOR].text} font-bold`}
                        >
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                                <TierIconA className="size-3.5 sm:size-4 shrink-0" />
                                <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center break-words max-w-full">
                                    {CHARACTER_TIER[entityA.tier as keyof typeof CHARACTER_TIER] || "N/A"}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB && TierIconB ? (
                        <Cell
                            className={`${CHARACTER_TIER_COLOR[entityB.tier as keyof typeof CHARACTER_TIER_COLOR].text} font-bold`}
                        >
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                                <TierIconB className="size-3.5 sm:size-4 shrink-0" />
                                <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center break-words max-w-full">
                                    {CHARACTER_TIER[entityB.tier as keyof typeof CHARACTER_TIER] || "N/A"}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Class">
                    {entityA && ClassIconA ? (
                        <Cell
                            className={`${CHARACTER_CLASS_COLOR[entityA.class as keyof typeof CHARACTER_CLASS_COLOR].text} font-bold`}
                        >
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                                <ClassIconA className="size-3.5 sm:size-4 shrink-0" />
                                <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center break-words max-w-full">
                                    {CHARACTER_CLASS[entityA.class as keyof typeof CHARACTER_CLASS] || "N/A"}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB && ClassIconB ? (
                        <Cell
                            className={`${CHARACTER_CLASS_COLOR[entityB.class as keyof typeof CHARACTER_CLASS_COLOR].text} font-bold`}
                        >
                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                                <ClassIconB className="size-3.5 sm:size-4 shrink-0" />
                                <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center break-words max-w-full">
                                    {CHARACTER_CLASS[entityB.class as keyof typeof CHARACTER_CLASS] || "N/A"}
                                </span>
                            </div>
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Alignment">
                    {entityA ? (
                        <Cell className={(entityA.biography?.alignment) === "good" ? "text-green-400 font-bold capitalize" : (entityA.biography?.alignment) === "neutral" ? "text-yellow-400 font-bold capitalize" : "text-red-400 font-bold capitalize"}>
                            {entityA.biography?.alignment || "N/A"}
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell className={(entityB.biography?.alignment) === "good" ? "text-green-400 font-bold capitalize" : (entityB.biography?.alignment) === "neutral" ? "text-yellow-400 font-bold capitalize" : "text-red-400 font-bold capitalize"}>
                            {entityB.biography?.alignment || "N/A"}
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Tier / Class">
                    {entityA ? (
                        <Cell>Tier {entityA.tier ?? "N/A"} / Class {entityA.class ?? "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>Tier {entityB.tier ?? "N/A"} / Class {entityB.class ?? "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="First Appearance">
                    {entityA ? (
                        <Cell>{entityA.biography?.firstAppearance || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.biography?.firstAppearance || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Place of Birth">
                    {entityA ? (
                        <Cell>{entityA.biography?.placeOfBirth || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.biography?.placeOfBirth || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Origin">
                    {entityA ? (
                        <Cell>{entityA.biography?.origin || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.biography?.origin || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                {/* SECTION: POWERSTATS */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Combat & Powerstats
                </div>

                {["intelligence", "strength", "speed", "durability", "power", "combat", "total"].map(
                    (statKey) => {
                        const valA =
                            entityA?.powerstats?.[statKey as keyof NonNullable<typeof entityA.powerstats>] ?? null;
                        const valB =
                            entityB?.powerstats?.[statKey as keyof NonNullable<typeof entityB.powerstats>] ?? null;

                        return (
                            <Row key={statKey} label={statKey.toUpperCase()}>
                                {valA != null ? (
                                    <Cell className={`${valA != null && valB != null && valA > valB ? "text-primary font-bold" : ""} flex gap-2`}>
                                        {valA}
                                        <Progress
                                            value={valA > 100 ? 100 : valA}
                                            indicatorClassName={`${(valB != null && valA > valB) ? "bg-primary" : "bg-foreground/50"} rotate-180`}
                                        />
                                    </Cell>
                                ) : (
                                    <EmptyCell />
                                )}
                                {valB != null ? (
                                    <Cell className={`${valA != null && valB != null && valB > valA ? "text-secondary font-bold" : ""} flex gap-2`}>
                                        <Progress
                                            value={valB > 100 ? 100 : valB}
                                            indicatorClassName={`${(valA != null && valB > valA) ? "bg-secondary" : "bg-foreground/50"}`}
                                        />
                                        {valB}
                                    </Cell>
                                ) : (
                                    <EmptyCell />
                                )}
                            </Row>
                        );
                    }
                )}

                {/* SECTION: PHYSICAL APPEARANCE */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Physical Characteristics
                </div>

                <Row label="Race">
                    {entityA ? (
                        <Cell>{entityA.appearance?.race || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.race || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Gender">
                    {entityA ? (
                        <Cell>{entityA.appearance?.gender || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.gender || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Height">
                    {entityA ? (
                        <Cell>{entityA.appearance?.height?.join(" / ") || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.height?.join(" / ") || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Weight">
                    {entityA ? (
                        <Cell>{entityA.appearance?.weight?.join(" / ") || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.weight?.join(" / ") || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Eyes / Hair">
                    {entityA ? (
                        <Cell>{entityA.appearance?.eyeColor || "N/A"} / {entityA.appearance?.hairColor || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.eyeColor || "N/A"} / {entityB.appearance?.hairColor || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Description">
                    {entityA ? (
                        <Cell>{entityA.appearance?.description || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.appearance?.description || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                {/* SECTION: WORK & BASE */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Work & Operations
                </div>

                <Row label="Occupation">
                    {entityA ? (
                        <Cell>{entityA.work?.occupation || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.work?.occupation || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Base of Operations">
                    {entityA ? (
                        <Cell>{entityA.work?.base || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>{entityB.work?.base || "N/A"}</Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                {/* SECTION: ABILITIES, TEAMS & ENEMIES */}
                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Powers & Connections
                </div>

                <Row label="Special Powers">
                    {entityA ? (
                        <Cell>
                            <PillList items={getPowerNames(entityA.powers)} variant="primary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <PillList items={getPowerNames(entityB.powers)} variant="secondary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Weaknesses">
                    {entityA ? (
                        <Cell>
                            <PillList items={entityA.weaknesses || []} variant="primary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <PillList items={entityB.weaknesses || []} variant="secondary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Teams & Affiliations">
                    {entityA ? (
                        <Cell>
                            <PillList items={getTeamNames(entityA.connections?.groupAffiliation)} variant="primary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <PillList items={getTeamNames(entityB.connections?.groupAffiliation)} variant="secondary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <Row label="Primary Enemies">
                    {entityA ? (
                        <Cell>
                            <PillList items={getEnemyNames(entityA.connections?.enemies)} variant="primary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                    {entityB ? (
                        <Cell>
                            <PillList items={getEnemyNames(entityB.connections?.enemies)} variant="secondary" />
                        </Cell>
                    ) : (
                        <EmptyCell />
                    )}
                </Row>

                <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
                    Match score breakdown
                </div>
                {(
                    [
                        ["Combat stats", scoreA?.combat, scoreB?.combat],
                        ["Tier", scoreA?.tier, scoreB?.tier],
                        ["Class", scoreA?.class, scoreB?.class],
                        ["Powers", scoreA?.powers, scoreB?.powers],
                        ["Threat context", scoreA?.threat, scoreB?.threat],
                        ["Weakness penalty", scoreA?.weaknessPenalty, scoreB?.weaknessPenalty],
                        ["Overall", scoreA?.overall, scoreB?.overall],
                    ] as const
                ).map(([label, a, b]) => (
                    <Row key={label} label={label}>
                        <Cell className={`${(a != null && b != null && a > b) ? "text-primary font-bold" : "text-foreground"} flex gap-2`}>
                            {a != null ? (label.includes("penalty") ? `−${a}` : a) : "—"}
                            <Progress
                                value={a! > 100 ? 100 : a}
                                indicatorClassName={`${(a != null && b != null && a > b) ? "bg-primary" : "bg-foreground/50"} rotate-180`}
                            />
                        </Cell>
                        <Cell className={`${(a != null && b != null && b > a) ? "text-secondary font-bold" : "text-foreground"} flex gap-2`}>
                            <Progress
                                value={b! > 100 ? 100 : b}
                                indicatorClassName={`${(a != null && b != null && b > a) ? "bg-secondary" : "bg-foreground/50"} `}
                            />
                            {b != null ? (label.includes("penalty") ? `−${b}` : b) : "—"}
                        </Cell>
                    </Row>
                ))}
            </main>
            {/* </Suspense> */}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] border-b border-muted-foreground/20 last:border-b-0 hover:bg-muted-foreground/10 transition-colors">
            <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                {label}
            </div>
            {children}
        </div>
    );
}

function Cell({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`min-w-0 p-2 sm:p-3 md:p-4 text-center border-r border-muted-foreground/20 last:border-r-0 flex items-center justify-center text-xs sm:text-sm md:text-base ${className}`}
        >
            {children}
        </div>
    );
}

function EmptyCell({ className = "" }: { className?: string }) {
    return (
        <Cell className={`text-muted-foreground/50 ${className}`}>
            —
        </Cell>
    );
}

function ProfileSlot({
    entity,
    variant,
}: {
    entity: CharacterWithJoinTeamUniversePowerEnemies | null;
    variant: "primary" | "secondary";
}) {
    const border =
        variant === "primary" ? "border-primary" : "border-secondary";
    const nameColor =
        variant === "primary" ? "text-primary" : "text-secondary";

    if (!entity) {
        return (
            <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <div
                    className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg border-2 border-dashed ${border} opacity-40 bg-muted/30`}
                />
                <span className="text-xs sm:text-sm">Select a character</span>
            </div>
        );
    }

    return (
        <div className="min-w-0 p-2 sm:p-3 md:p-4 border-r border-muted-foreground/20 last:border-r-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <ViewTransition name={`character-${entity.id}`}>
                <div
                    className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 ${border} shadow-md bg-card shrink-0`}
                >
                    <Image
                        src={entity.images?.md}
                        alt={entity.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </ViewTransition>
            <span
                className={`${nameColor} text-xs sm:text-base md:text-lg text-center break-words max-w-full`}
            >
                {entity.name}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground italic text-center break-words max-w-full">
                {entity.biography?.fullName || "N/A"}
            </span>
            <LoadingLink href={`/characters/${entity.id}`} className="mt-0.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground underline hover:text-primary transition-colors">
                    View Profile
                </span>
            </LoadingLink>
        </div>
    );
}