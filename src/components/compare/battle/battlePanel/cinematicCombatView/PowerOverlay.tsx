"use client";

import { cn } from "@/lib/utils";

export type CombatActionType = "attack" | "defend" | "heal" | "revive";

interface PowerOverlayProps {
    action: CombatActionType;
    powerName?: string;
    side?: "left" | "right";
    visible?: boolean;
}

type ThemeKey =
    | "psychic" | "combat" | "ice" | "water" | "fire" | "lightning"
    | "mystic" | "temporal" | "diamond" | "tech" | "shadow" | "light"
    | "cosmic" | "magnetic" | "gravity" | "sonic" | "poison" | "nature"
    | "wind" | "earth" | "radiation" | "blood" | "web" | "omnitrix"
    | "defend" | "heal" | "revive" | "genius" | "fourthWall";

interface OverlayConfig {
    plate: string;
    bloom: string;
    rim: string;
    motion: React.ReactNode;
}

const THEMES: Record<ThemeKey, OverlayConfig> = {
    fourthWall: {
        plate:
            "bg-gradient-to-br from-white/25 via-rose-500/20 to-sky-500/25",
        bloom:
            "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55)_0%,transparent_55%)]",
        rim:
            "border-white shadow-[0_0_0_2px_#000,0_0_28px_rgba(255,255,255,0.7),inset_0_0_20px_rgba(0,0,0,0.15)]",
        motion: (
            <>
                {/* Halftone dots */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,#000_0.9px,transparent_1px)] bg-[size:6px_6px]" />

                {/* Comic panel gutters */}
                <div className="absolute inset-2 border-[3px] border-black/90 rounded-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]" />
                <div className="absolute top-1 left-1 right-[40%] bottom-[55%] border-2 border-black/80 bg-white/10" />
                <div className="absolute bottom-1 right-1 left-[45%] top-[60%] border-2 border-black/80 bg-white/10" />

                {/* Slash “tear” in the page */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[3px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_12px_#fff] animate-po-pulse-soft" style={{ animationDuration: "0.8s" }} />
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] -translate-x-1/2 bg-black/80" />

                {/* Floating “caption boxes” */}
                <div className="absolute top-3 left-3 h-2 w-10 rounded-sm bg-yellow-300 border border-black/80 animate-po-pulse-soft" style={{ animationDuration: "1.1s" }} />
                <div className="absolute bottom-3 right-3 h-2 w-8 rounded-sm bg-yellow-300 border border-black/80 animate-po-pulse-soft" style={{ animationDelay: "0.2s", animationDuration: "1.2s" }} />

                {/* Meta spark rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-12 h-12 rounded-full border-2 border-dashed border-black/70 animate-po-spin"
                        style={{ animationDuration: "8s" }}
                    />
                    <div
                        className="absolute w-12 h-12 rounded-full border border-white/90 animate-po-ring-out"
                        style={{ animationDuration: "1.3s" }}
                    />
                </div>
            </>
        ),
    },

    // ThemeKey union: add | "genius"
    genius: {
        plate:
            "bg-gradient-to-t from-slate-950/90 via-indigo-800/70 to-sky-400/30",
        bloom:
            "bg-[radial-gradient(circle_at_50%_30%,rgba(125,211,252,0.45)_0%,transparent_55%)]",
        rim:
            "border-sky-300/85 shadow-[0_0_32px_#38bdf8,inset_0_0_28px_rgba(99,102,241,0.4)]",
        motion: (
            <>
                {/* HUD scanline */}
                <div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-200 to-transparent shadow-[0_0_12px_#7dd3fc] animate-po-scan"
                    style={{ animationDuration: "1.4s" }}
                />

                {/* Corner brackets — “analysis lock” */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-sky-200/90" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-sky-200/90" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-sky-200/90" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-sky-200/90" />

                {/* Expanding focus ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-11 h-11 rounded-full border border-sky-200/80 animate-po-ring-out"
                        style={{ animationDuration: "1.25s" }}
                    />
                    <div
                        className="absolute w-11 h-11 rounded-full border border-indigo-300/50 animate-po-ring-out"
                        style={{ animationDuration: "1.25s", animationDelay: "0.4s" }}
                    />
                </div>

                {/* Data motes */}
                {[22, 40, 58, 75].map((left, i) => (
                    <span
                        key={i}
                        className="absolute w-1 h-1 rounded-sm bg-sky-200 shadow-[0_0_8px_#7dd3fc] animate-po-ember"
                        style={{
                            left: `${left}%`,
                            bottom: "12%",
                            animationDelay: `${i * 0.12}s`,
                            animationDuration: `${1.1 + i * 0.08}s`,
                        }}
                    />
                ))}

                {/* Soft grid */}
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(125,211,252,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.15)_1px,transparent_1px)] bg-[size:12px_12px]" />
            </>
        ),
    },

    /* 🔥 Fire — rising heat + embers */
    fire: {
        plate: "bg-gradient-to-t from-red-800/95 via-orange-600/85 to-yellow-400/35",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(253,224,71,0.75)_0%,transparent_55%)]",
        rim: "border-yellow-300/90 shadow-[0_0_32px_#f97316,inset_0_0_40px_rgba(239,68,68,0.5)]",
        motion: (
            <>
                {[18, 32, 48, 62, 78].map((left, i) => (
                    <span
                        key={i}
                        className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-yellow-100 shadow-[0_0_10px_#fde047] animate-po-ember"
                        style={{ left: `${left}%`, animationDelay: `${i * 0.12}s`, animationDuration: `${0.85 + i * 0.08}s` }}
                    />
                ))}
                <div className="absolute bottom-0 left-[18%] w-7 h-[65%] bg-gradient-to-t from-orange-400/85 to-transparent blur-[2px] animate-po-pulse-soft" style={{ animationDuration: "0.45s" }} />
                <div className="absolute bottom-0 right-[22%] w-6 h-[72%] bg-gradient-to-t from-red-500/75 to-transparent blur-[2px] animate-po-pulse-soft" style={{ animationDuration: "0.55s" }} />
            </>
        ),
    },

    /* 🧊 Ice — shards + frost sweep */
    ice: {
        plate: "bg-gradient-to-b from-white/25 via-cyan-500/55 to-blue-950/90",
        bloom: "bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.8)_0%,transparent_42%)]",
        rim: "border-cyan-100 shadow-[0_0_34px_#22d3ee,inset_0_0_36px_rgba(224,242,254,0.55)]",
        motion: (
            <>
                <div className="absolute top-[18%] left-[22%] w-3 h-3 bg-white shadow-[0_0_14px_#fff] animate-po-shard" />
                <div className="absolute top-[40%] right-[26%] w-2.5 h-2.5 bg-cyan-50 shadow-[0_0_12px_#a5f3fc] animate-po-shard" style={{ animationDelay: "0.2s" }} />
                <div className="absolute bottom-[30%] left-[40%] w-2 h-2 bg-white/90 animate-po-shard" style={{ animationDelay: "0.4s" }} />
                <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/45 to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.4)_50%,transparent_60%)] animate-po-sweep" />
            </>
        ),
    },

    /* 🌊 Water — bubbles + tide */
    water: {
        plate: "bg-gradient-to-t from-blue-950/95 via-blue-600/80 to-cyan-400/40",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.45)_0%,transparent_50%)]",
        rim: "border-blue-300/90 shadow-[0_0_32px_#3b82f6,inset_0_0_34px_rgba(96,165,250,0.45)]",
        motion: (
            <>
                {[20, 40, 55, 72, 85].map((left, i) => (
                    <span
                        key={i}
                        className="absolute bottom-1 w-2 h-2 rounded-full bg-white/90 shadow-[0_0_8px_#67e8f9] animate-po-bubble"
                        style={{ left: `${left}%`, animationDelay: `${i * 0.15}s`, animationDuration: `${1 + i * 0.1}s` }}
                    />
                ))}
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-blue-500/50 to-transparent animate-po-pulse-soft" />
            </>
        ),
    },

    /* ⚡ Lightning — flickering forks */
    lightning: {
        plate: "bg-gradient-to-b from-yellow-100/85 via-cyan-400/45 to-slate-950/70",
        bloom: "bg-[radial-gradient(circle_at_50%_0%,rgba(254,240,138,0.95)_0%,transparent_50%)]",
        rim: "border-yellow-100 shadow-[0_0_38px_#facc15,inset_0_0_28px_rgba(254,249,195,0.65)]",
        motion: (
            <>
                <div className="absolute top-0 left-[26%] w-[3px] h-full bg-gradient-to-b from-white via-yellow-300 to-transparent -skew-x-[18deg] shadow-[0_0_16px_#fde047] animate-po-bolt" />
                <div className="absolute top-[8%] right-[30%] w-[2px] h-[85%] bg-gradient-to-b from-cyan-50 via-yellow-200 to-transparent skew-x-[20deg] shadow-[0_0_14px_#67e8f9] animate-po-bolt" style={{ animationDelay: "0.06s" }} />
                <div className="absolute top-[15%] left-[48%] w-[2px] h-[60%] bg-gradient-to-b from-white to-transparent -skew-x-[8deg] animate-po-bolt" style={{ animationDelay: "0.1s" }} />
            </>
        ),
    },

    /* 🧠 Psychic — expanding psi rings */
    psychic: {
        plate: "bg-gradient-to-t from-fuchsia-950/92 via-pink-600/72 to-violet-300/35",
        bloom: "bg-[radial-gradient(circle,rgba(244,114,182,0.55)_0%,transparent_58%)]",
        rim: "border-pink-300 shadow-[0_0_36px_#ec4899,inset_0_0_32px_rgba(217,70,239,0.5)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-pink-100/95 animate-po-psi" />
                <div className="absolute w-12 h-12 rounded-full border border-fuchsia-200/85 animate-po-psi" style={{ animationDelay: "0.35s" }} />
                <div className="absolute w-12 h-12 rounded-full border border-violet-200/75 animate-po-psi" style={{ animationDelay: "0.7s" }} />
            </div>
        ),
    },

    /* 👊 Combat — impact rings + slash streaks */
    combat: {
        plate: "bg-gradient-to-tr from-red-950/92 via-orange-600/80 to-amber-300/40",
        bloom: "bg-[radial-gradient(circle_at_center,rgba(253,186,116,0.55)_0%,transparent_55%)]",
        rim: "border-orange-400 shadow-[0_0_36px_#f97316,inset_0_0_32px_rgba(239,68,68,0.45)]",
        motion: (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-orange-200/90 animate-po-ring-out" style={{ animationDuration: "0.55s" }} />
                    <div className="absolute w-14 h-14 rounded-full border-2 border-yellow-200/80 animate-po-ring-out" style={{ animationDuration: "0.55s", animationDelay: "0.18s" }} />
                </div>
                <div className="absolute top-[28%] inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent -skew-y-12 opacity-90" />
                <div className="absolute bottom-[32%] inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent skew-y-12 opacity-90" />
            </>
        ),
    },

    /* 🕉️ Mystic — spinning mandala bands */
    mystic: {
        plate: "bg-gradient-to-tr from-orange-950/92 via-amber-600/78 to-yellow-300/30",
        bloom: "bg-[radial-gradient(circle,rgba(253,224,71,0.42)_0%,transparent_55%)]",
        rim: "border-amber-300 shadow-[0_0_34px_#f59e0b,inset_0_0_30px_rgba(253,224,71,0.45)]",
        motion: (
            <>
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-amber-200/90 animate-po-spin" />
                <div className="absolute inset-6 rounded-full border-2 border-yellow-100/85 border-t-transparent border-b-transparent animate-po-spin-rev" />
                <div className="absolute inset-9 rounded-full border border-amber-100/70 rotate-45 animate-po-spin-slow" />
            </>
        ),
    },

    /* ⏳ Temporal — clockwork rings */
    temporal: {
        plate: "bg-gradient-to-tr from-amber-950/92 via-yellow-500/72 to-amber-100/40",
        bloom: "bg-[radial-gradient(circle,rgba(254,240,138,0.5)_0%,transparent_50%)]",
        rim: "border-yellow-300 shadow-[0_0_32px_#eab308,inset_0_0_28px_rgba(254,249,195,0.5)]",
        motion: (
            <>
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-yellow-100/90 animate-po-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-yellow-50/90 animate-po-ring-out" style={{ animationDuration: "1.3s" }} />
                </div>
            </>
        ),
    },

    /* 🌑 Shadow — pooling darkness */
    shadow: {
        plate: "bg-gradient-to-t from-black/75 via-black/45 to-black/20",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.4)_0%,transparent_60%)]",
        rim: "border-zinc-800/80 shadow-[0_0_18px_rgba(0,0,0,0.5),inset_0_0_24px_rgba(0,0,0,0.4)]",
        motion: (
            <>
                <div className="absolute bottom-0 left-[10%] w-10 h-[80%] bg-gradient-to-t from-black/80 via-black/40 to-transparent blur-[2px] animate-po-pulse-soft" style={{ animationDuration: "1.3s" }} />
                <div className="absolute bottom-0 left-[38%] w-12 h-[90%] bg-gradient-to-t from-black/75 via-black/35 to-transparent blur-[3px] animate-po-pulse-soft" style={{ animationDuration: "1.6s", animationDelay: "0.2s" }} />
                <div className="absolute bottom-0 right-[12%] w-9 h-[75%] bg-gradient-to-t from-black/80 via-black/30 to-transparent blur-[2px] animate-po-pulse-soft" style={{ animationDuration: "1.4s", animationDelay: "0.35s" }} />

                {/* Slightly stronger tendrils so you can see them */}
                <div className="absolute bottom-[5%] left-[24%] w-[3px] h-[58%] bg-gradient-to-t from-zinc-500/90 via-black/70 to-transparent -skew-x-[16deg] animate-po-pulse-soft" style={{ animationDuration: "0.85s" }} />
                <div className="absolute bottom-[3%] left-[50%] w-[3px] h-[65%] bg-gradient-to-t from-zinc-400/80 via-black/60 to-transparent skew-x-[11deg] animate-po-pulse-soft" style={{ animationDuration: "0.95s", animationDelay: "0.15s" }} />
                <div className="absolute bottom-[6%] right-[28%] w-[3px] h-[52%] bg-gradient-to-t from-zinc-500/85 via-black/65 to-transparent -skew-x-[7deg] animate-po-pulse-soft" style={{ animationDuration: "0.8s", animationDelay: "0.28s" }} />

                {[28, 50, 72].map((left, i) => (
                    <span
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400/70 animate-po-ember"
                        style={{ left: `${left}%`, bottom: "6%", animationDelay: `${i * 0.18}s`, animationDuration: `${1.2 + i * 0.12}s` }}
                    />
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-zinc-500/45 animate-po-ring-out" style={{ animationDuration: "1.35s" }} />
                    <div className="absolute w-14 h-14 rounded-full border border-black/50 animate-po-ring-out" style={{ animationDuration: "1.35s", animationDelay: "0.45s" }} />
                </div>
            </>
        ),
    },

    /* ✨ Light — white core flare */
    light: {
        plate: "bg-gradient-to-t from-amber-200/40 via-yellow-50/75 to-white/90",
        bloom: "bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,transparent_50%)] animate-po-pulse-soft",
        rim: "border-yellow-50 shadow-[0_0_40px_#fef08a,inset_0_0_36px_rgba(255,255,255,0.7)]",
        motion: (
            <div className="absolute inset-4 rounded-full border border-yellow-100/80 animate-po-ring-out" style={{ animationDuration: "1.2s" }} />
        ),
    },

    /* 🌌 Cosmic — starfield + slow orbit */
    cosmic: {
        plate: "bg-gradient-to-tr from-indigo-950/95 via-violet-700/75 to-cyan-400/35",
        bloom: "bg-[radial-gradient(circle_at_40%_30%,rgba(165,243,252,0.45)_0%,transparent_45%)]",
        rim: "border-cyan-200/90 shadow-[0_0_38px_#22d3ee,inset_0_0_30px_rgba(167,139,250,0.45)]",
        motion: (
            <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,#fff_0_1px,transparent_2px),radial-gradient(circle_at_70%_40%,#a5f3fc_0_1.5px,transparent_2px),radial-gradient(circle_at_45%_75%,#c4b5fd_0_1px,transparent_2px),radial-gradient(circle_at_80%_70%,#fff_0_1px,transparent_2px)]" />
                <div className="absolute inset-4 rounded-full border border-cyan-200/40 animate-po-spin-slow" />
            </>
        ),
    },

    /* 🧲 Magnetic — polarity bars + dashed orbit */
    magnetic: {
        plate: "bg-gradient-to-t from-slate-950 via-red-800/55 to-slate-400/35",
        bloom: "bg-[radial-gradient(circle,rgba(248,113,113,0.35)_0%,transparent_50%)]",
        rim: "border-red-400 shadow-[0_0_32px_#f87171,inset_0_0_26px_rgba(148,163,184,0.4)]",
        motion: (
            <>
                <div className="absolute left-2 top-1/3 w-1.5 h-12 bg-red-400 shadow-[0_0_14px_#f87171] animate-po-pulse-soft" />
                <div className="absolute right-2 top-1/3 w-1.5 h-12 bg-slate-200 shadow-[0_0_14px_#e2e8f0] animate-po-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <div className="absolute inset-5 rounded-full border border-dashed border-red-300/70 animate-po-spin" />
            </>
        ),
    },

    /* 🌍 Gravity — crushing core */
    gravity: {
        plate: "bg-gradient-to-t from-black via-purple-950/90 to-slate-600/40",
        bloom: "bg-[radial-gradient(circle,rgba(15,23,42,0.95)_0%,transparent_55%)]",
        rim: "border-slate-400/90 shadow-[0_0_32px_#64748b,inset_0_0_36px_rgba(49,46,129,0.6)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black border border-slate-500 shadow-[0_0_30px_#0f172a] animate-po-pulse-soft" />
                <div className="absolute w-16 h-16 rounded-full border border-slate-400/60 animate-po-ring-out" style={{ animationDuration: "1.4s" }} />
            </div>
        ),
    },

    /* 🔊 Sonic — concentric sound rings */
    sonic: {
        plate: "bg-gradient-to-r from-violet-900/88 via-fuchsia-500/70 to-violet-900/88",
        bloom: "bg-[radial-gradient(circle,rgba(232,121,249,0.5)_0%,transparent_55%)]",
        rim: "border-fuchsia-300 shadow-[0_0_34px_#e879f9,inset_0_0_28px_rgba(192,38,211,0.45)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-fuchsia-100 animate-po-ring-out" style={{ animationDuration: "0.85s" }} />
                <div className="absolute w-10 h-10 rounded-full border border-fuchsia-200/90 animate-po-ring-out" style={{ animationDuration: "0.85s", animationDelay: "0.28s" }} />
                <div className="absolute w-10 h-10 rounded-full border border-violet-200/80 animate-po-ring-out" style={{ animationDuration: "0.85s", animationDelay: "0.56s" }} />
            </div>
        ),
    },

    /* ☠️ Poison — toxic drips */
    poison: {
        plate: "bg-gradient-to-t from-lime-950/95 via-green-700/80 to-lime-300/35",
        bloom: "bg-[radial-gradient(circle_at_70%_30%,rgba(163,230,53,0.5)_0%,transparent_45%)]",
        rim: "border-lime-400 shadow-[0_0_34px_#a3e635,inset_0_0_28px_rgba(101,163,13,0.5)]",
        motion: (
            <>
                <div className="absolute top-[25%] left-[30%] w-2.5 h-2.5 rounded-full bg-lime-300 shadow-[0_0_12px_#bef264] animate-po-bubble" style={{ animationDuration: "1.4s" }} />
                <div className="absolute top-[35%] right-[28%] w-2 h-2 rounded-full bg-green-200 animate-po-bubble" style={{ animationDelay: "0.3s", animationDuration: "1.2s" }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(190,242,100,0.25)_0%,transparent_40%)] animate-po-pulse-soft" />
            </>
        ),
    },

    /* 🌿 Nature — rising growth wisps */
    nature: {
        plate: "bg-gradient-to-t from-green-950/94 via-emerald-600/78 to-lime-300/35",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(52,211,153,0.45)_0%,transparent_50%)]",
        rim: "border-emerald-300 shadow-[0_0_32px_#34d399,inset_0_0_26px_rgba(134,239,172,0.4)]",
        motion: (
            <>
                <div className="absolute bottom-0 left-[28%] w-3 h-14 bg-gradient-to-t from-green-700 to-lime-300/80 rounded-t-full animate-po-pulse-soft" />
                <div className="absolute bottom-1 right-[30%] w-2.5 h-11 bg-gradient-to-t from-emerald-800 to-lime-200/70 rounded-t-full animate-po-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-emerald-700/40 to-transparent" />
            </>
        ),
    },

    /* 🌪️ Wind — horizontal gust lines */
    wind: {
        plate: "bg-gradient-to-r from-slate-200/25 via-sky-300/55 to-white/40",
        bloom: "bg-[radial-gradient(circle,rgba(186,230,253,0.45)_0%,transparent_55%)]",
        rim: "border-sky-200 shadow-[0_0_30px_#7dd3fc,inset_0_0_24px_rgba(224,242,254,0.5)]",
        motion: (
            <>
                <div className="absolute top-[30%] inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-po-sweep" style={{ animationDuration: "1.1s" }} />
                <div className="absolute top-[48%] inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-100 to-transparent animate-po-sweep" style={{ animationDuration: "1.3s", animationDelay: "0.15s" }} />
                <div className="absolute top-[62%] inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white/90 to-transparent animate-po-sweep" style={{ animationDuration: "1s", animationDelay: "0.3s" }} />
            </>
        ),
    },

    /* 🪨 Earth — ground surge */
    earth: {
        plate: "bg-gradient-to-t from-amber-950/95 via-yellow-800/80 to-stone-400/45",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(180,83,9,0.5)_0%,transparent_50%)]",
        rim: "border-amber-600 shadow-[0_0_30px_#d97706,inset_0_0_28px_rgba(120,53,15,0.55)]",
        motion: (
            <>
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-amber-900/85 to-transparent" />
                <div className="absolute bottom-2 left-[22%] w-5 h-3 bg-stone-600 rotate-12 shadow-md" />
                <div className="absolute bottom-3 right-[24%] w-6 h-3 bg-amber-800 -rotate-6 shadow-md" />
                <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-700/80 animate-po-pulse-soft" />
            </>
        ),
    },

    /* ☢️ Radiation — hazard pulse */
    radiation: {
        plate: "bg-gradient-to-t from-green-950/95 via-lime-500/80 to-yellow-300/40",
        bloom: "bg-[radial-gradient(circle,rgba(190,242,100,0.55)_0%,transparent_50%)]",
        rim: "border-lime-300 shadow-[0_0_36px_#84cc16,inset_0_0_30px_rgba(190,242,100,0.5)]",
        motion: (
            <>
                <div className="absolute inset-3 rounded-full border-2 border-lime-300/80 animate-po-ring-out" style={{ animationDuration: "1.1s" }} />
                <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,transparent_0deg_25deg,rgba(190,242,100,0.12)_25deg_45deg)] animate-po-spin-slow" />
            </>
        ),
    },

    /* 🩸 Blood — drip + crimson pool */
    blood: {
        plate: "bg-gradient-to-t from-red-950/96 via-rose-800/88 to-red-500/40",
        bloom: "bg-[radial-gradient(ellipse_at_bottom,rgba(225,29,72,0.55)_0%,transparent_55%)]",
        rim: "border-rose-500 shadow-[0_0_34px_#e11d48,inset_0_0_32px_rgba(159,18,57,0.55)]",
        motion: (
            <>
                <div className="absolute top-[28%] left-[36%] w-2 h-5 rounded-full bg-rose-400/95 shadow-[0_0_10px_#fb7185] animate-po-bubble" style={{ animationDuration: "1.1s" }} />
                <div className="absolute top-[40%] right-[34%] w-1.5 h-4 rounded-full bg-red-300/90 animate-po-bubble" style={{ animationDelay: "0.25s", animationDuration: "1s" }} />
                <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-red-900/70 to-transparent" />
            </>
        ),
    },

    /* 🕸️ Web — lattice flash */
    web: {
        plate: "bg-gradient-to-tr from-red-900/75 via-blue-950/55 to-slate-100/30",
        bloom: "bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,transparent_50%)]",
        rim: "border-white shadow-[0_0_28px_#fff,inset_0_0_24px_rgba(255,255,255,0.65)]",
        motion: (
            <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_26%,rgba(255,255,255,0.85)_27%,transparent_29%)] animate-po-ring-out" style={{ animationDuration: "1.15s" }} />
                <div className="absolute top-0 left-0 right-0 h-px bg-white/90 origin-top-left rotate-45" />
                <div className="absolute top-0 right-0 bottom-0 w-px bg-white/90 origin-top-right -rotate-45" />
                <div className="absolute inset-[20%] border border-white/40 rotate-45" />
            </>
        ),
    },

    /* ⌚ Omnitrix — lime dial rings */
    omnitrix: {
        plate: "bg-gradient-to-t from-emerald-950/95 via-green-500/88 to-lime-300/45",
        bloom: "bg-[radial-gradient(circle,rgba(134,239,172,0.55)_0%,transparent_50%)]",
        rim: "border-lime-300 shadow-[0_0_36px_#22c55e,inset_0_0_30px_rgba(134,239,172,0.5)]",
        motion: (
            <>
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-lime-200/90 animate-po-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-lime-200 rotate-45 animate-po-ring-out" style={{ animationDuration: "0.95s" }} />
                </div>
            </>
        ),
    },

    /* 💎 Diamond / force field — prism shards */
    diamond: {
        plate: "bg-gradient-to-tr from-cyan-400/75 via-white/85 to-blue-200/55",
        bloom: "bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,transparent_48%)]",
        rim: "border-white shadow-[0_0_36px_#fff,inset_0_0_30px_rgba(165,243,252,0.65)]",
        motion: (
            <>
                <div className="absolute top-[22%] left-[28%] w-4 h-4 bg-white rotate-45 shadow-[0_0_16px_#fff] animate-po-shard" />
                <div className="absolute bottom-[28%] right-[26%] w-3 h-3 bg-cyan-50 rotate-45 shadow-[0_0_12px_#a5f3fc] animate-po-shard" style={{ animationDelay: "0.25s" }} />
            </>
        ),
    },

    /* ⚙️ Tech — scanlines */
    tech: {
        plate: "bg-gradient-to-t from-slate-950/95 via-cyan-600/78 to-indigo-900/45",
        bloom: "bg-[radial-gradient(circle,rgba(34,211,238,0.35)_0%,transparent_50%)]",
        rim: "border-cyan-300 shadow-[0_0_34px_#06b6d4,inset_0_0_28px_rgba(103,232,249,0.45)]",
        motion: (
            <>
                <div className="absolute left-0 right-0 h-2 bg-cyan-200/95 shadow-[0_0_18px_#22d3ee] animate-po-scan" />
                <div className="absolute left-0 right-0 h-1.5 bg-blue-300/85 shadow-[0_0_14px_#38bdf8] animate-po-scan" style={{ animationDelay: "0.35s", animationDuration: "1.3s" }} />
            </>
        ),
    },

    /* 🛡️ Defend */
    defend: {
        plate: "bg-gradient-to-t from-cyan-900/88 via-blue-600/55 to-teal-200/30",
        bloom: "bg-[radial-gradient(circle,rgba(34,211,238,0.45)_0%,transparent_55%)]",
        rim: "border-cyan-200 shadow-[0_0_36px_#06b6d4,inset_0_0_32px_rgba(103,232,249,0.55)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-[3px] border-cyan-100/90 animate-po-ring-out" style={{ animationDuration: "1s" }} />
                <div className="absolute w-10 h-10 rounded-full border-2 border-teal-100/80 animate-po-pulse-soft" />
            </div>
        ),
    },

    /* ⚕️ Heal — soft cross bloom (geometry, not icon pack) */
    heal: {
        plate: "bg-gradient-to-t from-emerald-950/90 via-green-500/65 to-teal-200/30",
        bloom: "bg-[radial-gradient(circle,rgba(52,211,153,0.55)_0%,transparent_52%)]",
        rim: "border-emerald-300 shadow-[0_0_34px_#10b981,inset_0_0_28px_rgba(110,231,183,0.5)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-2 rounded-full bg-emerald-100/95 shadow-[0_0_16px_#6ee7b7] animate-po-pulse-soft" />
                <div className="absolute w-2 h-10 rounded-full bg-emerald-100/95 shadow-[0_0_16px_#6ee7b7] animate-po-pulse-soft" />
            </div>
        ),
    },

    /* 🔄 Revive — violet burst rings */
    revive: {
        plate: "bg-gradient-to-t from-purple-950/95 via-fuchsia-600/75 to-pink-300/40",
        bloom: "bg-[radial-gradient(circle,rgba(192,132,252,0.55)_0%,transparent_52%)]",
        rim: "border-purple-300 shadow-[0_0_40px_#c084fc,inset_0_0_32px_rgba(244,114,182,0.45)]",
        motion: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-purple-100 animate-po-ring-out" style={{ animationDuration: "1.15s" }} />
                <div className="absolute w-14 h-14 rounded-full border border-pink-200/90 animate-po-ring-out" style={{ animationDuration: "1.15s", animationDelay: "0.4s" }} />
            </div>
        ),
    },
};

