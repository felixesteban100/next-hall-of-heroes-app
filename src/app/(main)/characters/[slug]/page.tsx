import { Suspense, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CharacterBadge from "@/components/CharacterBadge";
import CharacterCard from "@/components/CharacterCard";
import PowerCard from "@/components/PowerCard";
import TeamCard from "@/components/TeamCard";
import { CharacterImageCarousel } from "@/components/CharacterImageCarousel";

import { collectionCharacters } from "@/db/mongodb";
import { getCharacterAlignmentColor, getCharacterAlignmentText, joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { CharacterBadgeIcon } from "@/lib/characters_utils";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";

import { BookIcon, Brain, CalendarIcon, Gauge, HandFist, HouseIcon, LetterTextIcon, MapPinIcon, Paperclip, Shield, ShieldOff, Swords, Users, Zap, Percent } from "lucide-react";

export const instant = false;

// Helpers
const val = (v?: string | null, fallback = "Unknown") => (!v || v === "-" || v === "" ? fallback : v);

const POWERSTATS_CFG = [
    { key: "intelligence", label: "Intelligence", icon: Brain, color: "[&>div]:bg-green-500" },
    { key: "strength", label: "Strength", icon: HandFist, color: "[&>div]:bg-yellow-500" },
    { key: "speed", label: "Speed", icon: Gauge, color: "[&>div]:bg-purple-500" },
    { key: "durability", label: "Durability", icon: Shield, color: "[&>div]:bg-red-500" },
    { key: "combat", label: "Combat", icon: Swords, color: "[&>div]:bg-orange-500" },
    { key: "power", label: "Power", icon: Zap, color: "[&>div]:bg-cyan-500" },
] as const;

export default async function CharactersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [character] = await collectionCharacters
        .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
            joinTeam_universe_power_enemies_toCharacter({ id: parseInt(slug.split("-")[0] ?? "") }, "id", "desc", 0, 1)
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
    const tierColors = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR];
    const classColors = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR];

    const appearanceFields = [
        { label: "HEIGHT", value: appearance.height?.filter(h => h && h !== "-").join(" / ") || "Unknown" },
        { label: "WEIGHT", value: appearance.weight?.filter(w => w && !w.includes("-")).join(" / ") || "Unknown" },
        { label: "EYE COLOR", value: val(appearance.eyeColor) },
        { label: "HAIR COLOR", value: val(appearance.hairColor) },
        { label: "RACE", value: val(appearance.race) },
        { label: "GENDER", value: val(appearance.gender) },
    ];

    const bioFields = [
        { icon: MapPinIcon, label: "Born in", val: val(biography.placeOfBirth, "An unknown location") },
        { icon: CalendarIcon, label: "Age", val: val(appearance.age, "An unknown age") },
        { icon: BookIcon, label: "First Appearance", val: val(biography.firstAppearance, "An unknown date") },
        { icon: LetterTextIcon, label: "Aliases", val: aliases.join(", ") || "No aliases listed" },
        { icon: BookIcon, label: "Occupation", val: val(work.occupation, "An unknown occupation") },
        { icon: HouseIcon, label: "Base", val: val(work.base, "An unknown base") },
        { icon: Users, label: "Relatives", val: val(connections.relatives, "No relatives") },
        { icon: ShieldOff, label: "Weaknesses", val: character.weaknesses?.length ? character.weaknesses.join(", ") : "An unknown weakness" },
        { icon: Paperclip, label: "Origin", val: val(biography.origin, "An unknown origin") },
    ];

    return (
        <div className="pb-8 space-y-6 pt-5">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="shrink-0 w-full md:w-auto flex justify-center">
                    <Suspense
                        fallback={
                            <ViewTransition name={`photo-${character.id}`}>
                                <div className="w-full max-w-xs sm:max-w-sm aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                            </ViewTransition>
                        }
                    >
                        <ViewTransition name={`photo-${character.id}`}>
                            <CharacterImageCarousel images={characterImages} name={character.name} />
                        </ViewTransition>
                    </Suspense>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge className={`${tierColors.bg} ${tierColors.foreground}`}><TierIcon size={16} className="mr-1" /> Tier {CHARACTER_TIER[character.tier as keyof typeof CHARACTER_TIER]}</Badge>
                            <Badge className={`${classColors.bg} ${classColors.foreground}`}><ClassIcon size={16} className="mr-1" /> Class {CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]}</Badge>
                            <CharacterBadge icon={CharacterBadgeIcon(biography.alignment)} text={getCharacterAlignmentText(biography.alignment)} color={getCharacterAlignmentColor(biography.alignment)} />
                        </div>

                        <h1 className="text-2xl font-bold">{character.name}</h1>
                        <p className="text-sm font-light">{val(biography.fullName, "Unknown name")} · <span className="font-semibold">#{character.id}</span></p>

                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <p className="text-sm leading-relaxed line-clamp-4">{biography.origin}</p>
                            <div className="w-16 sm:w-24 border-l-0 sm:border-l-4 h-16 flex items-center justify-center p-2 shrink-0">
                                <Link href={`/universes/${biography.publisher.id}`}>
                                    <ViewTransition name={`photo-universe-${biography.publisher.id}`} share="morph">
                                        <Image src={biography.publisher.logo} alt={character.name} width={100} height={100} className="max-w-full max-h-full object-contain rounded-lg" unoptimized />
                                    </ViewTransition>
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {aliases.length ? aliases.slice(0, 3).map((a, i) => (
                                <Badge variant="secondary" key={a + i}>{a}</Badge>
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
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Powerstats</p>
                <div className="grid grid-cols-2 gap-2">
                    {POWERSTATS_CFG.map(({ key, label, icon: Icon, color }) => (
                        <div key={key} className="flex flex-col justify-between gap-2 border p-3 rounded bg-muted">
                            <p className="text-sm font-light flex gap-1.5 items-center"><Icon size={16} /> {label}: {powerstats[key]}</p>
                            <Progress value={powerstats[key]} className={color} />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-between gap-2 border p-3 rounded bg-muted">
                    <p className="text-sm font-light flex gap-1.5 items-center"><Percent size={16} /> Overall score: {powerstats.total}</p>
                    <Progress value={powerstats.total} />
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
            <SectionGrid title="Powers & Abilities" items={character.powers} emptyMsg="No powers or abilities listed.">
                {(power) => (
                    <Link key={power.name} href={`/powers/${power.id}`}>
                        <PowerCard power={power} size="sm" />
                    </Link>
                )}
            </SectionGrid>

            {/* Groups & Affiliations */}
            <SectionGrid title="Groups & Affiliations" items={connections.groupAffiliation} emptyMsg="No group affiliations listed.">
                {(team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                        <TeamCard team={team} size="sm" />
                    </Link>
                )}
            </SectionGrid>

            {/* Enemies */}
            <SectionGrid title="Enemies" items={connections.enemies} emptyMsg="No enemies listed.">
                {(enemy) => (
                    <Link key={enemy.id} href={`/characters/${enemy.slug}`}>
                        <CharacterCard character={JSON.parse(JSON.stringify(enemy))} size="sm" />
                    </Link>
                )}
            </SectionGrid>

            {/* Gallery */}
            <div id="gallery" className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Gallery</p>
                {Object.values(images).some(Boolean) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                        {Object.entries(images).map(([key, value]) => {
                            if (!value || value === "-") return null;
                            return (
                                <div key={key} className="border rounded-lg overflow-hidden aspect-square">
                                    <Image unoptimized src={value} alt={`${character.name} ${key}`} width={400} height={400} className="w-full h-full object-cover" />
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-sm font-bold">No gallery images listed.</p>}
            </div>
        </div>
    );
}

// Sub-component for repeated grid sections
function SectionGrid<T>({ title, items, emptyMsg, children }: { title: string; items?: T[]; emptyMsg: string; children: (item: T) => React.ReactNode }) {
    return (
        <div id={title.toLowerCase().replace(/\s+/g, "-")} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
            {items && items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                    {items.map(children)}
                </div>
            ) : (
                <p className="text-sm font-bold">{emptyMsg}</p>
            )}
        </div>
    );
}

{/* {Object.entries(character.biography.publisher.comics).map(([key, value]) => (
                            <div key={key} className="border rounded-lg overflow-hidden">
                                <Image src={value} alt={`${character.name} ${key}`} width={800} height={800} className="rounded-lg h-full object-cover" />
                            </div>
                        ))} */}

/* 
    - hermana Elba (consolacion para la familia de la perdida de su sobrino)
    - Jesus Armendaris (fue deportado a mexico)
    - por leidy y su decision
    - por bigin y su proceso
    - conversion de manito
*/
