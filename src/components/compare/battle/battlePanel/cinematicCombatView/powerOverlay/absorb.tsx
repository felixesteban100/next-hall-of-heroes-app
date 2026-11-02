import { OverlayConfig } from "./themes";

const MATERIALS = [
  {
    // steel
    plate: "bg-gradient-to-tr from-zinc-950/90 via-slate-500/50 to-zinc-200/30",
    rim: "border-zinc-300/85 shadow-[0_0_28px_rgba(161,161,170,0.5),inset_0_0_26px_rgba(39,39,42,0.5)]",
    facet: "border-zinc-200/90 bg-zinc-400/30",
    chip: "bg-zinc-200 shadow-[0_0_10px_#e4e4e7]",
    ring: "border-zinc-300/80",
  },
  {
    // stone
    plate: "bg-gradient-to-tr from-stone-950/90 via-amber-900/45 to-stone-400/30",
    rim: "border-stone-400/80 shadow-[0_0_28px_rgba(120,113,108,0.45),inset_0_0_26px_rgba(68,64,60,0.5)]",
    facet: "border-stone-300/80 bg-stone-500/30",
    chip: "bg-stone-300 shadow-[0_0_10px_#a8a29e]",
    ring: "border-stone-300/70",
  },
  {
    // gold
    plate: "bg-gradient-to-tr from-amber-950/90 via-yellow-600/50 to-amber-200/35",
    rim: "border-yellow-300/90 shadow-[0_0_30px_#facc15,inset_0_0_26px_rgba(146,64,14,0.45)]",
    facet: "border-yellow-200/90 bg-amber-400/30",
    chip: "bg-yellow-300 shadow-[0_0_10px_#fde047]",
    ring: "border-yellow-300/80",
  },
  {
    // wood
    plate: "bg-gradient-to-tr from-amber-950/90 via-yellow-900/50 to-lime-800/25",
    rim: "border-amber-700/80 shadow-[0_0_26px_rgba(146,64,14,0.45),inset_0_0_24px_rgba(69,26,3,0.5)]",
    facet: "border-amber-600/80 bg-yellow-900/35",
    chip: "bg-amber-600 shadow-[0_0_10px_#b45309]",
    ring: "border-amber-600/70",
  },
  {
    // copper
    plate: "bg-gradient-to-tr from-orange-950/90 via-orange-700/50 to-amber-300/30",
    rim: "border-orange-400/85 shadow-[0_0_28px_#fb923c,inset_0_0_24px_rgba(124,45,18,0.5)]",
    facet: "border-orange-300/90 bg-orange-500/30",
    chip: "bg-orange-300 shadow-[0_0_10px_#fdba74]",
    ring: "border-orange-400/75",
  },
  {
    // crystal / glass
    plate: "bg-gradient-to-tr from-indigo-950/90 via-violet-600/40 to-cyan-200/30",
    rim: "border-violet-200/85 shadow-[0_0_30px_#a78bfa,inset_0_0_26px_rgba(49,46,129,0.4)]",
    facet: "border-violet-100/90 bg-violet-300/25",
    chip: "bg-violet-200 shadow-[0_0_10px_#c4b5fd]",
    ring: "border-violet-200/80",
  },
  {
    // ice
    plate: "bg-gradient-to-tr from-cyan-950/90 via-sky-500/45 to-white/35",
    rim: "border-cyan-200/90 shadow-[0_0_30px_#22d3ee,inset_0_0_26px_rgba(14,116,144,0.4)]",
    facet: "border-cyan-100/90 bg-sky-200/30",
    chip: "bg-cyan-100 shadow-[0_0_10px_#a5f3fc]",
    ring: "border-cyan-200/80",
  },
  {
    // rubber
    plate: "bg-gradient-to-tr from-slate-950/90 via-sky-800/40 to-pink-400/25",
    rim: "border-sky-300/75 shadow-[0_0_28px_rgba(56,189,248,0.4),inset_0_0_24px_rgba(30,58,138,0.35)]",
    facet: "border-sky-200/80 bg-sky-400/20",
    chip: "bg-sky-200 shadow-[0_0_10px_#7dd3fc]",
    ring: "border-sky-300/70",
  },
  {
    // obsidian
    plate: "bg-gradient-to-tr from-black via-violet-950/60 to-zinc-600/30",
    rim: "border-zinc-500/80 shadow-[0_0_28px_rgba(0,0,0,0.7),inset_0_0_26px_rgba(24,24,27,0.6)]",
    facet: "border-zinc-400/70 bg-zinc-700/40",
    chip: "bg-zinc-400 shadow-[0_0_10px_#71717a]",
    ring: "border-zinc-500/70",
  },
  {
    // lava / magma
    plate: "bg-gradient-to-tr from-red-950/95 via-orange-600/55 to-yellow-400/30",
    rim: "border-orange-400/90 shadow-[0_0_30px_#f97316,inset_0_0_26px_rgba(127,29,29,0.5)]",
    facet: "border-orange-300/90 bg-red-500/30",
    chip: "bg-yellow-300 shadow-[0_0_10px_#fde047]",
    ring: "border-orange-400/80",
  },
  {
    // emerald
    plate: "bg-gradient-to-tr from-emerald-950/90 via-green-600/50 to-lime-300/30",
    rim: "border-emerald-300/85 shadow-[0_0_28px_#34d399,inset_0_0_24px_rgba(6,78,59,0.45)]",
    facet: "border-emerald-200/90 bg-emerald-400/30",
    chip: "bg-lime-200 shadow-[0_0_10px_#bef264]",
    ring: "border-emerald-300/80",
  },
  {
    // bone / ivory
    plate: "bg-gradient-to-tr from-stone-800/90 via-stone-300/50 to-amber-50/40",
    rim: "border-stone-200/85 shadow-[0_0_26px_rgba(231,229,228,0.5),inset_0_0_24px_rgba(68,64,60,0.4)]",
    facet: "border-stone-100/90 bg-stone-200/35",
    chip: "bg-amber-50 shadow-[0_0_10px_#fef3c7]",
    ring: "border-stone-200/80",
  },
] as const;

