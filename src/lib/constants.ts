import {
    HelpCircle,
    Dna,
    Cog,
    Sparkles,
    Dumbbell,
    Orbit,
    Ban,
    Footprints,
    Zap,
    FlaskConical,
    Crown,
    Flame,
    Feather,
    Shield,
    Activity,
    Swords,
    Skull,
    Globe,
    Sun,
    Infinity,
    Tv,
    Gamepad2,
    Film,
    BookOpen,
    User,
    Clapperboard,
    FileQuestionMark,
    Sword,
    ShieldAlert,
    Workflow,
    Layers,
    Play,
    Pause,
    Clock,
    type LucideIcon,
} from "lucide-react";

import { PowerRole } from "@/types";

export const CHARACTER_CLASS_ICON: Record<number, LucideIcon> = {
    0: HelpCircle,      // Unassigned — unknown/unclassified
    1: Dna,             // Mutant/Powered — innate, genetic/biological origin
    2: Cog,             // Tech/Gadget-based — engineering, machinery
    3: Sparkles,        // Trained Discipline / Mystic Arts — magic, chakra, curse energy
    4: Dumbbell,        // Skill/Peak Human — physical training, no powers
    5: Orbit,           // Cosmic/God-tier — planetary/universal scale
};

export const CHARACTER_TIER_ICON: Record<number, LucideIcon> = {
    0: Ban,             // Unranked — not yet scored
    1: Footprints,      // Street level — grounded, on-foot, mundane threat
    2: Zap,             // Skilled / Enhanced — a spark above normal
    3: FlaskConical,    // Superhuman — augmented/experimental power
    4: Crown,           // Powerhouse — dominant, top of their world
    5: Flame,           // Cosmic / World-ending — total destructive force
};

export const POWER_TIER_ICON: Record<number, LucideIcon> = {
    0: HelpCircle,      // Unrated — unknown or passive ability
    1: Feather,         // Minor / Latent — slight edge, subtle effect
    2: Shield,          // Tactical / Basic — combat-useful, local scale
    3: Activity,        // Enhanced / Substantial — noticeable output, city block
    4: Zap,             // Advanced / Potent — heavy destruction or high utility
    5: Swords,          // High Tier / Disaster — city-wide, threat to armies
    6: Skull,           // Supreme / Calamity — country/continent level threat
    7: Globe,           // Planetary / World Breaker — planet-altering force
    8: Sun,             // Stellar / Cosmic — star system/galaxy scale
    9: Orbit,           // Universal / Transcendent — reality/spacetime scale
    10: Infinity,       // Absolute / Omnipotent — unbounded, divine authority
};

export const CHARACTER_CLASS = {
    1: "Mutant/Powered", // (born with abilities — X-Men, most DBZ Saiyans)
    2: "Tech/Gadget-based", // (Iron Man, Batman, Batwing — no innate powers, all engineering)
    3: "Trained Discipline/Mystic Arts", // (Doctor Strange, Scarlet Witch)
    4: "Skill/Peak Human", // (Akashi, Black Widow — no superpowers, pure trained ability)
    5: "Cosmic/God-tier", // (Thanos, Goku at his strongest, Superman)
    0: "Unassigned",
} as const;

export const CHARACTER_CLASS_ORDER = [1, 2, 3, 4, 5, 0] as const;

export const CHARACTER_TIER = {
    1: "Street level",
    2: "Skilled / Enhanced",
    3: "Superhuman",
    4: "Powerhouse",
    5: "Cosmic / World-ending",
    0: "Unranked",
} as const;

export const CHARACTER_TIER_ORDER = [1, 2, 3, 4, 5, 0] as const;

export const POWER_TIER = {
    1: "Minor / Latent",
    2: "Tactical / Basic",
    3: "Enhanced / Substantial",
    4: "Advanced / Potent",
    5: "High Tier / Disaster",
    6: "Supreme / Calamity",
    7: "Planetary / World Breaker",
    8: "Stellar / Cosmic",
    9: "Universal / Transcendent",
    10: "Absolute / Omnipotent",
    0: "Unrated",
} as const;

