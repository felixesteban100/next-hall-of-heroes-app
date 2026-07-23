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
    type LucideIcon,
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

export const CHARACTER_CLASS = {
    0: "Unassigned",
    1: "Mutant/Powered", // (born with abilities — X-Men, most DBZ Saiyans)
    2: "Tech/Gadget-based", // (Iron Man, Batman, Batwing — no innate powers, all engineering)
    3: "Trained Discipline / Mystic Arts", // (Doctor Strange, Scarlet Witch)
    4: "Skill/Peak Human", // (Akashi, Black Widow — no superpowers, pure trained ability)
    5: "Cosmic/God-tier", // (Thanos, Goku at his strongest, Superman)
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

// export const CHARACTER_CLASS_COLOR = {
//     0: { bg: "bg-zinc-100 dark:bg-zinc-100", text: "text-zinc-500 dark:text-zinc-500", hoverBg: "hover:bg-zinc-100", hoverText: "hover:text-zinc-700", solid: "bg-zinc-500" },
//     1: { bg: "bg-orange-100 dark:bg-orange-100", text: "text-orange-500 dark:text-orange-500", hoverBg: "hover:bg-orange-100", hoverText: "hover:text-orange-800", solid: "bg-orange-500" },
//     2: { bg: "bg-blue-100 dark:bg-blue-100", text: "text-blue-500 dark:text-blue-500", hoverBg: "hover:bg-blue-100", hoverText: "hover:text-blue-800", solid: "bg-blue-500" },
//     3: { bg: "bg-violet-100 dark:bg-violet-100", text: "text-violet-500 dark:text-violet-500", hoverBg: "hover:bg-violet-100", hoverText: "hover:text-violet-800", solid: "bg-violet-500" },
//     4: { bg: "bg-emerald-100 dark:bg-emerald-100", text: "text-emerald-500 dark:text-emerald-500", hoverBg: "hover:bg-emerald-100", hoverText: "hover:text-emerald-800", solid: "bg-emerald-500" },
//     5: { bg: "bg-amber-100 dark:bg-amber-100", text: "text-amber-500 dark:text-amber-500", hoverBg: "hover:bg-amber-100", hoverText: "hover:text-amber-800", solid: "bg-amber-500" },
// } as const;

export const CHARACTER_TIER = {
    0: "Unranked",
    1: "Street level",
    2: "Skilled / Enhanced",
    3: "Superhuman",
    4: "Powerhouse",
    5: "Cosmic / World-ending",
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

// export const CHARACTER_TIER_COLOR = {
//     0: { bg: "bg-zinc-100 dark:bg-zinc-500 dark:bg-zinc-500", text: "text-zinc-500 dark:text-zinc-500", hoverBg: "hover:bg-zinc-100", hoverText: "hover:text-zinc-700", solid: "bg-zinc-500" },
//     1: { bg: "bg-foreground-500 dark:bg-foreground-500", text: "text-foreground-500 dark:text-foreground-500", hoverBg: "hover:bg-foreground-100", hoverText: "hover:text-foreground-700", solid: "bg-foreground-500" },
//     2: { bg: "bg-cyan-500 dark:bg-cyan-500", text: "text-cyan-500 dark:text-cyan-500", hoverBg: "hover:bg-cyan-100", hoverText: "hover:text-cyan-800", solid: "bg-cyan-500" },
//     3: { bg: "bg-blue-500 dark:bg-blue-500", text: "text-blue-500 dark:text-blue-500", hoverBg: "hover:bg-blue-100", hoverText: "hover:text-blue-800", solid: "bg-blue-500" },
//     4: { bg: "bg-purple-500 dark:bg-purple-500", text: "text-purple-500 dark:text-purple-500", hoverBg: "hover:bg-purple-100", hoverText: "hover:text-purple-800", solid: "bg-purple-500" },
//     5: { bg: "bg-red-500 dark:bg-red-500", text: "text-red-500 dark:text-red-500", hoverBg: "hover:bg-red-100", hoverText: "hover:text-red-800", solid: "bg-red-500" },
// } as const;
