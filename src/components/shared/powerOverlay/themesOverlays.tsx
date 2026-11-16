import { motion } from "framer-motion";
import {
    Flame, Snowflake, Zap, Droplets, Brain, Swords, Shield, Wand2, Clock, Gem,
    Cpu, Moon, Sun, RefreshCw, Target, Orbit, Magnet, Weight, Volume2, Biohazard,
    Leaf, Feather, Maximize2, CloudRain, Wind, Mountain, Radiation, Heart, Network,
    Gauge, Search, PlusCircle, Lightbulb, Tv, EyeOff, Ghost, Footprints, CloudFog,
    Eye, ShieldAlert, Sparkles, Activity, Scissors, Crosshair, Cross, Disc,
    HandFist,
    Bug,
    PawPrint,
    WormIcon, BicepsFlexed,
    AtomIcon,
    CirclePile,
    CircleDashed,
    Dices
} from "lucide-react";
import { ThemeKey } from "./PowerOverlay";
import { Ninjutsu } from "./Ninjutsu";

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
        className="absolute inset-0 pointer-events-none overflow-visible z-99 flex items-center justify-center"
    >
        <IconComponent className={`w-36 h-36 sm:w-44 sm:h-44 filter drop-shadow-[0_0_25px_currentColor] ${colorClass}`} />
    </motion.div>
);

