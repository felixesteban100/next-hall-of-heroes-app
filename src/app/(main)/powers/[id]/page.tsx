import { collectionCharacters, collectionPowers } from "@/db/mongodb";
import Image from "next/image";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { POWER_TIER, POWER_TIER_COLOR, POWER_TIER_ICON } from "@/lib/constants";
import { Clock, Crosshair, ShieldAlert, Sparkles, Target, Zap } from "lucide-react";
import { CharacterAccordionList } from "@/components/characters/CharacterAccordionList";
import { MiniEntityGrid } from "@/components/shared/MiniGridItems";
import { Character } from "@/types";
import { LoadingLink } from "@/components/shared/LoadingLink";
import CompareWithButton from "@/components/shared/CompareWithButton";

export const instant = false;

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    "use cache"
    const { id } = await params;

    const power = await collectionPowers.findOne({ id: parseInt(id) });

    if (power === null) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center">
                <h1 className="text-2xl font-bold">Power not found</h1>
            </div>
        )
    }

    const cleanPowerName = power.name
        .replace(/[^\p{L}\s]/gu, "")
        .trim();

    const powerCharacters = await collectionCharacters
        .aggregate<Character>([
            {
                $match: {
                    $expr: {
                        $or: [
                            // 1. Direct ID match (number or string)
                            { $in: [power.id, { $ifNull: ["$powers", []] }] },
                            { $in: [Number(power.id), { $ifNull: ["$powers", []] }] },

                            // 2. Two-Way Case-Insensitive Substring Match
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ["$powers", []] },
                                                as: "p",
                                                cond: {
                                                    $and: [
                                                        { $eq: [{ $type: "$$p" }, "string"] },
                                                        {
                                                            $or: [
                                                                // Character item contains target power name
                                                                { $ne: [{ $indexOfCP: [{ $toLower: "$$p" }, cleanPowerName.toLowerCase()] }, -1] },
                                                                // Target power name contains character item
                                                                { $ne: [{ $indexOfCP: [cleanPowerName.toLowerCase(), { $toLower: "$$p" }] }, -1] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ])
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
            <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                <ViewTransition name={`power-${power.id}`}>
                    <Image
                        unoptimized
                        src={power.img}
                        alt={power.name}
                        className="h-52 w-auto lg:max-w-sm rounded-lg object-cover shrink-0"
                        width={500}
                        height={500}
                    />
                </ViewTransition>

                <div className="flex-1 space-y-3 w-full">
                    {/* Tier and Combat Role Badges */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={`${tierColors.bg} ${tierColors.foreground}`}>
                            <TierIcon size={12} />
                            {POWER_TIER[tierKey]} #{tierKey}
                        </Badge>

                        {power.combatRole && (
                            <Badge variant="secondary" className="gap-1 font-medium">
                                <ShieldAlert size={12} />
                                {power.combatRole}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold">{power.name}</h1>
                    <p className="text-sm text-muted-foreground">#{power.id}</p>
                    <p className="text-muted-foreground">{power.description || "No description available."}</p>

                    {/* New Attributes Grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="bg-muted/40 border rounded-lg p-2.5 text-xs flex flex-col justify-between">
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                <Sparkles size={12} className="text-primary" /> Activation
                            </span>
                            <span className="font-semibold text-sm mt-1">{power.activationType || "—"}</span>
                        </div>

                        <div className="bg-muted/40 border rounded-lg p-2.5 text-xs flex flex-col justify-between">
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                <Crosshair size={12} className="text-primary" /> Range
                            </span>
                            <span className="font-semibold text-sm mt-1">{power.range || "—"}</span>
                        </div>

                        <div className="bg-muted/40 border rounded-lg p-2.5 text-xs flex flex-col justify-between">
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                <Target size={12} className="text-primary" /> Target
                            </span>
                            <span className="font-semibold text-sm mt-1">{power.targetType || "—"}</span>
                        </div>

                        <div className="bg-muted/40 border rounded-lg p-2.5 text-xs flex flex-col justify-between">
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                <Clock size={12} className="text-primary" /> Duration
                            </span>
                            <span className="font-semibold text-sm mt-1">{power.duration || "—"}</span>
                        </div>
                    </div>

                    {/* Score bar */}
                    {normalizedScore !== null && (
                        <div className="space-y-1 pt-1">
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

            {/* Power Actions Section (Only renders if actions exist) */}
            {power.actions && power.actions.length > 0 && (
                <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>⚡</span> Power Actions & Techniques ({power.actions.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {power.actions.map((action, index) => (
                            <div key={index} className="bg-muted/30 border rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-primary">{action.name}</h4>
                                    {action.activationType && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                            {action.activationType}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {action.description}
                                </p>
                                {(action.range || action.targetType) && (
                                    <div className="flex gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                                        {action.range && <span>Range: <strong>{action.range}</strong></span>}
                                        {action.targetType && <span>Target: <strong>{action.targetType}</strong></span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Members */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-light">
                    <LoadingLink href={`/characters?powers=[${power.id}]`} className="font-medium uppercase text-primary">
                        Users ({powerCharacters.length})
                    </LoadingLink>
                    <CompareWithButton mode="team" ids={powerCharacters.map(c => c.id)} />
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
                    imageFocus: c.imageFocus
                }))}
            />
        </div>
    )
}