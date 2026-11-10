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
import { connection } from "next/server"; // 🌟 Import connection
import { unstable_noStore as noStore } from "next/cache";

export const instant = false;

function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 17, t | 1);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const rnd = createSeededRandom(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function StartPage() {
  noStore();
  await connection();

  // ── Parallel data fetch ──────────────────────────────────────────────────
  const [
    characterCount,
    universeCount,
    teamCount,
    powerCount,
    topCharacters,
    allFeaturedCandidates,
  ] = await Promise.all([
    collectionCharacters.countDocuments({}),
    collectionUniverses.countDocuments({}),
    collectionTeams.countDocuments({}),
    collectionPowers.countDocuments({}),

    // Hero background: a few high-class characters with images, pick top by class+tier
    await collectionCharacters.aggregate([
      { $match: { "images.md": { $exists: true, $ne: "" } } },
      { $sample: { size: 6 } }, // 🎲 Grabs 5 random documents
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
    // await collectionCharacters.aggregate([
    //   { $match: { "images.md": { $exists: true, $ne: "" } } },
    //   { $sample: { size: 18 } }, // 🎲 Randomly picks 18 records
    //   {
    //     $project: {
    //       id: 1,
    //       name: 1,
    //       slug: 1,
    //       "images.md": 1,
    //       imageFocus: 1,
    //       "powerstats.total": 1,
    //       "biography.alignment": 1,
    //       "biography.publisher": 1,
    //       _id: 0,
    //     },
    //   },
    // ])
    //   .sort({ "powerstats.total": -1 })
    //   .toArray(),
    // Featured row: daily rotation handled entirely inside MongoDB using $$NOW
    // collectionCharacters.aggregate([
    //   { $match: { "images.md": { $exists: true, $ne: "" } } },
    //   {
    //     $addFields: {
    //       todayStr: {
    //         $dateToString: { format: "%Y-%m-%d", date: "$$NOW" }
    //       }
    //     }
    //   },
    //   {
    //     $addFields: {
    //       dailySortKey: { $concat: [{ $toString: "$_id" }, "-", "$todayStr"] }
    //     }
    //   },
    //   { $sort: { dailySortKey: 1 } },
    //   { $limit: 18 },
    //   {
    //     $project: {
    //       id: 1,
    //       name: 1,
    //       slug: 1,
    //       "images.md": 1,
    //       imageFocus: 1,
    //       "powerstats.total": 1,
    //       "biography.alignment": 1,
    //       "biography.publisher": 1,
    //       _id: 0,
    //     },
    //   },
    // ]).toArray()

    collectionCharacters
      .find(
        { "images.md": { $exists: true, $ne: "" } },
        {
          projection: {
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
        }
      )
      .toArray(),
  ]);

  const todayString = new Date().toISOString().slice(0, 10); // e.g. "2026-11-10"
  const dateSeed = parseInt(todayString.replace(/-/g, ""), 10); // e.g. 20261110
  const shuffledFeatured = shuffleWithSeed(allFeaturedCandidates, dateSeed);
  const featuredCharacters = shuffledFeatured.slice(0, 18);

  // Sanitize BSON for client props
  const sanitize = <T,>(docs: T[]): T[] => JSON.parse(JSON.stringify(docs));

  const heroChars = sanitize(topCharacters).map((c: any) => ({
    name: c.name,
    image: c.images?.md ?? "",
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