export const CHARACTER_CLASS_COLOR = {
    // Unassigned — neutral, no identity yet
    0: {
        bg: "bg-slate-200 dark:bg-slate-700",
        text: "text-slate-500 dark:text-slate-400",
        foreground: "text-white dark:text-white",
        badge: "bg-slate-200/15 text-slate-500 border border-slate-200/25",
        var: "var(--color-slate-500)",
    },
    // Mutant/Powered — orange, biological heat, raw innate energy
    1: {
        bg: "bg-orange-400 dark:bg-orange-700",
        text: "text-orange-600 dark:text-orange-400",
        foreground: "text-white dark:text-white",
        badge: "bg-orange-400/15 text-orange-600 border border-orange-400/25",
        var: "var(--color-orange-500)",
    },
    // Tech/Gadget-based — sky blue, clean, engineered, precise
    2: {
        bg: "bg-sky-500 dark:bg-sky-700",
        text: "text-sky-600 dark:text-sky-400",
        foreground: "text-white dark:text-white",
        badge: "bg-sky-500/15 text-sky-600 border border-sky-500/25",
        var: "var(--color-sky-500)",
    },
    // Trained Discipline / Mystic Arts — violet, arcane, spiritual, otherworldly
    3: {
        bg: "bg-violet-500 dark:bg-violet-700",
        text: "text-violet-600 dark:text-violet-400",
        foreground: "text-white dark:text-white",
        badge: "bg-violet-500/15 text-violet-600 border border-violet-500/25",
        var: "var(--color-violet-500)",
    },
    // Skill/Peak Human — emerald, natural, disciplined, earned through grind
    4: {
        bg: "bg-emerald-400 dark:bg-emerald-700",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
        badge: "bg-emerald-400/15 text-emerald-600 border border-emerald-400/25",
        var: "var(--color-emerald-500)",
    },
    // Cosmic/God-tier — fuchsia, beyond nature, divine, reality-warping
    5: {
        bg: "bg-fuchsia-600 dark:bg-fuchsia-800",
        text: "text-fuchsia-600 dark:text-fuchsia-400",
        foreground: "text-white dark:text-white",
        badge: "bg-fuchsia-600/15 text-fuchsia-600 border border-fuchsia-600/25",
        var: "var(--color-fuchsia-500)",
    },
} as const;

export const CHARACTER_TIER_COLOR = {
    // Unranked — neutral gray
    0: {
        bg: "bg-zinc-200 dark:bg-zinc-700",
        text: "text-zinc-500 dark:text-zinc-400",
        foreground: "text-white dark:text-white",
        badge: "bg-zinc-200/15 text-zinc-500 border border-zinc-200/25",
        var: "var(--color-zinc-500)",
    },
    // Street level — stone/earthy
    1: {
        bg: "bg-stone-200 dark:bg-stone-700",
        text: "text-stone-600 dark:text-stone-400",
        foreground: "text-white dark:text-white",
        badge: "bg-stone-200/15 text-stone-600 border border-stone-200/25",
        var: "var(--color-stone-500)",
    },
    // Skilled / Enhanced — teal
    2: {
        bg: "bg-teal-500 dark:bg-teal-700",
        text: "text-teal-600 dark:text-teal-400",
        foreground: "text-white dark:text-white",
        badge: "bg-teal-500/15 text-teal-600 border border-teal-500/25",
        var: "var(--color-teal-500)",
    },
    // Superhuman — indigo
    3: {
        bg: "bg-indigo-500 dark:bg-indigo-700",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
        badge: "bg-indigo-500/15 text-indigo-600 border border-indigo-500/25",
        var: "var(--color-indigo-500)",
    },
    // Powerhouse — amber/gold
    4: {
        bg: "bg-amber-400 dark:bg-amber-600",
        text: "text-amber-600 dark:text-amber-400",
        foreground: "text-white dark:text-white",
        badge: "bg-amber-400/15 text-amber-600 border border-amber-400/25",
        var: "var(--color-amber-500)",
    },
    // Cosmic / World-ending — rose
    5: {
        bg: "bg-rose-600 dark:bg-rose-800",
        text: "text-rose-600 dark:text-rose-400",
        foreground: "text-white dark:text-white",
        badge: "bg-rose-600/15 text-rose-600 border border-rose-600/25",
        var: "var(--color-rose-500)",
    },
} as const;