function getThemeKey(action: CombatActionType, powerName?: string): ThemeKey {
    // return "fourthWall"

    if (action === "defend") return "defend";
    if (action === "heal") return "heal";
    if (action === "revive") return "revive";
    if (!powerName) return "combat";
    const n = powerName.toLowerCase();

    if (/\b(fourth wall|4th wall|meta|deadpool|break(ing)? the fourth|audience|narrat)/i.test(n)) return "fourthWall";
    if (/\b(web|spider|elastic)/.test(n)) return "web";
    if (/\b(omnitrix|alien|transformation|metamorph)/.test(n)) return "omnitrix";
    if (/\b(ice|cryo|frost|freeze|blizzard|arctic)/.test(n)) return "ice";
    if (/\b(water|hydro|aqua|ocean|tidal|aquatic)/.test(n)) return "water";
    if (/\b(fire|flame|pyro|heat vision|inferno|magma)/.test(n)) return "fire";
    if (/\b(lightning|electric|electro|thunder|speed force|superspeed)/.test(n)) return "lightning";
    if (/\b(time|temporal|chron)/.test(n)) return "temporal";
    if (/\b(magic|mystic|sorcery|spell|chaos magic)/.test(n)) return "mystic";
    if (/\b(telepath|telekin|psychic|mind control|illusion)/.test(n)) return "psychic";
    if (/\b(shadow|darkness|umbral|fear|curse)/.test(n)) return "shadow";
    if (/\b(light|photon|solar|holy|starbolt)/.test(n)) return "light";
    if (/\b(cosmic|stellar|power cosmic)/.test(n)) return "cosmic";
    if (/\b(magnet|ferro|metal manipulation)/.test(n)) return "magnetic";
    if (/\b(gravity|gravimetric)/.test(n)) return "gravity";
    if (/\b(sonic|sound|vibrat|scream)/.test(n)) return "sonic";
    if (/\b(poison|toxin|venom|acid|toxic)/.test(n)) return "poison";
    if (/\b(plant|nature|vine|chlorophyll)/.test(n)) return "nature";
    if (/\b(wind|air control|weather|teleportation)/.test(n)) return "wind";
    if (/\b(earth|geo|stone|rock|seismic)/.test(n)) return "earth";
    if (/\b(radiation|gamma|radioactive)/.test(n)) return "radiation";
    if (/\b(blood|vampir|life drain)/.test(n)) return "blood";
    if (/\b(diamond|crystal|invulnerab|force.?field)/.test(n)) return "diamond";
    if (/\b(tech|cyber|android|gadget|repulsor|nanite)/.test(n)) return "tech";
    if (/\b(strength|hand-to-hand|martial|claw|brawl|punch|melee|combat)/.test(n)) return "combat";
    if (/\b(genius|intelligent|intelligence|smart|intellect|tactical|strategy|analysis|super.?mind|omniscient|calculation)/.test(n)) return "genius";
    return "combat";
}

export default function PowerOverlay({ action, powerName, visible = true }: PowerOverlayProps) {
    const key = getThemeKey(action, powerName);
    const t = THEMES[key] ?? THEMES.combat;
    // const isDark = key === "shadow" || key === "gravity";

    return (
        <div
            className={cn(
                "absolute inset-0 z-10 overflow-hidden rounded-lg pointer-events-none po-fade",
                // "animate-po-appear-cycle", // pulse in/out
                // "animate-po-fade-in",  // use instead if you only want appear once
                visible && "po-fade-in",
                /* !isDark && visible && "mix-blend-screen" */
            )}
        >
            <div className={cn("absolute inset-0", t.plate)} />
            <div className={cn("absolute inset-0", t.bloom)} />
            {t.motion}
            <div className={cn("absolute inset-0 rounded-lg border-2", t.rim)} />
        </div>
    );
}