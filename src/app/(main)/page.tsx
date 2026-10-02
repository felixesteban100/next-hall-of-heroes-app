import { StartPageSearchLink } from "@/components/startPage/StartPageSearchLink";
import { Flame, Sparkles } from "lucide-react";
import { StartPageCategoryLinks } from "@/components/startPage/StartPageCategoryLinks";
import { StartPageFooterLinks } from "@/components/startPage/StartPageFooterLinks";

export default function StartPage() {
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
          <span className="bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            Hall of Heroes & Villains
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Dive into relational intelligence across universes. Compare team leaders, track power levels, and trace connections across factions.
        </p>

        {/* Global Quick Search Anchor */}
        <div className="pt-2 max-w-xl mx-auto">
          <StartPageSearchLink />
        </div>
      </section>

      {/* Main Grid Category Cards */}
      <section className="px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StartPageCategoryLinks />
        </div>
      </section>

      {/* Bottom Featured Highlight / Quick Links Bar */}
      <footer className="border-t border-border/50  backdrop-blur-xs py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary shrink-0" />
            <span>Featured Spotlight: <strong>The Avengers Leadership Roster</strong> & <strong>Mutant Factions</strong></span>
          </div>

          <StartPageFooterLinks />
        </div>
      </footer>
    </div>

  );
}