export const POWER_TIER_COLOR = {
    // Unrated — slate gray
    0: {
        bg: "bg-slate-200 dark:bg-slate-800",
        text: "text-slate-500 dark:text-slate-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-slate-500",
        badge: "bg-slate-200/15 text-slate-500 border border-slate-200/25",
        var: "var(--color-slate-500)",
    },
    // Minor / Latent — subtle gray-green
    1: {
        bg: "bg-zinc-300 dark:bg-zinc-700",
        text: "text-zinc-600 dark:text-zinc-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-zinc-500",
        badge: "bg-zinc-300/15 text-zinc-600 border border-zinc-300/25",
        var: "var(--color-zinc-500)",
    },
    // Tactical / Basic — cool blue
    2: {
        bg: "bg-blue-400 dark:bg-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-blue-500",
        badge: "bg-blue-400/15 text-blue-600 border border-blue-400/25",
        var: "var(--color-blue-500)",
    },
    // Enhanced / Substantial — cyan/teal
    3: {
        bg: "bg-cyan-500 dark:bg-cyan-700",
        text: "text-cyan-600 dark:text-cyan-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-cyan-500",
        badge: "bg-cyan-500/15 text-cyan-600 border border-cyan-500/25",
        var: "var(--color-cyan-500)",
    },
    // Advanced / Potent — emerald
    4: {
        bg: "bg-emerald-500 dark:bg-emerald-700",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-emerald-500",
        badge: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25",
        var: "var(--color-emerald-500)",

    },
    // High Tier / Disaster — yellow/amber
    5: {
        bg: "bg-yellow-500 dark:bg-yellow-700",
        text: "text-yellow-600 dark:text-yellow-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-yellow-500",
        badge: "bg-yellow-500/15 text-yellow-600 border border-yellow-500/25",
        var: "var(--color-yellow-500)",

    },
    // Supreme / Calamity — orange
    6: {
        bg: "bg-orange-500 dark:bg-orange-700",
        text: "text-orange-600 dark:text-orange-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-orange-500",
        badge: "bg-orange-500/15 text-orange-600 border border-orange-500/25",
        var: "var(--color-orange-500)",

    },
    // Planetary / World Breaker — intense red
    7: {
        bg: "bg-red-600 dark:bg-red-800",
        text: "text-red-600 dark:text-red-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-red-500",
        badge: "bg-red-600/15 text-red-600 border border-red-600/25",
        var: "var(--color-red-500)",
    },
    // Stellar / Cosmic — deep purple
    8: {
        bg: "bg-purple-600 dark:bg-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-purple-500",
        badge: "bg-purple-600/15 text-purple-600 border border-purple-600/25",
        var: "var(--color-purple-500)",
    },
    // Universal / Transcendent — dark violet/indigo
    9: {
        bg: "bg-indigo-600 dark:bg-indigo-900",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-indigo-500",
        badge: "bg-indigo-600/15 text-indigo-600 border border-indigo-600/25",
        var: "var(--color-indigo-500)",
    },
    // Absolute / Omnipotent — golden amber/fuchsia gradient feel
    10: {
        bg: "bg-amber-500 dark:bg-amber-700",
        text: "text-amber-500 dark:text-amber-300",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-amber-500",
        badge: "bg-amber-500/15 text-amber-600 border border-amber-500/25",
        var: "var(--color-amber-500)",
    },
} as const;

