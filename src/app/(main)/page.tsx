import Link from "next/link";
import {
  Users,
  Shield,
  Globe2,
  Zap,
  Search,
  ArrowRight,
  Sparkles,
  Flame
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function StartPage() {
  const entityCategories = [
    {
      title: "Characters",
      description: "Explore heroes, anti-heroes, and villains with full powerstats and bios.",
      href: "/characters",
      icon: Users,
      badge: "Primary Roster",
      color: "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30 hover:border-blue-500/60 text-blue-500",
    },
    {
      title: "Teams & Factions",
      description: "Discover alliances, leader rosters, and multi-universe squads.",
      href: "/teams",
      icon: Shield,
      badge: "Alliances",
      color: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 hover:border-emerald-500/60 text-emerald-500",
    },
    {
      title: "Universes",
      description: "Browse multiverse dimensions from comics, cartoons, and anime.",
      href: "/universes",
      icon: Globe2,
      badge: "Multiverse",
      color: "from-purple-500/20 via-indigo-500/10 to-transparent border-purple-500/30 hover:border-purple-500/60 text-purple-500",
    },
    {
      title: "Powers & Abilities",
      description: "Filter characters by meta-abilities, elements, and power levels.",
      href: "/powers",
      icon: Zap,
      badge: "Abilities",
      color: "from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30 hover:border-amber-500/60 text-amber-500",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Hero Header Section */}
      <section className="pt-12 pb-8 px-4 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Multiverse Database
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Explore the Ultimate <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            Hall of Heroes & Villains
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Dive into relational intelligence across universes. Compare team leaders, track power levels, and trace connections across factions.
        </p>

        {/* Global Quick Search Anchor */}
        <div className="pt-2 max-w-xl mx-auto">
          <Link
            href="/characters"
            className="group flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm">Search characters, teams, or powers...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </Link>
        </div>
      </section>

      {/* Main Grid Category Cards */}
      <section className="px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entityCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-b ${cat.color} transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                      {cat.badge}
                    </span>
                  </div>

                  {/* group-hover:text-primary */}
                  <h2 className="text-lg font-bold text-foreground  transition-colors mb-1">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Browse Database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom Featured Highlight / Quick Links Bar */}
      <footer className="border-t border-border/50  backdrop-blur-xs py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary shrink-0" />
            <span>Featured Spotlight: <strong>The Avengers Leadership Roster</strong> & <strong>Mutant Factions</strong></span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <Link href="/characters" className="hover:text-foreground transition-colors">
              All Characters
            </Link>
            <span>•</span>
            <Link href="/teams" className="hover:text-foreground transition-colors">
              Teams
            </Link>
            <span>•</span>
            <Link href="/powers" className="hover:text-foreground transition-colors">
              Power Matrix
            </Link>
          </div>
        </div>
      </footer>
    </div>

  );
}