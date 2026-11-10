import {
  collectionCharacters,
  collectionPowers,
  collectionTeams,
  collectionUniverses,
} from "@/db/mongodb";
import { StartPageCategoryLinks } from "@/components/startPage/StartPageCategoryLinks";
import { StartPageFooterLinks } from "@/components/startPage/StartPageFooterLinks";
import { Flame } from "lucide-react";
import { StatsBar } from "@/components/home/Statsbar";
import { FeaturedCharactersRow } from "@/components/home/Featuredcharactersrow";
import { FeatureCards } from "@/components/home/FeatureCards";
import { HeroSection } from "@/components/home/Herosection";

export const instant = false;

export default async function StartPage() {
  // ── Parallel data fetch ──────────────────────────────────────────────────
  const [
    characterCount,
    universeCount,
    teamCount,
    powerCount,
    topCharacters,
    featuredCharacters,
  ] = await Promise.all([
    collectionCharacters.countDocuments({}),
    collectionUniverses.countDocuments({}),
    collectionTeams.countDocuments({}),
    collectionPowers.countDocuments({}),

    // Hero background: a few high-class characters with images, pick top by class+tier
    await collectionCharacters.aggregate([
      { $match: { "images.md": { $exists: true, $ne: "" } } },
      { $sample: { size: 5 } }, // 🎲 Grabs 5 random documents
      {
        $project: {
          name: 1,
          "images.md": 1,
          imageFocus: 1,
          _id: 0,
        },
      },
    ]).toArray(),

    // Featured row: top-scoring characters for the scrollable row
    await collectionCharacters.aggregate([
      { $match: { "images.md": { $exists: true, $ne: "" } } },
      { $sample: { size: 18 } }, // 🎲 Randomly picks 18 records
      {
        $project: {
          id: 1,
          name: 1,
          slug: 1,
          "images.md": 1,
          imageFocus: 1,
          "powerstats.total": 1,
          "biography.alignment": 1,
          "biography.publisher": 1,
          _id: 0,
        },
      },
    ])
      .sort({ "powerstats.total": -1 })
      .toArray(),
  ]);

  // Sanitize BSON for client props
  const sanitize = <T,>(docs: T[]): T[] => JSON.parse(JSON.stringify(docs));

  const heroChars = sanitize(topCharacters).map((c: any) => ({
    name: c.name,
    image: c.images?.lg ?? c.images?.md ?? "",
    imageFocus: c.imageFocus ?? "center top",
  }));

  const featuredChars = sanitize(featuredCharacters).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.images?.md ?? "",
    imageFocus: c.imageFocus ?? "center top",
    total: c.powerstats?.total ?? 0,
    alignment: c.biography?.alignment ?? "neutral",
    publisher: typeof c.biography?.publisher === "string"
      ? c.biography.publisher
      : c.biography?.publisher?.name ?? "",
  }));

  const stats = {
    characters: characterCount,
    universes: universeCount,
    teams: teamCount,
    powers: powerCount,
  };

  return (
    <div className="relative  flex flex-col overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <HeroSection characters={heroChars} />

      {/* ── Live Stats Bar ───────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ── Featured Characters ──────────────────────────────────────── */}
      <FeaturedCharactersRow characters={featuredChars} />

      {/* ── Feature Capability Cards ─────────────────────────────────── */}
      <FeatureCards />

      {/* ── Category Nav ─────────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StartPageCategoryLinks />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 backdrop-blur-xs py-6 px-4 mt-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary shrink-0" />
            <span>
              Featured Spotlight:{" "}
              <strong>The Avengers Leadership Roster</strong> &{" "}
              <strong>Multiverse Combat Engine</strong>
            </span>
          </div>
          <StartPageFooterLinks />
        </div>
      </footer>
    </div>
  );
}