export const CHARACTER_TYPES = ["anime", "cartoon", "comic", "game", "movie", "tv show", "real life", "unknown"] as const;

export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const CHARACTER_TYPE_LABEL: Record<CharacterType, string> = {
    anime: "Anime",
    cartoon: "Cartoon",
    comic: "Comic Book",
    game: "Video Game",
    movie: "Movie",
    "tv show": "TV Show",
    "real life": "Real Life",
    "unknown": "Unknown"
};

export const CHARACTER_TYPE_ICON: Record<CharacterType, LucideIcon> = {
    anime: Sparkles,       // Japanese animation / stylised art
    cartoon: Clapperboard, // Western animated series
    comic: BookOpen,       // Graphic novels / comic books
    game: Gamepad2,        // Video game characters
    movie: Film,           // Feature films / cinematic
    "tv show": Tv,         // Live-action TV series
    "real life": User,     // Historical & real-world figures
    "unknown": FileQuestionMark, // "" empty string or unknown
};

export const CHARACTER_TYPE_COLOR = {
    // Anime — vibrant rose/pink
    anime: {
        bg: "bg-rose-500 dark:bg-rose-700",
        text: "text-rose-600 dark:text-rose-400",
        foreground: "text-white dark:text-white",
        badge: "bg-rose-500/15 text-rose-600 border border-rose-500/25",
        var: "var(--color-rose-500)",
    },
    // Cartoon — energetic amber/yellow
    cartoon: {
        bg: "bg-amber-500 dark:bg-amber-700",
        text: "text-amber-600 dark:text-amber-400",
        foreground: "text-white dark:text-white",
        badge: "bg-amber-500/15 text-amber-600 border border-amber-500/25",
        var: "var(--color-amber-500)",
    },
    // Comic — primary blue
    comic: {
        bg: "bg-blue-600 dark:bg-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        foreground: "text-white dark:text-white",
        badge: "bg-blue-600/15 text-blue-600 border border-blue-600/25",
        var: "var(--color-blue-500)",
    },
    // Game — electric violet/purple
    game: {
        bg: "bg-violet-600 dark:bg-violet-800",
        text: "text-violet-600 dark:text-violet-400",
        foreground: "text-white dark:text-white",
        badge: "bg-violet-600/15 text-violet-600 border border-violet-600/25",
        var: "var(--color-violet-500)",
    },
    // Movie — sleek red/crimson
    movie: {
        bg: "bg-red-600 dark:bg-red-800",
        text: "text-red-600 dark:text-red-400",
        foreground: "text-white dark:text-white",
        badge: "bg-red-600/15 text-red-600 border border-red-600/25",
        var: "var(--color-red-500)",
    },
    // TV Show — indigo/teal accent
    "tv show": {
        bg: "bg-indigo-500 dark:bg-indigo-700",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
        badge: "bg-indigo-500/15 text-indigo-600 border border-indigo-500/25",
        var: "var(--color-indigo-500)",
    },
    // Real Life — grounded slate/emerald
    "real life": {
        bg: "bg-emerald-600 dark:bg-emerald-800",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
        badge: "bg-emerald-600/15 text-emerald-600 border border-emerald-600/25",
        var: "var(--color-emerald-500)",
    },
    "unknown": {
        bg: "bg-slate-600 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        foreground: "text-white dark:text-white",
        badge: "bg-slate-600/15 text-slate-600 border border-slate-600/25",
        var: "var(--color-slate-500)",
    },
} as const;

/** Character tier → contribution (matches CHARACTER_TIER) */
export const TIER_SCORE: Record<number, number> = {
    0: 5,   // Unranked
    1: 20,  // Street level
    2: 40,  // Skilled / Enhanced
    3: 60,  // Superhuman
    4: 80,  // Powerhouse
    5: 100, // Cosmic / World-ending
};

