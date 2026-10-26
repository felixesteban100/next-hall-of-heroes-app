import { StartPageSearchLink } from "@/components/startPage/StartPageSearchLink";
import { Flame, Sparkles, Swords, Shield, Zap, Users, Trophy, Cpu, ArrowRight } from "lucide-react";
import { StartPageCategoryLinks } from "@/components/startPage/StartPageCategoryLinks";
import { StartPageFooterLinks } from "@/components/startPage/StartPageFooterLinks";
import Link from "next/link";

export default function StartPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* 🚀 Hero Header Section */}
      <section className="pt-12 pb-8 px-4 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Ultimate Multiverse Database & Combat Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Explore the Ultimate <br className="hidden sm:inline" />
          <span className="bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            Hall of Heroes & Villains
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Dive into relational intelligence across universes. Compare team leaders, simulate cinematic tactical battles, track power tiers, and trace faction connections.
        </p>

        {/* Global Quick Search Anchor */}
        <div className="pt-2 max-w-xl mx-auto">
          <StartPageSearchLink />
        </div>
      </section>

      {/* 🌟 Feature Highlights Grid (Showcasing Everything the App Offers) */}
      <section className="px-4 py-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Core System Capabilities
          </h2>
          <span className="text-xs text-muted-foreground/60 hidden sm:inline">Select a module to dive in</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1: Cinematic Combat Simulator */}
          <Link
            href="/compare"
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/80 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                Cinematic Combat Simulator
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Experience turn-based tactical battles complete with dynamic K.O. slams, health bars, revives, action overlays, and sound integration.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
              <span>Launch Simulation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Feature 2: Multiverse Database */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/60 bg-card/40 shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Character & Faction Index
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore comprehensive profiles featuring powerstats, smart image cropping, custom focus alignment, and universe cross-references.
              </p>
            </div>
            <div className="pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                Database Active
              </span>
            </div>
          </div>

          {/* Feature 3: Power Roles & Tactics */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/60 bg-card/40 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Tactical Power System
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Categorized power roles across Offensive, Defensive, Control, Utility, and Hybrid tiers with smart activation checks.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Offensive</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Defensive</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Utility</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Category Navigation Cards */}
      <section className="px-4 py-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StartPageCategoryLinks />
        </div>
      </section>

      {/* Bottom Featured Spotlight / Quick Links Bar */}
      <footer className="border-t border-border/50 backdrop-blur-xs py-6 px-4 mt-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary shrink-0" />
            <span>Featured Spotlight: <strong>The Avengers Leadership Roster</strong> & <strong>Multiverse Combat Engine</strong></span>
          </div>

          <StartPageFooterLinks />
        </div>
      </footer>
    </div>
  );
}