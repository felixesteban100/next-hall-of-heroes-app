import CharacterBadge from "@/components/CharacterBadge";
import CharacterCard from "@/components/CharacterCard";
import { Badge } from "@/components/ui/badge";
import { collectionCharacters } from "@/db/mongodb";
import { getCharacterAlignmentColor, getCharacterAlignmentText, joinTeam_universe_power_enemies_toCharacter } from "@/lib/character_utils";
import { BookIcon, Brain, CalendarIcon, Gauge, HandFist, HouseIcon, LetterTextIcon, MapPinIcon, Paperclip, Shield, ShieldOff, Swords, Users, Zap, Percent } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress"
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import Link from "next/link";
import PowerCard from "@/components/PowerCard";
import TeamCard from "@/components/TeamCard";
import { Suspense, ViewTransition } from "react";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
// import ActiveFiltersBadges from "@/components/ActiveFiltersBadges";
import { CharacterImageCarousel } from "@/components/CharacterImageCarousel";
import { CharacterBadgeIcon } from "@/lib/characters_utils";

export default async function CharactersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // const character = await collectionCharacters.findOne({ slug });
    // console.log(slug.split("-")[0])
    const [character] = await collectionCharacters
        .aggregate<CharacterWithJoinTeamUniversePowerEnemies>(
            joinTeam_universe_power_enemies_toCharacter(
                { id: parseInt(slug.split("-")[0] ?? "") },
                "id",
                "desc",
                0,
                1,
                // [],
            ),
        )
        .toArray();

    if (!character) {
        return <div>Character not found</div>;
    }

    const joinAliasesAndAlterEgos = `${character.biography.aliases ? character.biography.aliases.join(",") : ""}${character.biography.alterEgos ? "," + character.biography.alterEgos.split(",").join(",") : ""}`;

    const aliasesAndAlterEgos = joinAliasesAndAlterEgos.split(",").map((alias) => alias.trim()).filter((alias) => alias !== "" && alias !== "-");

    const tierColors = CHARACTER_TIER_COLOR[character.tier as keyof typeof CHARACTER_TIER_COLOR]
    const classColors = CHARACTER_CLASS_COLOR[character.class as keyof typeof CHARACTER_CLASS_COLOR]
    const TierIcon = CHARACTER_TIER_ICON[Number(character.tier)]
    const ClassIcon = CHARACTER_CLASS_ICON[Number(character.class)]

    // console.log("class", character.class)
    // console.log(character)

    return (
        <div className="pb-8 space-y-5 pt-5">
            <div className="flex flex-col md:flex-row items-start gap-6">
                {/* border rounded-lg */}
                <div className="shrink-0 w-full md:w-auto flex justify-center md:block">
                    <Suspense
                        fallback={
                            <ViewTransition name={`photo-${character.id}`} /* exit="slide-down" default="none" */>
                                <div className="h-full max-w-50 sm:max-w-xs h-[27rem] w-[50rem] bg-foreground/80 rounded-lg animate-pulse" />
                            </ViewTransition>
                        }
                    >
                        <ViewTransition name={`photo-${character.id}`} >
                            {/* <Image src={character.images.md} alt={character.name} width={300} height={500} className="rounded-lg h-full object-cover" /> */}
                            <CharacterImageCarousel images={Object.values(character.images).filter((image) => image != "" && image != undefined && image != "-")} name={character.name} />
                        </ViewTransition>
                    </Suspense>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="space-x-2">
                            <Badge className={`${tierColors.bg} ${tierColors.foreground}`}><TierIcon size={16} /> Tier  {CHARACTER_TIER[character.tier as keyof typeof CHARACTER_TIER]}</Badge>
                            <Badge className={`${classColors.bg} ${classColors.foreground}`}><ClassIcon size={50} /> Class {CHARACTER_CLASS[character.class as keyof typeof CHARACTER_CLASS]}</Badge>
                            <CharacterBadge icon={CharacterBadgeIcon(character.biography.alignment)} text={getCharacterAlignmentText(character.biography.alignment)} color={getCharacterAlignmentColor(character.biography.alignment)} />
                        </div>

                        {/* <ActiveFiltersBadges
                            name={character.name}
                            gender={character.appearance.gender}
                            alignment={character.biography.alignment}
                            universe={character.biography.publisher.name}
                            tier={character.tier}
                            character_class={character.class}
                            powersParam={character.powers.map((p) => p.name)}
                            powers={JSON.parse(JSON.stringify(character.powers))}
                        /> */}


                        <h1 className="text-2xl font-bold">{character.name}</h1>
                        <p className="text-sm font-light">{character.biography.fullName === "-" || character.biography.fullName === "" ? "Unknown name" : character.biography.fullName} · <span className="font-semibold">#{character.id}</span></p>

                        {/* <p className="max-h-md overflow-y-auto">{character.biography.origin?.split(".")[0] + "."}</p> */}

                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <p className="text-sm leading-relaxed line-clamp-4">{`${character.biography.origin/* .slice(0, 100) */}`}</p>
                            <div className="w-16 sm:w-24 border-l-0 sm:border-l-4 h-16 flex items-center justify-center p-2 shrink-0">
                                <Image src={character.biography.publisher.logo} alt={character.name} width={100} height={100}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    unoptimized
                                // className="rounded-lg h-15 w-auto" 
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {aliasesAndAlterEgos ? aliasesAndAlterEgos.slice(0, 3).map((alterEgo, i) => {
                                return (
                                    <Badge variant="secondary" key={alterEgo + i}>
                                        {alterEgo}
                                    </Badge>
                                )
                            }) : <p className="text-sm text-muted-foreground">No aliases or alter egos listed.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">HEIGHT</p>
                            <p className="text-sm font-bold capitalize">
                                {character.appearance.height[0] == "-" || character.appearance.height[1] == "-" || character.appearance.height[0] == undefined || character.appearance.height[1] == undefined || character.appearance.height[0] == "" || character.appearance.height[1] == "" ?
                                    "Unknown"
                                    :
                                    `${character.appearance.height[0]} / ${character.appearance.height[1]}`
                                }
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">WEIGHT</p>
                            <p className="text-sm font-bold capitalize">
                                {character.appearance.weight[0] == "-" || character.appearance.weight[1].includes("-") || character.appearance.weight[0] == undefined || character.appearance.weight[1] == undefined || character.appearance.weight[0] == "" || character.appearance.weight[1] == "" ?
                                    "Unknown" :
                                    `${character.appearance.weight[0]} / ${character.appearance.weight[1]}`
                                }
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">EYE COLOR</p>
                            <p className="text-sm font-bold capitalize">{character.appearance.eyeColor == "-" ? "Unknown" : character.appearance.eyeColor}</p>
                        </div>
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">HAIR COLOR</p>
                            <p className="text-sm font-bold capitalize">{character.appearance.hairColor == "-" ? "Unknown" : character.appearance.hairColor}</p>
                        </div>
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">RACE</p>
                            <p className="text-sm font-bold capitalize">{character.appearance.race == "-" ? "Unknown" : character.appearance.race}</p>
                        </div>
                        <div className="flex flex-col gap-1 border p-2 rounded bg-muted">
                            <p className="text-sm font-light">GENDER</p>
                            <p className="text-sm font-bold capitalize">{character.appearance.gender == "-" ? "Unknown" : character.appearance.gender}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="powerstats" className="space-y-2">
                <p className="text-sm text-primary font-light">POWERSTATS</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><Brain size={16} /> Intelligence: {character.powerstats.intelligence}</p>
                        <Progress value={character.powerstats.intelligence} id="progress-upload" className="[&>div]:bg-green-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><HandFist size={16} /> Strength: {character.powerstats.strength}</p>
                        <Progress value={character.powerstats.strength} id="progress-upload" className="[&>div]:bg-yellow-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><Gauge size={16} /> Speed: {character.powerstats.speed}</p>
                        <Progress value={character.powerstats.speed} id="progress-upload" className="[&>div]:bg-purple-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><Shield size={16} /> Durability: {character.powerstats.durability}</p>
                        <Progress value={character.powerstats.durability} id="progress-upload" className="[&>div]:bg-red-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><Swords size={16} /> Combat: {character.powerstats.combat}</p>
                        <Progress value={character.powerstats.combat} id="progress-upload" className="[&>div]:bg-orange-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                        <p className="text-sm font-light flex gap-1 items-center"><Zap size={16} /> Power: {character.powerstats.power}</p>
                        <Progress value={character.powerstats.power} id="progress-upload" className="[&>div]:bg-cyan-500" />
                    </div>
                </div>
                <div className="flex flex-col justify-between gap-1 border p-2 rounded bg-muted py-4">
                    <p className="text-sm font-light flex gap-1 items-center"><Percent size={16} /> Overall score: {character.powerstats.total}</p>
                    <Progress value={character.powerstats.total} id="progress-upload" />
                </div>
            </div>

            <div id="biography" className="space-y-2">
                <p className="text-sm font-light uppercase mb-2 text-primary">BIOGRAPHY</p>
                <div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><MapPinIcon size={16} /> Born in</span>
                        <p className="text-sm font-bold">{(character.biography?.placeOfBirth === "-" || character.biography?.placeOfBirth === "") ? "An unknown location" : character.biography?.placeOfBirth}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><CalendarIcon size={16} /> Age</span>
                        <p className="text-sm font-bold">{character.appearance?.age || "an unknown age"}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><BookIcon size={16} /> First Appearance</span>
                        <p className="text-sm font-bold">{character.biography?.firstAppearance === "-" || character.biography?.firstAppearance === "" ? "An unknown date" : character.biography?.firstAppearance}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><LetterTextIcon size={16} /> Aliases</span>
                        <p className="text-sm font-bold">{aliasesAndAlterEgos.join(", ") || "No aliases or alter egos"}</p>
                    </div>

                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><BookIcon size={16} /> Occupation</span>
                        <p className="text-sm font-bold">{character.work.occupation === "-" || character.work.occupation === "" ? "An unknown occupation" : character.work.occupation}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><HouseIcon size={16} /> Base</span>
                        <p className="text-sm font-bold">{character.work.base === "-" || character.work.base === "" ? "An unknown base" : character.work.base}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><Users size={16} /> Relatives</span>
                        <p className="text-sm font-bold capitalize">{character.connections.relatives === "-" || character.connections.relatives === "" ? "no relatives" : character.connections.relatives}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><ShieldOff size={16} /> Weaknesses</span>
                        <p className="text-sm font-bold capitalize">{character.weaknesses || character.weaknesses === "-" ? "no weaknesses" : "an unknown weaknesses"}</p>
                    </div>
                    <div className="text-sm flex items-start sm:items-center gap-4 border-b p-2">
                        <span className="flex items-center gap-1 w-32 sm:w-40 shrink-0"><Paperclip size={16} /> Origin</span>
                        <p className="text-sm font-bold">{character.biography.origin || "an unknown origin"}</p>
                    </div>
                </div>
            </div>

            <div id="powers-abilities" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary ">Powers & abilities</p>
                {character.powers && character.powers.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {character.powers.map((power) => (
                            <Link key={power.name} href={`/powers/${power.id}`} className="flex flex-col gap-2">
                                <PowerCard power={power} size="sm" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No powers or abilities listed.</p>
                )}
            </div>

            <div id="groups-affiliation" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">GROUPS & AFFILIATIONS</p>
                {character.connections.groupAffiliation.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                        {character.connections.groupAffiliation.map((team) => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <TeamCard team={team} size="sm" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No group affiliations listed.</p>
                )}
            </div>

            {/* focus on the faces with this claude idea https://claude.ai/chat/00efcab1-9daa-4894-85c0-02b33b21531a */}

            <div id="enemies" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">ENEMIES</p>
                {character.connections.enemies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {character.connections.enemies.map((enemy) => (
                            <Link key={enemy.id} href={`/characters/${enemy.slug}`}>
                                <CharacterCard character={JSON.parse(JSON.stringify(enemy))} size="sm" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No enemies listed.</p>
                )}
            </div>

            <div id="gallery" className="space-y-2">
                <p className="text-sm font-light uppercase text-primary mb-2">GALLERY</p>
                {character.images ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(character.images).map(([key, value]) => {
                            if (value === undefined || value === null || value === "" || value === "-") return null;
                            return (
                                <div key={key} className="border rounded-lg overflow-hidden aspect-square">
                                    <Image
                                        unoptimized
                                        src={value}
                                        alt={`${character.name} ${key}`}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    /* onError={(e) => {
                                        e.currentTarget.parentElement!.style.display = "none"
                                    }} */
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm font-bold">No gallery images listed.</p>
                )}
            </div>
        </div>
    )
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
