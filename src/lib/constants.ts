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
    type LucideIcon,
    FileQuestionMark,
} from "lucide-react";

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
    3: "Trained Discipline / Mystic Arts", // (Doctor Strange, Scarlet Witch)
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
    },
    // Mutant/Powered — orange, biological heat, raw innate energy
    1: {
        bg: "bg-orange-400 dark:bg-orange-700",
        text: "text-orange-600 dark:text-orange-400",
        foreground: "text-white dark:text-white",
    },
    // Tech/Gadget-based — sky blue, clean, engineered, precise
    2: {
        bg: "bg-sky-500 dark:bg-sky-700",
        text: "text-sky-600 dark:text-sky-400",
        foreground: "text-white dark:text-white",
    },
    // Trained Discipline / Mystic Arts — violet, arcane, spiritual, otherworldly
    3: {
        bg: "bg-violet-500 dark:bg-violet-700",
        text: "text-violet-600 dark:text-violet-400",
        foreground: "text-white dark:text-white",
    },
    // Skill/Peak Human — emerald, natural, disciplined, earned through grind
    4: {
        bg: "bg-emerald-400 dark:bg-emerald-700",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
    },
    // Cosmic/God-tier — fuchsia, beyond nature, divine, reality-warping
    5: {
        bg: "bg-fuchsia-600 dark:bg-fuchsia-800",
        text: "text-fuchsia-600 dark:text-fuchsia-400",
        foreground: "text-white dark:text-white",
    },
} as const;

export const CHARACTER_TIER_COLOR = {
    // Unranked — neutral gray
    0: {
        bg: "bg-zinc-200 dark:bg-zinc-700",
        text: "text-zinc-500 dark:text-zinc-400",
        foreground: "text-white dark:text-white",
    },
    // Street level — stone/earthy
    1: {
        bg: "bg-stone-200 dark:bg-stone-700",
        text: "text-stone-600 dark:text-stone-400",
        foreground: "text-white dark:text-white",
    },
    // Skilled / Enhanced — teal
    2: {
        bg: "bg-teal-500 dark:bg-teal-700",
        text: "text-teal-600 dark:text-teal-400",
        foreground: "text-white dark:text-white",
    },
    // Superhuman — indigo
    3: {
        bg: "bg-indigo-500 dark:bg-indigo-700",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
    },
    // Powerhouse — amber/gold
    4: {
        bg: "bg-amber-400 dark:bg-amber-600",
        text: "text-amber-600 dark:text-amber-400",
        foreground: "text-white dark:text-white",
    },
    // Cosmic / World-ending — rose
    5: {
        bg: "bg-rose-600 dark:bg-rose-800",
        text: "text-rose-600 dark:text-rose-400",
        foreground: "text-white dark:text-white",
    },
} as const;

export const POWER_TIER_COLOR = {
    // Unrated — slate gray
    0: {
        bg: "bg-slate-200 dark:bg-slate-800",
        text: "text-slate-500 dark:text-slate-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-slate-500"
    },
    // Minor / Latent — subtle gray-green
    1: {
        bg: "bg-zinc-300 dark:bg-zinc-700",
        text: "text-zinc-600 dark:text-zinc-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-zinc-500"
    },
    // Tactical / Basic — cool blue
    2: {
        bg: "bg-blue-400 dark:bg-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-blue-500"

    },
    // Enhanced / Substantial — cyan/teal
    3: {
        bg: "bg-cyan-500 dark:bg-cyan-700",
        text: "text-cyan-600 dark:text-cyan-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-cyan-500"

    },
    // Advanced / Potent — emerald
    4: {
        bg: "bg-emerald-500 dark:bg-emerald-700",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-emerald-500"

    },
    // High Tier / Disaster — yellow/amber
    5: {
        bg: "bg-yellow-500 dark:bg-yellow-700",
        text: "text-yellow-600 dark:text-yellow-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-yellow-500"

    },
    // Supreme / Calamity — orange
    6: {
        bg: "bg-orange-500 dark:bg-orange-700",
        text: "text-orange-600 dark:text-orange-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-orange-500"

    },
    // Planetary / World Breaker — intense red
    7: {
        bg: "bg-red-600 dark:bg-red-800",
        text: "text-red-600 dark:text-red-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-red-500"

    },
    // Stellar / Cosmic — deep purple
    8: {
        bg: "bg-purple-600 dark:bg-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-purple-500"

    },
    // Universal / Transcendent — dark violet/indigo
    9: {
        bg: "bg-indigo-600 dark:bg-indigo-900",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-indigo-500"
    },
    // Absolute / Omnipotent — golden amber/fuchsia gradient feel
    10: {
        bg: "bg-amber-500 dark:bg-amber-700",
        text: "text-amber-500 dark:text-amber-300",
        foreground: "text-white dark:text-white",
        progress: "[&>div]:bg-amber-500"

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
    },
    // Cartoon — energetic amber/yellow
    cartoon: {
        bg: "bg-amber-500 dark:bg-amber-700",
        text: "text-amber-600 dark:text-amber-400",
        foreground: "text-white dark:text-white",
    },
    // Comic — primary blue
    comic: {
        bg: "bg-blue-600 dark:bg-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        foreground: "text-white dark:text-white",
    },
    // Game — electric violet/purple
    game: {
        bg: "bg-violet-600 dark:bg-violet-800",
        text: "text-violet-600 dark:text-violet-400",
        foreground: "text-white dark:text-white",
    },
    // Movie — sleek red/crimson
    movie: {
        bg: "bg-red-600 dark:bg-red-800",
        text: "text-red-600 dark:text-red-400",
        foreground: "text-white dark:text-white",
    },
    // TV Show — indigo/teal accent
    "tv show": {
        bg: "bg-indigo-500 dark:bg-indigo-700",
        text: "text-indigo-600 dark:text-indigo-400",
        foreground: "text-white dark:text-white",
    },
    // Real Life — grounded slate/emerald
    "real life": {
        bg: "bg-emerald-600 dark:bg-emerald-800",
        text: "text-emerald-600 dark:text-emerald-400",
        foreground: "text-white dark:text-white",
    },
    "unknown": {
        bg: "bg-slate-600 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        foreground: "text-white dark:text-white",
    },
} as const;