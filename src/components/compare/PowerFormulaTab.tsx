import React, { useState } from "react";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare/scoringUtils";
import { aggregateTeamScores } from "@/lib/compare/teamUtils";
import { Shield, Zap, Skull, Award, Users, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Cpu, Activity } from "lucide-react";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { CharacterImage } from "../shared/CharacterImage";

interface PowerFormulaTabProps {
    sideA: CharacterWithJoinTeamUniversePowerEnemies[];
    sideB: CharacterWithJoinTeamUniversePowerEnemies[];
    labelA?: string;
    labelB?: string;
    variant: string;
}

export const PowerFormulaTab: React.FC<PowerFormulaTabProps> = ({
    sideA,
    sideB,
    labelA = "Team A",
    labelB = "Team B",
    variant
}) => {
    const isTeamA = sideA.length > 1;
    const isTeamB = sideB.length > 1;

    const teamAData = aggregateTeamScores(sideA);
    const teamBData = aggregateTeamScores(sideB);

    return (
        <div className="w-full space-y-6 py-2">
            {/* Cinematic Section Header */}
            <div className="text-center space-y-1 mb-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${variant}/10 border border-${variant}/20 text-${variant} text-xs font-bold tracking-wider uppercase mb-1`}>
                    <Activity className="w-3.5 h-3.5 animate-pulse" /> Power Matrix Breakdown
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Battle Analytics &amp; Scoring Engine
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Deep dive into squad composition weightings, member attributes, and synergy multipliers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SIDE A */}
                <SideFormulaCard
                    title={labelA}
                    entities={sideA}
                    aggregate={teamAData}
                    isTeam={isTeamA}
                    variant="primary"
                />

                {/* SIDE B */}
                <SideFormulaCard
                    title={labelB}
                    entities={sideB}
                    aggregate={teamBData}
                    isTeam={isTeamB}
                    variant="secondary"
                />
            </div>
        </div>
    );
};