/**
 * Class is origin/style, not raw power — keep the spread tighter
 * so Cosmic class doesn't auto-beat a Powerhouse mutant.
 */
export const CLASS_SCORE: Record<number, number> = {
    0: 10, // Unassigned
    1: 55, // Mutant/Powered
    2: 45, // Tech/Gadget-based
    3: 50, // Trained Discipline / Mystic Arts
    4: 35, // Skill/Peak Human
    5: 70, // Cosmic/God-tier
};

/** Power ability tier → multiplier / points (matches POWER_TIER 0–10) */
export const POWER_TIER_SCORE: Record<number, number> = {
    0: 5,   // Unrated
    1: 12,  // Minor / Latent
    2: 22,  // Tactical / Basic
    3: 35,  // Enhanced / Substantial
    4: 48,  // Advanced / Potent
    5: 60,  // High Tier / Disaster
    6: 72,  // Supreme / Calamity
    7: 82,  // Planetary / World Breaker
    8: 90,  // Stellar / Cosmic
    9: 96,  // Universal / Transcendent
    10: 100, // Absolute / Omnipotent
};

export const POWER_COMBAT_ROLE_ICON: Record<PowerRole, LucideIcon> = {
    "Offensive": Sword,                 // Direct damage / attacks
    "Defensive": ShieldAlert,           // Shields / damage mitigation
    "Control": Workflow,                // Crowd control / restriction
    "Utility": Sparkles,                // Movement / healing / support
    "Hybrid / Versatile": Layers,       // Multi-role / shifting
};

export const POWER_COMBAT_ROLE_COLOR = {
    "Offensive": {
        bg: "bg-rose-500 dark:bg-rose-700 text-white",
        text: "text-rose-600 dark:text-rose-400",
        badge: "bg-rose-600/15 text-rose-600 border border-rose-600/25",
        var: "var(--color-rose-500)",
    },
    "Defensive": {
        bg: "bg-blue-500 dark:bg-blue-700 text-white",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-600/15 text-blue-600 border border-blue-600/25",
        var: "var(--color-blue-500)",
    },
    "Control": {
        bg: "bg-purple-500 dark:bg-purple-700 text-white",
        text: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-600/15 text-purple-600 border border-purple-600/25",
        var: "var(--color-purple-500)",
    },
    "Utility": {
        bg: "bg-emerald-500 dark:bg-emerald-700 text-white",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-600/15 text-emerald-600 border border-emerald-600/25",
        var: "var(--color-emerald-500)",
    },
    "Hybrid / Versatile": {
        bg: "bg-amber-500 dark:bg-amber-700 text-white",
        text: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-600/15 text-amber-600 border border-amber-600/25",
        var: "var(--color-amber-500)",
    },
} as const;

export const POWER_ACTIVATION_TYPE_ICON: Record<string, LucideIcon> = {
    "Instant": Zap,
    "Action": Play,
    "Passive": Pause,
    "Channeled": Clock,
};

export const POWER_ACTIVATION_TYPE_COLOR = {
    "Instant": { text: "text-amber-500 dark:text-amber-500", bg: "bg-amber-500 text-white", badge: "bg-amber-500/15 text-amber-500 border border-amber-500/25", var: "var(--color-amber-500)", },
    "Action": { text: "text-blue-500 dark:text-blue-500", bg: "bg-blue-500 text-white", badge: "bg-blue-500/15 text-blue-500 border border-blue-500/25", var: "var(--color-blue-500)", },
    "Passive": { text: "text-emerald-500 dark:text-emerald-500", bg: "bg-emerald-500 text-white", badge: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25", var: "var(--color-emerald-500)", },
    "Channeled": { text: "text-purple-500 dark:text-purple-500", bg: "bg-purple-500 text-white", badge: "bg-purple-500/15 text-purple-500 border border-purple-500/25", var: "var(--color-purple-500)", },
} as const;