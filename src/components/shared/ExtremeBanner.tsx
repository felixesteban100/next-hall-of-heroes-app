"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Dna, Cog, Dumbbell, Orbit, Ban, Footprints, FlaskConical, Feather, Crown, Activity, Swords, Skull, Globe, Sun, Infinity, Tv, Gamepad2, Film, BookOpen, User, Clapperboard, FileQuestionMark, Sword, ShieldAlert, Workflow, Layers, Play, Pause, Clock, Flame, Shield, Zap, Star, Sparkles, Info, TrendingUp, Trophy, AlertCircle, LucideIcon } from "lucide-react";
// import { Flame, Shield, Zap, Star, Sparkles, Info, TrendingUp, Trophy, AlertCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAlignmentIcon } from "@/lib/character_utils";
import { getCharacterGenderIcon } from "@/lib/character_utils";
import { CHARACTER_CLASS_ICON, CHARACTER_TIER_ICON, POWER_TIER_ICON } from "@/lib/constants";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BannerIcon =
    | "flame" | "shield" | "zap" | "star" | "sparkles"
    | "info" | "trending" | "trophy" | "alert" | "good" | "neutral" | "bad"
    | "male" | "female" | `character_class_${0 | 1 | 2 | 3 | 4 | 5}`
    | `character_tier_${0 | 1 | 2 | 3 | 4 | 5}` | `power_tier_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
    | "anime" | "cartoon" | "comic" | "game" | "movie" | "tv show" | "real life" | "unknown"
    | "offensive" | "defensive" | "control" | "utility" | "hybrid / versatile"
    | "instant" | "action" | "passive" | "channeled";

export type BannerItem = {
    /** Short label shown in the banner */
    label: string;
    /** Icon key — resolved to a Lucide icon internally */
    icon: BannerIcon;
    /** Tailwind classes for bg + text + border, e.g. "bg-amber-500/15 text-amber-400 border border-amber-500/25" */
    color: string;
};

const ICON_MAP: Record<BannerIcon, LucideIcon> = {
    flame: Flame,
    shield: Shield,
    zap: Zap,
    star: Star,
    sparkles: Sparkles,
    info: Info,
    trending: TrendingUp,
    trophy: Trophy,
    alert: AlertCircle,
    good: getAlignmentIcon("good"),
    neutral: getAlignmentIcon("neutral"),
    bad: getAlignmentIcon("bad"),
    male: getCharacterGenderIcon("male"),
    female: getCharacterGenderIcon("female"),
    character_class_0: CHARACTER_CLASS_ICON[0],
    character_class_1: CHARACTER_CLASS_ICON[1],
    character_class_2: CHARACTER_CLASS_ICON[2],
    character_class_3: CHARACTER_CLASS_ICON[3],
    character_class_4: CHARACTER_CLASS_ICON[4],
    character_class_5: CHARACTER_CLASS_ICON[5],
    character_tier_0: CHARACTER_TIER_ICON[0],
    character_tier_1: CHARACTER_TIER_ICON[1],
    character_tier_2: CHARACTER_TIER_ICON[2],
    character_tier_3: CHARACTER_TIER_ICON[3],
    character_tier_4: CHARACTER_TIER_ICON[4],
    character_tier_5: CHARACTER_TIER_ICON[5],
    power_tier_0: POWER_TIER_ICON[0],
    power_tier_1: POWER_TIER_ICON[1],
    power_tier_2: POWER_TIER_ICON[2],
    power_tier_3: POWER_TIER_ICON[3],
    power_tier_4: POWER_TIER_ICON[4],
    power_tier_5: POWER_TIER_ICON[5],
    power_tier_6: POWER_TIER_ICON[6],
    power_tier_7: POWER_TIER_ICON[7],
    power_tier_8: POWER_TIER_ICON[8],
    power_tier_9: POWER_TIER_ICON[9],
    power_tier_10: POWER_TIER_ICON[10],
    anime: Sparkles,
    cartoon: Clapperboard,
    comic: BookOpen,
    game: Gamepad2,
    movie: Film,
    "tv show": Tv,
    "real life": User,
    "unknown": FileQuestionMark,
    "offensive": Sword,
    "defensive": ShieldAlert,
    "control": Workflow,
    "utility": Sparkles,
    "hybrid / versatile": Layers,
    "instant": Zap,
    "action": Play,
    "passive": Pause,
    "channeled": Clock,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ExtremeBannerProps {
    items: BannerItem[];
    /** Ms between auto-rotations. Default 3500. Set 0 to disable auto-rotate. */
    interval?: number;
    className?: string;
}

export function ExtremeBanner({ items, interval = 3500, className }: ExtremeBannerProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0); // reset when items change
    }, [items]);

    useEffect(() => {
        if (items.length <= 1 || interval === 0) return;
        const id = setInterval(() => setIndex(i => (i + 1) % items.length), interval);
        return () => clearInterval(id);
    }, [items.length, interval]);

    if (items.length === 0) return null;

    const current = items[index];
    const Icon = ICON_MAP[current.icon.toLowerCase() as BannerIcon] ?? Info;

    return (
        /* overflow-hidden */
        <div className={cn("relative h-7 w-full", className)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.22 }}
                    className={cn(
                        "absolute inset-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit",
                        current.color
                    )}
                >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate text-ellipsis">{current.label}</span>

                    {/* Dot indicators when there are multiple items */}
                    {items.length > 1 && (
                        <span className="ml-1 flex gap-0.5">
                            {items.map((_, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "inline-block size-1 rounded-full transition-all",
                                        i === index ? "bg-current opacity-100" : "bg-current opacity-30"
                                    )}
                                />
                            ))}
                        </span>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}