const SideFormulaCard = ({
    title,
    entities,
    aggregate,
    isTeam,
    variant
}: {
    title: string;
    entities: CharacterWithJoinTeamUniversePowerEnemies[];
    aggregate: ReturnType<typeof aggregateTeamScores>;
    isTeam: boolean;
    variant: string
}) => {
    const [expandedMemberId, setExpandedMemberId] = useState<number | null>(
        entities.length === 1 ? entities[0]?.id ?? null : null
    );

    const aceRaw = aggregate.ace?.overall || 0;
    const aceContribution = (aceRaw * 0.65).toFixed(1);

    const medianRaw = aggregate.rosterMedian || 0;
    const medianContribution = (medianRaw * 0.35).toFixed(1);

    const isPrimary = variant === "primary";
    const accentBorder = isPrimary ? "border-primary" : "border-secondary";
    const accentBg = isPrimary ? "bg-primary/5" : "bg-secondary/5";
    const accentText = isPrimary ? "text-primary" : "text-secondary";

    const toggleMember = (id: number) => {
        setExpandedMemberId(expandedMemberId === id ? null : id);
    };

    return (
        <div className={`bg-card/80 backdrop-blur-md border ${accentBorder}/30  ${accentBg} rounded-2xl p-5 space-y-5 `}>
            {/* Header & Final Power Estimate */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Squad Analysis</span>
                    <h4 className="text-xl font-black text-foreground tracking-tight">{title}</h4>
                </div>
                <div className="text-right bg-background/50 border border-border/40 px-4 py-2 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Power Rating</span>
                    <span className={`text-2xl sm:text-3xl font-black ${accentText}`}>
                        {isTeam ? aggregate.powerEstimate : (computeMatchScore(entities[0])?.overall ?? 0)}
                    </span>
                </div>
            </div>

            {/* TEAM SQUAD MATRIX SUMMARY */}
            {isTeam && (
                <div className="space-y-3 bg-card/60 backdrop-blur-sm p-4 rounded-xl border border-border/60 ">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" /> Squad Composition Matrix
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                            Ace (65%) + Median (35%) + Chemistry
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Ace Card */}
                        <div className="p-2.5 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm flex flex-col justify-between">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-primary opacity-90">
                                Lead Ace (65%)
                            </div>
                            <div className="text-base font-black text-foreground my-0.5">+{aceContribution}</div>
                            <div className="text-[10px] font-medium text-muted-foreground truncate px-1">
                                {aggregate.aceName ?? "N/A"}
                            </div>
                        </div>

                        {/* Median Depth */}
                        <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm flex flex-col justify-between">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400 opacity-90">
                                Roster Depth (35%)
                            </div>
                            <div className="text-base font-black text-foreground my-0.5">+{medianContribution}</div>
                            <div className="text-[10px] font-medium text-muted-foreground">
                                Median ({medianRaw})
                            </div>
                        </div>

                        {/* Chemistry */}
                        <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm flex flex-col justify-between">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-purple-400 opacity-90">
                                Chemistry
                            </div>
                            <div className="text-base font-black text-foreground my-0.5">+{aggregate.chemistryBoost}</div>
                            <div className="text-[10px] font-medium text-muted-foreground">
                                {aggregate.chemistry?.score ?? 0}% Synergy
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INDIVIDUAL MEMBER BREAKDOWNS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    <span className="flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-amber-500" /> Roster Breakdown
                    </span>
                    <span className="text-[10px] font-semibold bg-muted/60 px-2 py-0.5 rounded-md">
                        {entities.length} Fighter{entities.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {entities.sort((e1, e2) => computeMatchScore(e2).overall - computeMatchScore(e1).overall).map((entity) => {
                        const score = computeMatchScore(entity);
                        const isExpanded = expandedMemberId === entity.id;
                        const TierIcon = CHARACTER_TIER_ICON[entity.tier]
                        const ClassIcon = CHARACTER_CLASS_ICON[entity.class]
                        const tierName = CHARACTER_TIER[entity.tier as keyof typeof CHARACTER_TIER].split("/")[0]
                        const classCharName = CHARACTER_CLASS[entity.class as keyof typeof CHARACTER_CLASS].split("/")[0]

                        return (
                            <div
                                key={entity.id}
                                className="border border-border/60 rounded-xl overflow-hidden transition-all bg-card/40 hover:bg-card/70 "
                            >
                                {/* Member Row Header */}
                                <button
                                    onClick={() => toggleMember(entity.id)}
                                    className="w-full flex items-center justify-between p-3.5 text-left transition-colors"
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 ${accentBorder} shrink-0 bg-background/50 `}>
                                            <CharacterImage
                                                src={entity.images?.md || "/placeholder.png"}
                                                alt={entity.name}
                                                imageFocus={entity.imageFocus}
                                                fill
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-foreground truncate">{entity.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5 truncate">
                                                <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                                                    <TierIcon size="10" className={CHARACTER_TIER_COLOR[entity.tier as keyof typeof CHARACTER_TIER_COLOR]?.text ?? ""} />
                                                    T-{entity.tier ?? 0} {tierName}
                                                </span>
                                                <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded truncate">
                                                    <ClassIcon size="10" className={CHARACTER_CLASS_COLOR[entity.class as keyof typeof CHARACTER_CLASS_COLOR]?.text ?? ""} />
                                                    C-{entity.class ?? 0} {classCharName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 shrink-0 pl-2">
                                        <div className="text-right">
                                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-semibold">Overall</span>
                                            <span className={`text-base font-black ${accentText}`}>{score.overall}</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Mathematical Weights Breakdown */}
                                {isExpanded && (
                                    <div className="p-4 border-t border-border/40 space-y-3.5 bg-background/30 text-xs">
                                        <div className="text-[10px] font-semibold text-muted-foreground bg-card/60 p-2 rounded-lg border border-border/40 text-center">
                                            Formula: (Stats &times; 35%) + (Tier &times; 22%) + (Powers &times; 25%) + (Threat &times; 10%) + (Class &times; 8%)
                                        </div>

                                        <div className="space-y-2.5">
                                            <WeightBar
                                                icon={<Zap className="w-3.5 h-3.5 text-blue-400" />}
                                                label="Powerstats Average"
                                                weight="35%"
                                                raw={score.averagePowerStats}
                                                calculated={score.averagePowerStats * 0.35}
                                                color="bg-blue-500"
                                            />
                                            <WeightBar
                                                icon={<Award className="w-3.5 h-3.5 text-purple-400" />}
                                                label="Power Tier Score"
                                                weight="22%"
                                                raw={score.tier}
                                                calculated={score.tier * 0.22}
                                                color="bg-purple-500"
                                            />
                                            <WeightBar
                                                icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                                                label="Powers Score"
                                                weight="25%"
                                                raw={score.powers}
                                                calculated={score.powers * 0.25}
                                                color="bg-cyan-500"
                                            />
                                            <WeightBar
                                                icon={<Skull className="w-3.5 h-3.5 text-rose-400" />}
                                                label="Threat / Enemies"
                                                weight="10%"
                                                raw={score.threat}
                                                calculated={score.threat * 0.10}
                                                color="bg-rose-500"
                                            />
                                            <WeightBar
                                                icon={<Shield className="w-3.5 h-3.5 text-emerald-400" />}
                                                label="Character Class"
                                                weight="8%"
                                                raw={score.class}
                                                calculated={score.class * 0.08}
                                                color="bg-emerald-500"
                                            />

                                            {score.weaknessPenalty > 0 && (
                                                <div className="flex justify-between items-center bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 text-destructive text-xs font-semibold">
                                                    <span className="flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Weakness Vulnerability Penalty
                                                    </span>
                                                    <span className="font-mono">-{score.weaknessPenalty} pts</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const WeightBar = ({
    icon,
    label,
    weight,
    raw,
    calculated,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    weight: string;
    raw: number;
    calculated: number;
    color: string;
}) => {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-foreground/80 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                    {icon} {label} <span className="text-[10px] text-muted-foreground font-semibold">({weight})</span>
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                    {raw.toFixed(1)} &rarr; <span className="font-bold text-foreground">+{calculated.toFixed(1)}</span>
                </span>
            </div>
            <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-300 rounded-full`} style={{ width: `${Math.min(100, raw)}%` }} />
            </div>
        </div>
    );
};