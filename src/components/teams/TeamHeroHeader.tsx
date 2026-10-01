import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Globe2 } from "lucide-react";

interface TeamHeroHeaderProps {
  team: {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    alignment?: string;
    universe?: { id: number; name: string; logo?: string };
    baseOfOperations?: string;
    firstAppearance?: string;
    membersCount?: number;
    avgPowerScore: number;
  };
}

export function TeamHeroHeader({ team }: TeamHeroHeaderProps) {
  const metaFields = [
    { label: "UNIVERSE", value: team.universe?.name || "Unknown" },
    { label: "BASE OF OPERATIONS", value: team.baseOfOperations || "Unknown" },
    { label: "DEBUT / FIRST APPEARANCE", value: team.firstAppearance || "Unknown" },
    {
      label: "AVG POWER SCORE",
      value: (
        <span>
          {Math.round(team.avgPowerScore)}%{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({team.membersCount ?? 0} members)
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      {/* Left: Team Image / Logo (Matching Character Carousel Dimensions) */}
      <div className="shrink-0 w-full md:w-80 h-80 md:h-[22rem] rounded-2xl border bg-muted/30 p-6 flex items-center justify-center relative overflow-hidden">
        {team.logo ? (
          <Image
            src={team.logo}
            alt={team.name}
            width={300}
            height={300}
            className="max-w-full max-h-full object-contain"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Globe2 className="w-12 h-12 stroke-1" />
            <span className="text-xs">No Logo Available</span>
          </div>
        )}
      </div>

      {/* Right: Info & Metadata Grid */}
      <div className="w-full flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Top Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
              <ShieldCheck size={16} className="mr-1" /> Hero
            </Badge>
          </div>

          {/* Title & ID */}
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm font-light">
            Team · <span className="font-semibold">#{team.id}</span>
          </p>

          {/* Description & Universe Publisher Logo */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <p className="text-sm leading-relaxed text-foreground/90 max-w-2xl">
              {team.description || "No description available for this team."}
            </p>

            {team.universe?.logo && (
              <div className="w-full sm:w-24 h-auto md:h-16 border-l-0 sm:border-l-4 flex items-center justify-center p-2 shrink-0">
                <Link href={`/universes/${team.universe.id}`}>
                  <Image
                    src={team.universe.logo}
                    alt={team.universe.name}
                    width={100}
                    height={100}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    unoptimized
                  />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Metadata Grid (Directly Matching Character Appearance Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 w-full pt-2">
          {metaFields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col gap-1 border p-2.5 rounded bg-muted/60"
            >
              <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">
                {field.label}
              </p>
              <p className="text-sm font-bold capitalize break-words leading-snug">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}