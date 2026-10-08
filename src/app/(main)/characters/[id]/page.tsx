import { Suspense, ViewTransition } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CharacterBadge from "@/components/characters/CharacterBadge";
import { CharacterImageCarousel } from "@/components/characters/CharacterImageCarousel";

import { collectionCharacters } from "@/db/mongodb";
import { getCharacterAlignmentColor, getCharacterAlignmentText, joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterBadgeIcon } from "@/lib/characters_utils";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON, CHARACTER_TYPE_LABEL, POWER_TIER } from "@/lib/constants";
import { CharacterWithJoinTeamUniversePowerEnemies, Enemy, FallbackItem, Power, Team } from "@/types";

import { BookIcon, Brain, CalendarIcon, Gauge, HandFist, HouseIcon, LetterTextIcon, MapPinIcon, Paperclip, Shield, ShieldOff, Swords, Users, Zap, Percent, ScanFace } from "lucide-react";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";
import { MasonryGallery } from "@/components/shared/MasonryGallery";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { computeMatchScore } from "@/lib/compare/compare_utls";

export const instant = false;

// Helpers
const val = (v?: string | null, fallback = "Unknown") => (!v || v === "-" || v === "" ? fallback : v);

const POWERSTATS_CFG = [
    { key: "intelligence", label: "Intelligence", icon: Brain, color: "bg-green-500" },
    { key: "strength", label: "Strength", icon: HandFist, color: "bg-yellow-500" },
    { key: "speed", label: "Speed", icon: Gauge, color: "bg-purple-500" },
    { key: "durability", label: "Durability", icon: Shield, color: "bg-red-500" },
    { key: "combat", label: "Combat", icon: Swords, color: "bg-orange-500" },
    { key: "power", label: "Power", icon: Zap, color: "bg-cyan-500" },
] as const;

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [character] = await collectionCharacters
        .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
            joinTeam_universe_power_enemies_toCharacter({ id: parseInt(id) }, "id", "desc", 0, 1, { includeEnemies: true })
        )
        .toArray();

    if (!character) return <div>Character not found</div>;

    const { biography, appearance, work, connections, powerstats, images } = character;

    // Process Aliases
    const aliases = [
        ...(biography.aliases || []),
        ...(biography.alterEgos ? biography.alterEgos.split(",") : [])
    ].map(a => a.trim()).filter(a => a && a !== "-");

    // Process Images
    const characterImages = [
        images.md,
        ...Object.entries(images).filter(([k, img]) => k !== "md" && img && img !== "-").map(([, img]) => img.toString())
    ];

    const TierIcon = CHARACTER_TIER_ICON[Number(character.tier)];
    const ClassIcon = CHARACTER_CLASS_ICON[Number(character.class)];
    const TypeIcon = CHARACTER_TYPE_ICON[character.character_type as keyof typeof CHARACTER_TYPE_ICON];
    const tierColors = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR];
    const classColors = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR];
    const typeColors = CHARACTER_TYPE_COLOR[character.character_type as keyof typeof CHARACTER_TYPE_COLOR];

    const appearanceFields = [
        { label: "HEIGHT", /* icon: , */ value: appearance.height?.filter(h => h && h !== "-").join(" / ") || "Unknown" },
        { label: "WEIGHT", /* icon: , */ value: appearance.weight?.filter(w => w && !w.includes("-")).join(" / ") || "Unknown" },
        { label: "EYE COLOR", /* icon: , */ value: val(appearance.eyeColor) },
        { label: "HAIR COLOR", /* icon: , */ value: val(appearance.hairColor) },
        { label: "RACE", /* icon: , */ value: val(appearance.race) },
        { label: "GENDER", /* icon: , */ value: val(appearance.gender) },
    ];

    const bioFields = [
        { icon: MapPinIcon, label: "Born in", val: val(biography.placeOfBirth, "An unknown location") },
        { icon: ScanFace, label: "Description", val: val(appearance.description, "An unknown description") },
        { icon: CalendarIcon, label: "Age", val: val(appearance.age, "An unknown age") },
        { icon: BookIcon, label: "First Appearance", val: val(biography.firstAppearance, "An unknown date") },
        { icon: LetterTextIcon, label: "Aliases", val: aliases.join(", ") || "No aliases listed" },
        { icon: BookIcon, label: "Occupation", val: val(work.occupation, "An unknown occupation") },
        { icon: HouseIcon, label: "Base", val: val(work.base, "An unknown base") },
        { icon: Users, label: "Relatives", val: val(connections.relatives, "No relatives") },
        { icon: ShieldOff, label: "Weaknesses", val: character.weaknesses?.length ? character.weaknesses.join(", ") : "An unknown weakness" },
        { icon: Paperclip, label: "Origin", val: val(biography.origin, "An unknown origin") },
    ];

    const characterScore = computeMatchScore(character)

    // Powers
    const externalPowers = character.powers.filter(
        (c): c is FallbackItem => "isFallback" in c && c.isFallback === true
    );
    const characterPowersDB = character.powers.filter(
        (c): c is Power => !("isFallback" in c)
    );

    // Enemies
    const externalEnemies = character.connections.enemies.filter(
        (c): c is FallbackItem => "isFallback" in c && c.isFallback === true
    );
    const characterEnemiesDB = character.connections.enemies.filter(
        (c): c is Enemy => !("isFallback" in c)
    );

    // Teams / Group Affiliations
    const externalTeams = connections.groupAffiliation.filter(
        (c): c is FallbackItem => "isFallback" in c && c.isFallback === true
    );
    const characterTeamsDB = connections.groupAffiliation.filter(
        (c): c is Team => !("isFallback" in c)
    );

    return (
        <div className="pb-8 space-y-6 pt-5">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="shrink-0 w-full md:w-auto flex justify-center">
                    <Suspense
                        fallback={
                            <ViewTransition name={`character-${character.id}`}>
                                <div className="w-80 h-[24rem] bg-muted/60 rounded-lg animate-pulse shrink-0" />
                            </ViewTransition>
                        }
                    >
                        <ViewTransition name={`character-${character.id}`}>
                            <CharacterImageCarousel images={characterImages} name={character.name} />
                        </ViewTransition>
                    </Suspense>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <CharacterBadge icon={CharacterBadgeIcon(biography.alignment)} text={getCharacterAlignmentText(biography.alignment)} color={getCharacterAlignmentColor(biography.alignment)} />
                            <Badge className={`${typeColors.bg} ${typeColors.foreground}`}><TypeIcon size={16} className="mr-1" /> Type {CHARACTER_TYPE_LABEL[character.character_type as keyof typeof CHARACTER_TYPE_LABEL]}</Badge>
                            <Badge className={`${tierColors.bg} ${tierColors.foreground}`}><TierIcon size={16} className="mr-1" /> Tier {CHARACTER_TIER[character.tier as keyof typeof CHARACTER_TIER]}</Badge>
                            <Badge className={`${classColors.bg} ${classColors.foreground}`}><ClassIcon size={16} className="mr-1" /> Class {CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]}</Badge>
                        </div>

                        <h1 className="text-2xl font-bold">{character.name}</h1>
                        <p className="text-sm font-light">{val(biography.fullName, "Unknown name")} · <span className="font-semibold">#{character.id}</span></p>

                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <p className="text-sm leading-relaxed line-clamp-4">{biography.origin}</p>
                            <div className="w-full sm:w-24 h-auto md:h-16 border-l-0 sm:border-l-4 flex items-center justify-center p-2 shrink-0">
                                <LoadingLink href={`/universes/${biography.publisher.id}`}>
                                    <ViewTransition name={`universe-${biography.publisher.id}`} share="morph">
                                        <Image src={biography.publisher.logo} alt={character.name} width={100} height={100} className="max-w-full max-h-full object-contain rounded-lg" unoptimized />
                                    </ViewTransition>
                                </LoadingLink>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {aliases.length ? aliases.join(",").split(",").map((a, i) => (
                                <Badge variant="outline" className="border-foreground" key={a + i}>{a}</Badge>
                            )) : <p className="text-sm text-muted-foreground">No aliases or alter egos listed.</p>}
                        </div>
                    </div>

                    {/* Appearance Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                        {appearanceFields.map((field) => (
                            <div key={field.label} className="flex flex-col gap-1 border p-2 rounded bg-muted">
                                <p className="text-xs font-light text-muted-foreground">{field.label}</p>
                                <p className="text-sm font-bold capitalize">{field.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Powerstats */}
            <div id="powerstats" className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Powerstats</p>
                    <LoadingLink href={`/compare?id1=${character.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Compare with another character
                    </LoadingLink>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {POWERSTATS_CFG.map(({ key, label, icon: Icon, color }) => (
                        <div key={key} className="flex flex-col justify-between gap-2 border p-3 rounded bg-muted">
                            <p className="text-sm font-light flex gap-1.5 items-center">
                                <Icon size={16} /> {label}: {powerstats[key]}
                            </p>
                            <Progress value={powerstats[key]} indicatorClassName={color} />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-between gap-2 border p-3 rounded bg-muted">
                    <p className="text-sm font-light flex gap-1.5 items-center">
                        <Percent size={16} /> Overall score: {powerstats.total}
                    </p>
                    <Progress value={powerstats.total > 100 ? 100 : powerstats.total} indicatorClassName="bg-primary" />
                </div>
            </div>

            {/* Biography */}
            <div id="biography" className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Biography</p>
                <div className="divide-y border-bottom rounded-lg">
                    {bioFields.map(({ icon: Icon, label, val }) => (
                        <div key={label} className="text-sm flex items-start sm:items-center gap-4 p-2.5">
                            <span className="flex items-center gap-1.5 w-32 sm:w-40 shrink-0 text-muted-foreground"><Icon size={16} /> {label}</span>
                            <p className="text-sm font-bold capitalize">{val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Powers & Abilities */}
            <div id={"Powers & Abilities"} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Powers & Abilities</p>
                <MiniEntityGrid
                    entityType="power"
                    items={characterPowersDB.map((p) => ({
                        id: p.id,
                        name: p.name,
                        image: p.img,
                        category: POWER_TIER[p.tier as keyof typeof POWER_TIER],             // e.g. "Elemental"
                        // characterCount: p.usersCount, // e.g. Renders subtext: "14 Users"
                    }))}
                    externalNames={externalPowers.map(c => c.name)}
                    emptyMessage="No powers found."
                />
            </div>

            {/* Scores */}
            {characterScore && <div id={"Scores"} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Scores</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(characterScore).map(([key, value]) => (
                        <div key={key} className={`${key == "overall" && "col-span-2 lg:col-span-3"} flex flex-col justify-between gap-2 border p-3 rounded bg-muted`}>
                            <span className="font-light capitalize">{key}: <span className="font-bold">{value}</span></span>
                            <Progress value={value} />
                        </div>
                    ))}
                </div>
            </div>}

            {/* Groups & Affiliations */}
            <div id={"Groups & Affiliations"} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Groups & Affiliations</p>
                <MiniEntityGrid
                    items={characterTeamsDB}
                    entityType="team"
                    emptyMessage="No teams found."
                    externalNames={externalTeams.map(c => c.name)}
                    showAlignment={true}
                />
            </div>

            {/* Enemies */}
            <div id={"Enemies"} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Enemies</p>
                <MiniEntityGrid
                    entityType="character"
                    showAlignment={true}
                    items={characterEnemiesDB.map((c) => ({
                        id: c.id,
                        name: c.name,
                        image: c.image,
                        alignment: c.alignment,
                    }))}
                    externalNames={externalEnemies.map(c => c.name)}
                    emptyMessage="No enemies found."
                    compareWithId={character.id}
                />
            </div>

            {/* Gallery */}
            <div id="gallery" className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Gallery
                </p>
                <MasonryGallery images={character.images} characterName={character.name} />
            </div>
        </div>
    );
}

/* 
    - hermana Elba (consolacion para la familia de la perdida de su sobrino)
    - Jesus Armendaris (fue deportado a mexico)
    - por leidy y su decision
    - por bigin y su proceso
    - conversion de manito
*/


