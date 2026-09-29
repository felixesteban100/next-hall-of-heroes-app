import { collectionCharacters, collectionPowers } from "@/db/mongodb";
import Image from "next/image";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { POWER_TIER, POWER_TIER_COLOR, POWER_TIER_ICON } from "@/lib/constants";
import { Zap } from "lucide-react";
import { CharacterAccordionList } from "@/components/characters/CharacterAccordionList";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    "use cache"
    const { id } = await params;

    const power = await collectionPowers.findOne({ id: parseInt(id) });

    if (power === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Power not found</h1>
            </div>
        )
    }

    const powerCharacters = await collectionCharacters
        .find({ "powers": { $in: [power.id] } })
        // .sort({ "powerstats.total": -1 }) // strongest first
        .sort({ name: 1 }) // name
        .toArray();

    const tierKey = power.tier as keyof typeof POWER_TIER;
    const tierColors = POWER_TIER_COLOR[tierKey];
    const TierIcon = POWER_TIER_ICON[tierKey];

    const normalizedScore = power.score ? Math.min(Math.round(power.score / 1000), 100) : null;

    /* Power Tier Badge: Show where this power sits on your tier scale (e.g., Tier 2: Tactical / Basic).

Top Users / Powerhouses: A featured banner highlighting the #1 or top 3 strongest characters who possess this ability before listing everyone else. */

    // console.log((await collectionPowers.find({}).toArray()).map(c => ({ name: c.name, id: c.id })))
    // update tiers with a seedFunction (function to be create it)

    return (
        <div className="pb-8 space-y-8 mt-4">
            {/* Header */}
            {/* this one doesn't look good on mobile it looks shinked */}
            <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                <ViewTransition name={`power-${power.id}`}>
                    <Image
                        unoptimized
                        src={power.img}
                        alt={power.name}
                        className="h-52 w-full md:w-52 rounded-lg object-cover shrink-0"
                        width={500}
                        height={500}
                    />
                </ViewTransition>

                <div className="flex-1 space-y-3">
                    {/* Tier badge */}
                    <Badge className={`${tierColors.bg} ${tierColors.foreground}`}>
                        <TierIcon size={12} />
                        {POWER_TIER[tierKey]}{" "}
                        #{tierKey}
                    </Badge>

                    <h1 className="text-3xl font-bold">{power.name}</h1>
                    <p className="text-sm text-muted-foreground">#{power.id}</p>
                    <p className="text-muted-foreground">{power.description || "No description available."}</p>

                    {/* Score bar */}
                    {normalizedScore !== null && (
                        <div className="space-y-1 ">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Zap size={14} /> Power score
                                </span>
                                <span className="font-semibold">
                                    {power.score.toLocaleString()}
                                    <span className="text-muted-foreground font-normal text-xs ml-1">
                                        / 100,000
                                    </span>
                                </span>
                            </div>
                            <Progress value={normalizedScore} className={`h-2 ${tierColors.progress}`} />
                        </div>
                    )}

                    {/* Logo */}
                    {power.logo && power.logo !== "" && (
                        <div className="pt-1">
                            <Image
                                unoptimized
                                src={power.logo}
                                alt={`${power.name} logo`}
                                width={80}
                                height={80}
                                className="object-contain opacity-80"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Members */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-light uppercase text-primary">
                        Users
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {powerCharacters.length} characters with this power
                    </p>
                </div>
                <CharacterAccordionList characters={powerCharacters} />
            </div>

            <MiniEntityGrid
                entityType="character"
                items={powerCharacters.map((c) => ({
                    id: c.id,
                    name: c.name,
                    image: c.images?.md,
                    alignment: c.biography.alignment,
                }))}
            />
        </div>
    )
}