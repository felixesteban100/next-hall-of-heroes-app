import { motion } from "framer-motion";
import {
    Flame, Snowflake, Zap, Droplets, Brain, Swords, Shield, Wand2, Clock, Gem,
    Cpu, Moon, Sun, RefreshCw, Target, Orbit, Magnet, Weight, Volume2, Biohazard,
    Leaf, Feather, Maximize2, CloudRain, Wind, Mountain, Radiation, Heart, Network,
    Gauge, Search, PlusCircle, Lightbulb, Tv, EyeOff, Ghost, Footprints, CloudFog,
    Eye, Radio, ShieldAlert, Sparkles, Activity, Scissors, Crosshair, Cross, Disc,
    HandFist,
    Bug,
    PawPrint,
    WormIcon, BicepsFlexed,
    AtomIcon,
    CirclePile,
    CircleDashed
} from "lucide-react";
import { ThemeKey } from "../PowerOverlay";

const iconFx = (IconComponent: React.ElementType, colorClass: string, anim: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={anim}
        transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
        }}
        className="absolute inset-0 pointer-events-none overflow-visible z-[99] flex items-center justify-center"
    >
        <IconComponent className={`w-36 h-36 sm:w-44 sm:h-44 filter drop-shadow-[0_0_25px_currentColor] ${colorClass}`} />
    </motion.div>
);

const RANDOM_COLORS = [
    "text-amber-400",
    "text-purple-400",
    "text-cyan-400",
    "text-emerald-400",
    "text-rose-400",
    "text-indigo-400",
    "text-yellow-400",
];

// Helper to pick one random color
const getRandomColor = () =>
    RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

