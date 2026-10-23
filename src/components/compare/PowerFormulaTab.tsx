import React, { useState } from "react";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "@/lib/compare/scoringUtils";
import { aggregateTeamScores } from "@/lib/compare/teamUtils";
import { Shield, Zap, Skull, Award, Users, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, TIER_SCORE } from "@/lib/constants";
import { CharacterImage } from "../shared/CharacterImage";

interface PowerFormulaTabProps {
    sideA: CharacterWithJoinTeamUniversePowerEnemies[];
    sideB: CharacterWithJoinTeamUniversePowerEnemies[];
    labelA?: string;
    labelB?: string;
}

export const PowerFormulaTab: React.FC<PowerFormulaTabProps> = ({
    sideA,
    sideB,
    labelA = "Team A",
    labelB = "Team B",
}) => {
    const isTeamA = sideA.length > 1;
    const isTeamB = sideB.length > 1;

    const teamAData = aggregateTeamScores(sideA);
    const teamBData = aggregateTeamScores(sideB);

    return (
        <div className="w-full space-y-8 py-4">
            {/* Mode Header */}
            <div className="text-center space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    Power &amp; Scoring Calculation Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Individual scores computed via <code className="text-cyan-600 font-mono">computeMatchScore</code> &amp; team aggregates via <code className="text-cyan-600 font-mono">teamUtils</code>
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

    const badgeBg =
        variant === "primary"
            ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300"
            : "bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/50 text-teal-700 dark:text-teal-300";

    const toggleMember = (id: number) => {
        setExpandedMemberId(expandedMemberId === id ? null : id);
    };

    return (
        <div className="bg-card/20 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-6">
            {/* Top Header & Final Power Estimate */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Side Analysis</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h4>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Final Estimate</span>
                    <span className={`text-3xl font-black text-${variant}`}>
                        {isTeam ? aggregate.powerEstimate : (computeMatchScore(entities[0])?.overall ?? 0)}
                    </span>
                </div>
            </div>

            {/* TEAM SYNERGY SUMMARY (If Team Mode) */}
            {/* TEAM SQUAD MATRIX SUMMARY */}
            {isTeam && (
                <div className="space-y-3 bg-card/30 backdrop-blur-md p-4 rounded-xl border border-muted-foreground/30 ">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-cyan-500" /> Weighted Squad Matrix
                        Formula
                    </div>

                    <div className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center shadow-inner">
                        Power Estimate = Ace (65%) + Median Depth (35%) + Chemistry
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Ace Card */}
                        <div
                            className={`p-2.5 rounded-xl border backdrop-blur-sm ${badgeBg}`}
                        >
                            <div className="text-[9px] font-bold uppercase opacity-80">
                                Ace (65%)
                            </div>
                            <div className="text-sm font-black">+{aceContribution}</div>
                            <div className="text-[9px] opacity-75 truncate">
                                {aggregate.aceName ?? "N/A"} ({aceRaw})
                            </div>
                        </div>

                        {/* Median Depth */}
                        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 p-2.5 rounded-xl backdrop-blur-sm">
                            <div className="text-[9px] text-blue-700 dark:text-blue-400 font-bold uppercase">
                                Median (35%)
                            </div>
                            <div className="text-sm font-black text-blue-600 dark:text-blue-300">
                                +{medianContribution}
                            </div>
                            <div className="text-[9px] text-slate-500">
                                Depth ({medianRaw})
                            </div>
                        </div>

                        {/* Chemistry */}
                        <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 p-2.5 rounded-xl backdrop-blur-sm">
                            <div className="text-[9px] text-purple-700 dark:text-purple-400 font-bold uppercase">
                                Chemistry
                            </div>
                            <div className="text-sm font-black text-purple-600 dark:text-purple-300">
                                +{aggregate.chemistryBoost}
                            </div>
                            <div className="text-[9px] text-slate-500">
                                {aggregate.chemistry?.score ?? 0}% Synergy
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INDIVIDUAL MEMBER BREAKDOWNS (computeMatchScore) */}
            <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" /> Member Scores (`computeMatchScore`)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{entities.length} Character(s)</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
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
                                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/30"
                            >
                                {/* Member Row Header */}
                                <button
                                    onClick={() => toggleMember(entity.id)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <CharacterImage
                                            src={entity.images?.md || "/placeholder.png"}
                                            alt={entity.name}
                                            imageFocus={entity.imageFocus}
                                            className={`w-8 h-8 rounded-full object-cover border border-${variant}`}
                                        />
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{entity.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono flex gap-2">
                                                <span className="flex items-center gap-0.5">T-{entity.tier ?? 0} <TierIcon size="8" className={CHARACTER_TIER_COLOR[entity.tier as keyof typeof CHARACTER_TIER_COLOR].text} /> {tierName} </span>
                                                <span className="flex items-center gap-0.5">C-{entity.class ?? 0} <ClassIcon size="8" className={CHARACTER_CLASS_COLOR[entity.class as keyof typeof CHARACTER_CLASS_COLOR].text} /> {classCharName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase text-slate-400 block font-mono">Overall</span>
                                            <span className={`text-sm font-extrabold text-${variant}`}>{score.overall}</span>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {/* Expanded Mathematical Weights Breakdown */}
                                {isExpanded && (
                                    <div className="p-3 border-t border-slate-200 dark:border-slate-800  space-y-3 text-xs">
                                        <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 p-1.5 rounded text-center">
                                            Overall = (Stats &times; 0.35) + (Tier &times; 0.22) + (Powers &times; 0.25) + (Threat &times; 0.10) + (Class &times; 0.08) - Weakness
                                        </div>

                                        <div className="space-y-2">
                                            <WeightBar
                                                icon={<Zap className="w-3 h-3 text-blue-500" />}
                                                label="Powerstats Average"
                                                weight="35%"
                                                raw={score.averagePowerStats}
                                                calculated={score.averagePowerStats * 0.35}
                                                color="bg-blue-500"
                                            />
                                            <WeightBar
                                                icon={<Award className="w-3 h-3 text-purple-500" />}
                                                label="Power Tier Score"
                                                weight="22%"
                                                raw={score.tier}
                                                calculated={score.tier * 0.22}
                                                color="bg-purple-500"
                                            />
                                            <WeightBar
                                                icon={<Sparkles className="w-3 h-3 text-cyan-500" />}
                                                label="Powers Score"
                                                weight="25%"
                                                raw={score.powers}
                                                calculated={score.powers * 0.25}
                                                color="bg-cyan-500"
                                            />
                                            <WeightBar
                                                icon={<Skull className="w-3 h-3 text-red-500" />}
                                                label="Threat / Enemies"
                                                weight="10%"
                                                raw={score.threat}
                                                calculated={score.threat * 0.10}
                                                color="bg-red-500"
                                            />
                                            <WeightBar
                                                icon={<Shield className="w-3 h-3 text-emerald-500" />}
                                                label="Character Class Score"
                                                weight="8%"
                                                raw={score.class}
                                                calculated={score.class * 0.08}
                                                color="bg-emerald-500"
                                            />

                                            {score.weaknessPenalty > 0 && (
                                                <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/30 p-2 rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <AlertTriangle className="w-3 h-3" /> Weakness Penalty (-3 per weakness)
                                                    </span>
                                                    <span className="font-mono font-bold">-{score.weaknessPenalty} pts</span>
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
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                    {icon} {label} <span className="text-[10px] text-slate-400 font-mono">({weight})</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                    {raw.toFixed(1)} &rarr; <span className="font-bold text-slate-800 dark:text-slate-100">+{calculated.toFixed(1)}</span>
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${Math.min(100, raw)}%` }} />
            </div>
        </div>
    );
};