const rainbowAnimation = {
    filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
    scale: [1, 1.12, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
        filter: { duration: 6, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

export const getThemeOverlay = (key: ThemeKey): React.ReactNode => {
    return getThemeDetails(key).node;
};

type ThemeConfigEntry = {
    icon: React.ElementType;
    color: string | (() => string);
    animation: Record<string, any>;
};


export const getThemeDetails = (key: ThemeKey) => {
    const config = THEME_CONFIGS[key] || THEME_CONFIGS.none;
    const resolvedColor = typeof config.color === "function" ? config.color() : config.color;

    return {
        icon: config.icon,
        color: resolvedColor,
        animation: config.animation,
        node: iconFx(config.icon, resolvedColor, config.animation)
    };
};

const THEME_CONFIGS: Record<ThemeKey, ThemeConfigEntry> = {
    ninjutsu: { icon: Ninjutsu, color: "text-orange-400 [--ninjutsu-fill:white]", animation: { ...rainbowAnimation, /* rotate: [-8, 8, -8], */ scale: [1, 1.1, 1] } },
    probability: { icon: Dices, color: "text-red-400", animation: { ...rainbowAnimation, rotate: [-8, 8, -8], scale: [1, 1.1, 1] } },
    mystic: { icon: Wand2, color: "text-purple-400", animation: rainbowAnimation },
    temporal: { icon: Clock, color: "text-amber-400", animation: rainbowAnimation },
    cosmic: { icon: Orbit, color: "text-indigo-400", animation: rainbowAnimation },
    breathing: { icon: Wind, color: "text-sky-400", animation: rainbowAnimation },
    energy: { icon: AtomIcon, color: "text-lime-400", animation: rainbowAnimation },
    firearms: { icon: Crosshair, color: "text-orange-400", animation: rainbowAnimation },
    absorb: { icon: CirclePile, color: "text-rose-400", animation: rainbowAnimation },
    cursedEnergy: { icon: AtomIcon, color: "text-foreground", animation: { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] } },
    sense: { icon: Eye, color: "text-blue-500", animation: { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] } },
    strength: { icon: BicepsFlexed, color: "text-yellow-500", animation: { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] } },
    snake: { icon: WormIcon, color: "text-green-500", animation: { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] } },
    animal: { icon: PawPrint, color: "text-fuchsia-400", animation: rainbowAnimation },
    insect: { icon: Bug, color: "text-emerald-400", animation: rainbowAnimation },
    fire: { icon: Flame, color: "text-orange-500", animation: { scale: [1, 1.15, 0.95, 1], rotate: [-4, 4, -4, 0], opacity: [0.7, 1, 0.7] } },
    ice: { icon: Snowflake, color: "text-cyan-400", animation: { rotate: [0, 360], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } },
    lightning: { icon: Zap, color: "text-yellow-400", animation: { scale: [1, 1.25, 0.85, 1.3, 1], opacity: [0.6, 1, 0.6, 0.9, 0.6] } },
    water: { icon: Droplets, color: "text-blue-500", animation: { y: [-8, 8, -8], scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] } },
    psychic: { icon: Brain, color: "text-purple-400", animation: { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } },
    combat: { icon: HandFist, color: "text-red-500", animation: { rotate: [-8, 8, -8], scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] } },
    construct: { icon: Wand2, color: "text-cyan-400", animation: rainbowAnimation },
    teleport: { icon: Sparkles, color: "text-indigo-400", animation: { scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] } },
    nullify: { icon: ShieldAlert, color: "text-zinc-400", animation: { scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] } },
    diamond: { icon: Gem, color: "text-sky-300", animation: { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } },
    tech: { icon: Cpu, color: "text-cyan-500", animation: { opacity: [0.7, 1, 0.6, 1, 0.7], scale: [1, 1.04, 1] } },
    shadow: { icon: Moon, color: "text-neutral-700", animation: { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } },
    light: { icon: Sun, color: "text-yellow-100", animation: { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } },
    explosion: { icon: Sparkles, color: "text-amber-500", animation: { scale: [0.7, 1.3, 0.7], opacity: [0.7, 1, 0.7] } },
    transform: { icon: RefreshCw, color: "text-emerald-400", animation: { rotate: [0, 360], opacity: [0.7, 1, 0.7] } },
    archery: { icon: Target, color: "text-emerald-500", animation: { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } },
    magnetic: { icon: Magnet, color: "text-rose-500", animation: { rotate: [-12, 12, -12], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] } },
    gravity: { icon: Weight, color: "text-purple-600", animation: { scale: [1.1, 0.95, 1.1], opacity: [0.8, 1, 0.8] } },
    sonic: { icon: Volume2, color: "text-cyan-400", animation: { scale: [0.9, 1.2, 0.9], opacity: [0.6, 1, 0.6] } },
    poison: { icon: Biohazard, color: "text-emerald-600", animation: { y: [-5, 5, -5], opacity: [0.7, 1, 0.7] } },
    nature: { icon: Leaf, color: "text-green-500", animation: { rotate: [-5, 5, -5], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } },
    elastic: { icon: Activity, color: "text-amber-300", animation: { scaleX: [1, 1.25, 1], opacity: [0.7, 1, 0.7] } },
    wings: { icon: Feather, color: "text-sky-300", animation: { y: [-6, 6, -6], rotate: [-3, 3, -3], opacity: [0.7, 1, 0.7] } },
    size: { icon: Maximize2, color: "text-orange-500", animation: { scale: [0.9, 1.2, 0.9], opacity: [0.7, 1, 0.7] } },
    weather: { icon: CloudRain, color: "text-slate-400", animation: { y: [-4, 4, -4], opacity: [0.7, 1, 0.7] } },
    wind: { icon: Wind, color: "text-sky-200", animation: { x: [-8, 8, -8], opacity: [0.7, 1, 0.7] } },
    earth: { icon: Mountain, color: "text-stone-600", animation: { scale: [1, 1.03, 1], y: [2, -2, 2], opacity: [0.8, 1, 0.8] } },
    radiation: { icon: Radiation, color: "text-lime-400", animation: { rotate: [0, 180, 360], opacity: [0.7, 1, 0.7] } },
    blood: { icon: Heart, color: "text-red-700", animation: { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } },
    web: { icon: Network, color: "text-foreground", animation: { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } },
    omnitrix: { icon: Disc, color: "text-green-400", animation: { rotate: [0, 360], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] } },
    speed: { icon: Gauge, color: "text-yellow-300", animation: { x: [-12, 12, -12], opacity: [0.7, 1, 0.7] } },
    detective: { icon: Search, color: "text-amber-600", animation: { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] } },
    defend: { icon: Shield, color: "text-blue-500", animation: { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] } },
    heal: { icon: PlusCircle, color: "text-emerald-400", animation: { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] } },
    revive: { icon: Sparkles, color: "text-yellow-300", animation: { scale: [0.9, 1.2, 0.9], opacity: [0.8, 1, 0.8] } },
    genius: { icon: Lightbulb, color: "text-indigo-300", animation: { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } },
    fourthWall: { icon: Tv, color: "text-fuchsia-500", animation: { opacity: [0.6, 1, 0.6, 0.9], scale: [1, 1.05, 0.98, 1] } },
    claws: { icon: Scissors, color: "text-red-600", animation: { rotate: [-10, 10, -10], scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] } },
    sword: { icon: Swords, color: "text-slate-300", animation: { rotate: [-15, 15, -15], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } },
    invisible: { icon: EyeOff, color: "text-foreground", animation: { opacity: [0.4, 0.8, 0.4], scale: [1, 1.03, 1] } },
    intangible: { icon: Ghost, color: "text-blue-300", animation: { y: [-6, 6, -6], opacity: [0.5, 0.85, 0.5] } },
    stealth: { icon: Footprints, color: "text-foreground/80", animation: { opacity: [0.6, 0.9, 0.6] } },
    mist: { icon: CloudFog, color: "text-slate-300", animation: { x: [-10, 10, -10], opacity: [0.5, 0.85, 0.5] } },
    heatVision: { icon: Eye, color: "text-red-500", animation: { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] } },
    shockwave: { icon: Activity, color: "text-orange-500", animation: { scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] } },
    none: { icon: CircleDashed, color: "text-foreground", animation: { rotate: [-8, 8, -8], scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] } },
};