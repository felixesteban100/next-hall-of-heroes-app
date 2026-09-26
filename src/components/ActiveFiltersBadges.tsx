"use client"

import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON } from "@/lib/constants";
import { getCharacterAlignmentColor, getCharacterAlignmentText } from "@/lib/character_utils";
import { Power } from "@/types";
import { Frown, Globe, LetterText, type LucideIcon, Mars, Meh, Smile, UserPen, Venus, X, Zap } from "lucide-react";
import { Button } from "./ui/button";

type ActiveFilter = {
    label: string;
    display: string;
    icon: LucideIcon;
    colorText?: string;
    colorBg?: string;
    paramKey: string;
};

export type ActiveFiltersBadgesProps = {
    name: string,
    gender: string,
    alignment: string,
    universe: string,
    tier: number,
    character_class: number,
    powersParam: string[],
    powers: Power[],
    character_type: string,
    onRemove?: (key: string) => void;
}

export default function ActiveFiltersBadges({ name, gender, alignment, universe, tier, character_class, powersParam, powers, character_type, onRemove }: ActiveFiltersBadgesProps) {
    const activeFilters: ActiveFilter[] = [];

    if (name) activeFilters.push({ label: "Name", display: name, icon: LetterText, paramKey: "name" });

    if (gender) activeFilters.push({
        label: "Gender",
        display: gender,
        icon: gender === "Male" ? Mars : Venus,
        paramKey: "gender"
    });

    if (alignment) activeFilters.push({
        label: "Alignment",
        display: getCharacterAlignmentText(alignment),
        icon: alignment === "good" ? Smile : alignment === "bad" ? Frown : Meh,
        colorText: getCharacterAlignmentText(alignment),
        colorBg: getCharacterAlignmentColor(alignment), paramKey: "alignment"
    });

    if (universe) activeFilters.push({ label: "Universe", display: universe, icon: Globe, paramKey: "universe" });

    if (!Number.isNaN(tier)) {
        const tierKey = tier as keyof typeof CHARACTER_TIER;
        activeFilters.push({
            label: "Tier",
            display: CHARACTER_TIER[tierKey],
            icon: CHARACTER_TIER_ICON[tierKey],
            colorText: CHARACTER_TIER_COLOR[tierKey].foreground,
            colorBg: CHARACTER_TIER_COLOR[tierKey].bg, paramKey: "tier"
        });
    }

    if (!Number.isNaN(character_class)) {
        const classKey = character_class as keyof typeof CHARACTER_CLASS;
        const classLabel = CHARACTER_CLASS[classKey];
        if (classLabel) {
            activeFilters.push({
                label: "Class",
                display: classLabel,
                icon: CHARACTER_CLASS_ICON[classKey],
                colorText: CHARACTER_CLASS_COLOR[classKey].foreground,
                colorBg: CHARACTER_CLASS_COLOR[classKey].bg, paramKey: "class"
            });
        }
    }

    if (powersParam.length > 0) {
        const powerNames = powers
            .filter(p => powersParam.map(Number).includes(p.id))
            .map(p => p.name);
        activeFilters.push({ label: "Powers", display: powerNames.join(", "), icon: Zap, paramKey: "powers" });
    }

    if (character_type) activeFilters.push({ label: "Character Type", display: character_type, icon: UserPen, paramKey: "character_type" });

    // console.log("Active Filters:", activeFilters); // Debugging line

    return (
        <div>
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map((f) => {
                        const Icon = f.icon;
                        return (
                            <span
                                key={f.label}
                                className={`capitalize inline-flex items-center gap-1 text-xs ${f.colorText ?? "text-muted-foreground"} font-bold ${f.colorBg ?? "bg-muted"} rounded-full px-3 py-1`}
                            >
                                <Icon size={10} />
                                {f.display}
                                {onRemove && (
                                    <button
                                        onClick={() => onRemove(f.paramKey)}
                                        className="ml-1 hover:opacity-70 transition-opacity"
                                        aria-label={`Remove ${f.label} filter`}
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
