import { cn } from "@/lib/utils";

export type CombatActionType = "attack" | "defend" | "heal" | "revive";

interface PowerOverlayProps {
    action: CombatActionType;
    powerName?: string;
    side?: "left" | "right";
}

interface OverlayConfig {
    gradient: string;
    border: string;
    glow: string;
    extraEffects: React.ReactNode;
}

// 🎨 Highly Iconic & Instantly Recognizable Visual Signatures
const THEMES: Record<string, OverlayConfig> = {
    // 🧠 Psychic / Telekinesis / Telepathy / Mind Control (Expanding Psi-Wave Rings)
    psychic: {
        gradient: "bg-gradient-to-t from-fuchsia-950/90 via-pink-600/80 to-violet-400/60",
        border: "border-pink-300 shadow-[0_0_35px_#ec4899,inset_0_0_30px_#d946ef]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Concentric Telekinetic Psi-Shockwaves */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-pink-200 shadow-[0_0_25px_#ec4899] animate-ping" style={{ animationDuration: "1s" }} />
                    <div className="absolute w-10 h-10 rounded-full border border-fuchsia-100 shadow-[0_0_15px_#d946ef] animate-ping" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
                </div>
                {/* Mind Distortion Aura */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.3)_0%,_transparent_70%)] animate-pulse" style={{ animationDuration: "0.6s" }} />
            </>
        ),
    },

    // 👊 Heavy Melee / Martial Arts / Superhuman Strength (Impact Shockwaves & Kinetic Sparks)
    combat: {
        gradient: "bg-gradient-to-tr from-red-950/90 via-orange-600/80 to-amber-300/60",
        border: "border-orange-400 shadow-[0_0_35px_#f97316,inset_0_0_30px_#ef4444]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Expanding Kinetic Impact Shockwave Rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-orange-300/80 shadow-[0_0_20px_#fdba74] animate-ping" style={{ animationDuration: "0.5s" }} />
                    <div className="absolute w-8 h-8 rounded-full border-2 border-yellow-200/90 shadow-[0_0_15px_#fde047] animate-ping" style={{ animationDelay: "150ms", animationDuration: "0.4s" }} />
                </div>

                {/* High-Speed Strike Streaks */}
                <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent shadow-[0_0_12px_#fde047] transform -skew-y-12 animate-pulse" style={{ animationDuration: "0.2s" }} />
                <div className="absolute bottom-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent shadow-[0_0_12px_#fdba74] transform skew-y-12 animate-pulse" style={{ animationDelay: "100ms", animationDuration: "0.25s" }} />
            </>
        ),
    },

    // 🧊 Cryokinesis / Ice / Frost / Blizzard
    ice: {
        gradient: "bg-gradient-to-tr from-cyan-950/90 via-blue-600/80 to-sky-200/60",
        border: "border-cyan-200 shadow-[0_0_35px_#22d3ee,inset_0_0_25px_#e0f2fe]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Floating Crystalline Shards */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 rotate-45 bg-white shadow-[0_0_15px_#22d3ee] animate-ping" style={{ animationDuration: "0.9s" }} />
                <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rotate-12 bg-cyan-100 shadow-[0_0_12px_#38bdf8] animate-ping" style={{ animationDelay: "200ms", animationDuration: "1.2s" }} />
                <div className="absolute top-1/2 left-1/3 w-2 h-2 rotate-45 bg-sky-200 shadow-[0_0_10px_#7dd3fc] animate-ping" style={{ animationDelay: "400ms", animationDuration: "1s" }} />

                {/* Sweeping Frost Wind Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-cyan-400/10 to-transparent animate-pulse" style={{ animationDuration: "1.5s" }} />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-100 to-transparent shadow-[0_0_10px_#22d3ee]" />
            </>
        ),
    },

    // 🕸️ Web-Slinger / Elasticity (White Web Grid)
    web: {
        gradient: "bg-gradient-to-tr from-red-700/80 via-blue-900/60 to-slate-200/40",
        border: "border-white shadow-[0_0_20px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,0.8)]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Iconic Web Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(255,255,255,0.8)_31%,_transparent_32%)] animate-ping" style={{ animationDuration: "1.2s" }} />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/90 transform rotate-45 origin-top-left" />
                <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white/90 transform -rotate-45 origin-top-right" />
            </>
        ),
    },

    // ⌚ Omnitrix / Alien Transformation (Iconic Neon Lime Dial)
    omnitrix: {
        gradient: "bg-gradient-to-t from-emerald-950 via-green-500/90 to-lime-300/60",
        border: "border-lime-300 shadow-[0_0_30px_#22c55e,inset_0_0_30px_#86efac]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Omnitrix Hourglass Shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-lime-400 clip-path-hourglass opacity-90 animate-ping" style={{ animationDuration: "0.8s" }} />
                </div>
                <div className="absolute inset-2 border-2 border-dashed border-lime-200 rounded-full animate-spin" style={{ animationDuration: "3s" }} />
            </>
        ),
    },

    // 🌌 Sorcery / Magic / Mystic Arts (Orange Mandala Spell Circles)
    mystic: {
        gradient: "bg-gradient-to-tr from-amber-700/90 via-orange-600/80 to-yellow-300/50",
        border: "border-amber-300 shadow-[0_0_30px_#f59e0b,inset_0_0_25px_#fde047]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Spinning Doctor Strange Mystic Ring */}
                <div className="absolute inset-1 border-2 border-amber-300 rounded-full animate-spin border-t-transparent border-b-transparent" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-3 border-2 border-yellow-200 rotate-45 border-l-transparent border-r-transparent animate-spin" style={{ animationDuration: "1.5s" }} />
            </>
        ),
    },

    // ⚡ Electrokinesis / Speedster Blitz (Electric Yellow Plasma Bolts)
    lightning: {
        gradient: "bg-gradient-to-b from-yellow-300/95 via-cyan-400/70 to-transparent",
        border: "border-yellow-200 shadow-[0_0_35px_#facc15,inset_0_0_25px_#fef08a]",
        glow: "animate-pulse-gold",
        extraEffects: (
            <>
                <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-white via-yellow-300 to-transparent transform -skew-x-25 animate-pulse shadow-[0_0_25px_#facc15]" style={{ animationDuration: "0.12s" }} />
                <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-cyan-200 via-yellow-200 to-transparent transform skew-x-25 animate-pulse shadow-[0_0_25px_#38bdf8]" style={{ animationDelay: "60ms", animationDuration: "0.15s" }} />
            </>
        ),
    },

    // 🌊 Water / Hydrokinesis (Deep Blue & Rising Bubbles)
    water: {
        gradient: "bg-gradient-to-t from-blue-900/95 via-blue-600/80 to-cyan-400/60",
        border: "border-blue-300 shadow-[0_0_35px_#1d4ed8,inset_0_0_25px_#60a5fa]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Rising Bubbles */}
                <div className="absolute bottom-1 w-2 h-2 bg-white rounded-full opacity-70 animate-bounce" style={{ left: "20%", animationDuration: "1s" }} />
                <div className="absolute bottom-2 w-1.5 h-1.5 bg-cyan-100 rounded-full opacity-70 animate-bounce" style={{ left: "50%", animationDelay: "300ms", animationDuration: "1.3s" }} />
                <div className="absolute bottom-0 w-2 h-2 bg-white rounded-full opacity-70 animate-bounce" style={{ left: "80%", animationDelay: "600ms", animationDuration: "1.1s" }} />
                {/* Tidal Splash */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/40 via-blue-700/20 to-transparent animate-pulse" />
            </>
        ),
    },

    // ⏳ Temporal / Time Travel (Golden Clockwork Pulse)
    temporal: {
        gradient: "bg-gradient-to-tr from-amber-800/90 via-yellow-500/75 to-amber-200/60",
        border: "border-yellow-300 shadow-[0_0_30px_#eab308,inset_0_0_25px_#fef08a]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                {/* Clock Face Gear Rings */}
                <div className="absolute inset-1 rounded-full border-2 border-dashed border-yellow-200 animate-spin" style={{ animationDuration: "4s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-yellow-100 rounded-full animate-ping" style={{ animationDuration: "1.2s" }} />
            </>
        ),
    },

    // 💎 Diamond Form / Invulnerability (Prismatic Crystal Shards)
    diamond: {
        gradient: "bg-gradient-to-tr from-cyan-300/90 via-white/80 to-blue-200/60",
        border: "border-white shadow-[0_0_30px_#ffffff,inset_0_0_25px_#a5f3fc]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rotate-45 shadow-[0_0_20px_#ffffff] animate-ping" style={{ animationDuration: "0.8s" }} />
                <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-cyan-100 rotate-45 shadow-[0_0_20px_#22d3ee] animate-ping" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
            </>
        ),
    },

    // ⚙️ Cybernetic / Android / Tech (Neon Scanline Grid)
    tech: {
        gradient: "bg-gradient-to-t from-blue-900/90 via-cyan-500/80 to-indigo-900/50",
        border: "border-cyan-300 shadow-[0_0_30px_#06b6d4,inset_0_0_25px_#67e8f9]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                <div className="absolute left-0 right-0 h-2 bg-cyan-200 shadow-[0_0_20px_#22d3ee] animate-bounce" style={{ top: "25%", animationDuration: "0.3s" }} />
                <div className="absolute left-0 right-0 h-2 bg-blue-300 shadow-[0_0_20px_#38bdf8] animate-bounce" style={{ top: "75%", animationDelay: "150ms", animationDuration: "0.35s" }} />
            </>
        ),
    },

    // 🔥 Pyrokinesis / Inferno (Fallback Attack Aesthetic)
    fire: {
        gradient: "bg-gradient-to-t from-red-700/95 via-orange-600/80 to-yellow-400/60",
        border: "border-yellow-400 shadow-[0_0_35px_#ef4444,inset_0_0_30px_#f97316]",
        glow: "animate-pulse",
        extraEffects: (
            <>
                <div className="absolute -bottom-2 left-1/5 w-4 h-14 bg-gradient-to-t from-yellow-300 via-orange-500 to-transparent rounded-full filter blur-[1px] animate-bounce" style={{ animationDuration: "0.3s" }} />
                <div className="absolute -bottom-2 right-1/5 w-4 h-16 bg-gradient-to-t from-yellow-200 via-red-600 to-transparent rounded-full filter blur-[1px] animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.4s" }} />
            </>
        ),
    },

    // 🛡️ Shield Block (Defend Action)
    defend: {
        gradient: "bg-gradient-to-t from-cyan-700/85 via-blue-600/50 to-teal-300/30",
        border: "border-cyan-300 shadow-[0_0_30px_#06b6d4,inset_0_0_25px_#67e8f9]",
        glow: "animate-pulse",
        extraEffects: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-cyan-200 shadow-[0_0_20px_#22d3ee] animate-ping" style={{ animationDuration: "1s" }} />
            </div>
        ),
    },

    // ⚕️ Heal
    heal: {
        gradient: "bg-gradient-to-t from-emerald-800/90 via-green-500/60 to-teal-300/30",
        border: "border-emerald-300 shadow-[0_0_30px_#10b981,inset_0_0_25px_#6ee7b7]",
        glow: "animate-pulse",
        extraEffects: (
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-emerald-200 rounded-full shadow-[0_0_15px_#34d399] animate-ping" style={{ animationDuration: "0.9s" }} />
        ),
    },

    // 🔄 Revive
    revive: {
        gradient: "bg-gradient-to-t from-purple-900/95 via-fuchsia-600/70 to-pink-400/40",
        border: "border-purple-300 shadow-[0_0_35px_#c084fc,inset_0_0_25px_#f472b6]",
        glow: "animate-pulse",
        extraEffects: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-purple-200 shadow-[0_0_25px_#c084fc] animate-ping" style={{ animationDuration: "1.2s" }} />
            </div>
        ),
    },
};

// 🔍 Smart Matcher to assign powers directly to their iconic theme
function getThemeKey(action: CombatActionType, powerName?: string): keyof typeof THEMES {
    const fallback = "combat"

    if (action === "defend") return "defend";
    if (action === "heal") return "heal";
    if (action === "revive") return "revive";

    if (!powerName) return fallback;
    const name = powerName.toLowerCase();

    // 🚀 Check for Water first to fix the bug shown in image
    if (name.includes("strength") || name.includes("hand-to-hand") || name.includes("combat") || name.includes("martial") || name.includes("claw") || name.includes("brawl") || name.includes("strike") || name.includes("punch")) return "combat";
    if (name.includes("water") || name.includes("hydro") || name.includes("aqua") || name.includes("ocean") || name.includes("flood") || name.includes("tidal") || name.includes("aquatic")) return "water";
    if (name.includes("ice") || name.includes("cryo") || name.includes("frost") || name.includes("cold") || name.includes("freeze") || name.includes("blizzard") || name.includes("arctic") || name.includes("glacial")) return "ice";
    if (name.includes("web") || name.includes("elastic")) return "web";
    if (name.includes("omnitrix") || name.includes("transformation") || name.includes("metamorphosis")) return "omnitrix";
    if (name.includes("sorcery") || name.includes("magic") || name.includes("mystic") || name.includes("reality")) return "mystic";
    if (name.includes("lightning") || name.includes("electric") || name.includes("speed") || name.includes("reflex")) return "lightning";
    if (name.includes("temporal") || name.includes("time")) return "temporal";
    if (name.includes("diamond") || name.includes("invulnerability") || name.includes("force field")) return "diamond";
    if (name.includes("tech") || name.includes("cyber") || name.includes("android") || name.includes("gadget")) return "tech";
    if (name.includes("telepath") || name.includes("telekinesis") || name.includes("psychic") || name.includes("mind") || name.includes("illusion")) return "psychic";
    if (name.includes("dark") || name.includes("shadow") || name.includes("fear") || name.includes("cursed") || name.includes("blood")) return "shadow";
    if (name.includes("fire") || name.includes("heat") || name.includes("pyro") || name.includes("explosion") || name.includes("inferno")) return "fire";

    return fallback; // Default attack aura
}

export default function PowerOverlay({ action, powerName }: PowerOverlayProps) {
    const themeKey = getThemeKey(action, powerName);
    const config = THEMES[themeKey] || THEMES.fire;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10 mix-blend-screen transition-opacity duration-300">
            {/* Core Gradient Aura */}
            <div className={cn("absolute inset-0 opacity-90", config.gradient, config.glow)} />

            {/* Glowing Border Frame */}
            <div className={cn("absolute inset-0 border-2 rounded-lg", config.border)} />

            {/* Signature Power Animation Effects */}
            {config.extraEffects}
        </div>
    );
}