/** Call each time the overlay is shown — new material every time */
export function createAbsorbTheme(): OverlayConfig {
  const m = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];

  return {
    plate: m.plate,
    bloom: "", // unused if you commented bloom out
    rim: m.rim,
    motion: (
      <>
        <div className={`absolute top-[18%] left-[12%] w-9 h-6 border-2 rotate-[-10deg] animate-po-pulse-soft ${m.facet}`} style={{ animationDuration: "0.9s" }} />
        <div className={`absolute top-[40%] right-[10%] w-8 h-8 border-2 rotate-[14deg] animate-po-pulse-soft ${m.facet}`} style={{ animationDuration: "1s", animationDelay: "0.1s" }} />
        <div className={`absolute bottom-[22%] left-[18%] w-10 h-5 border-2 rotate-[6deg] animate-po-pulse-soft ${m.facet}`} style={{ animationDuration: "0.95s", animationDelay: "0.15s" }} />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full border-2 animate-po-ring-out ${m.ring}`} style={{ animationDuration: "1.1s" }} />
          <div className={`absolute w-12 h-12 rounded-full border animate-po-ring-out ${m.ring}`} style={{ animationDuration: "1.1s", animationDelay: "0.35s" }} />
          <div className={`absolute w-4 h-4 rounded-sm rotate-45 animate-po-pulse-soft ${m.chip}`} style={{ animationDuration: "0.6s" }} />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] animate-po-sweep" style={{ animationDuration: "1.5s" }} />

        {([["25%", "30%"], ["70%", "35%"], ["65%", "65%"], ["30%", "70%"]] as const).map(([left, top], i) => (
          <span
            key={i}
            className={`absolute w-1.5 h-1.5 rotate-45 animate-po-ember ${m.chip}`}
            style={{ left, top, animationDelay: `${i * 0.1}s`, animationDuration: `${0.9 + i * 0.08}s` }}
          />
        ))}
      </>
    ),
  };
}