// 🌟 Exported as a function to evaluate fresh randomized colors on every invocation
export const getThemeOverlay = (key: ThemeKey): React.ReactNode => {
    const THEMES: Record<ThemeKey, React.ReactNode> = {
        cursedEnergy: iconFx(AtomIcon, "text-foreground", { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }),
        sense: iconFx(Eye, "text-blue-500", { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }),
        strength: iconFx(BicepsFlexed, "text-yellow-500", { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] }),
        snake: iconFx(WormIcon, "text-green-500", { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] }),
        animal: iconFx(PawPrint, getRandomColor(), { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] }),
        insect: iconFx(Bug, getRandomColor(), { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] }),
        fire: iconFx(Flame, "text-orange-500", { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] }),
        ice: iconFx(Snowflake, "text-cyan-400", { rotate: [0, 360], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }),
        lightning: iconFx(Zap, "text-yellow-400", { scale: [1, 1.25, 0.85, 1.3, 1], opacity: [0.6, 1, 0.6, 0.9, 0.6] }),
        water: iconFx(Droplets, "text-blue-500", { y: [-8, 8, -8], scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }),
        psychic: iconFx(Brain, "text-purple-400", { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }),
        combat: iconFx(HandFist, "text-red-500", { rotate: [-8, 8, -8], scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] }),
        construct: iconFx(Wand2, getRandomColor(), { scale: [1, 1.08, 1], rotate: [0, 10, 0], opacity: [0.7, 1, 0.7] }),
        teleport: iconFx(Sparkles, "text-indigo-400", { scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }),
        nullify: iconFx(ShieldAlert, "text-zinc-400", { scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] }),
        mystic: iconFx(Wand2, getRandomColor(), { rotate: [0, -15, 15, 0], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }),
        temporal: iconFx(Clock, getRandomColor(), { rotate: [360, 0], opacity: [0.7, 1, 0.7] }),
        diamond: iconFx(Gem, "text-sky-300", { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }),
        tech: iconFx(Cpu, "text-cyan-500", { opacity: [0.7, 1, 0.6, 1, 0.7], scale: [1, 1.04, 1] }),
        shadow: iconFx(Moon, "text-neutral-700", { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }),
        light: iconFx(Sun, "text-yellow-100", { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }),
        explosion: iconFx(Sparkles, "text-amber-500", { scale: [0.7, 1.3, 0.7], opacity: [0.7, 1, 0.7] }),
        transform: iconFx(RefreshCw, "text-emerald-400", { rotate: [0, 360], opacity: [0.7, 1, 0.7] }),
        archery: iconFx(Target, "text-emerald-500", { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }),
        cosmic: iconFx(Orbit, getRandomColor(), { rotate: [0, 360], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }),
        magnetic: iconFx(Magnet, "text-rose-500", { rotate: [-12, 12, -12], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }),
        gravity: iconFx(Weight, "text-purple-600", { scale: [1.1, 0.95, 1.1], opacity: [0.8, 1, 0.8] }),
        sonic: iconFx(Volume2, "text-cyan-400", { scale: [0.9, 1.2, 0.9], opacity: [0.6, 1, 0.6] }),
        poison: iconFx(Biohazard, "text-emerald-600", { y: [-5, 5, -5], opacity: [0.7, 1, 0.7] }),
        nature: iconFx(Leaf, "text-green-500", { rotate: [-5, 5, -5], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }),
        elastic: iconFx(Activity, "text-amber-300", { scaleX: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }),
        wings: iconFx(Feather, "text-sky-300", { y: [-6, 6, -6], rotate: [-3, 3, -3], opacity: [0.7, 1, 0.7] }),
        size: iconFx(Maximize2, "text-orange-500", { scale: [0.9, 1.2, 0.9], opacity: [0.7, 1, 0.7] }),
        weather: iconFx(CloudRain, "text-slate-400", { y: [-4, 4, -4], opacity: [0.7, 1, 0.7] }),
        wind: iconFx(Wind, "text-sky-200", { x: [-8, 8, -8], opacity: [0.7, 1, 0.7] }),
        earth: iconFx(Mountain, "text-stone-600", { scale: [1, 1.03, 1], y: [2, -2, 2], opacity: [0.8, 1, 0.8] }),
        radiation: iconFx(Radiation, "text-lime-400", { rotate: [0, 180, 360], opacity: [0.7, 1, 0.7] }),
        blood: iconFx(Heart, "text-red-700", { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }),
        web: iconFx(Network, "text-foreground", { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }),
        omnitrix: iconFx(Disc, "text-green-400", { rotate: [0, 360], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] } as any),
        speed: iconFx(Gauge, "text-yellow-300", { x: [-12, 12, -12], opacity: [0.7, 1, 0.7] }),
        breathing: iconFx(Wind, getRandomColor(), { scale: [0.95, 1.08, 0.95], opacity: [0.7, 1, 0.7] }),
        detective: iconFx(Search, "text-amber-600", { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }),
        defend: iconFx(Shield, "text-blue-500", { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }),
        heal: iconFx(PlusCircle, "text-emerald-400", { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }),
        revive: iconFx(Sparkles, "text-yellow-300", { scale: [0.9, 1.2, 0.9], opacity: [0.8, 1, 0.8] }),
        genius: iconFx(Lightbulb, "text-indigo-300", { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }),
        fourthWall: iconFx(Tv, "text-fuchsia-500", { opacity: [0.6, 1, 0.6, 0.9], scale: [1, 1.05, 0.98, 1] }),
        energy: iconFx(AtomIcon, getRandomColor(), { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }),
        claws: iconFx(Scissors, "text-red-600", { rotate: [-10, 10, -10], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }),
        sword: iconFx(Swords, "text-slate-300", { rotate: [-15, 15, -15], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }),
        firearms: iconFx(Crosshair, getRandomColor(), { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }),
        invisible: iconFx(EyeOff, "text-foreground", { opacity: [0.4, 0.8, 0.4], scale: [1, 1.03, 1] }),
        intangible: iconFx(Ghost, "text-blue-300", { y: [-6, 6, -6], opacity: [0.5, 0.85, 0.5] }),
        stealth: iconFx(Footprints, "text-foreground/80", { opacity: [0.6, 0.9, 0.6] }),
        mist: iconFx(CloudFog, "text-slate-300", { x: [-10, 10, -10], opacity: [0.5, 0.85, 0.5] }),
        heatVision: iconFx(Eye, "text-red-500", { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }),
        absorb: iconFx(CirclePile, getRandomColor(), { scale: [1.1, 0.95, 1.1], opacity: [0.7, 1, 0.7] }),
        shockwave: iconFx(Activity, "text-orange-500", { scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] }),
        none: iconFx(CircleDashed, "text-foreground", { rotate: [-8, 8, -8], scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] }),
    };

    return THEMES[key] || THEMES.none;
};