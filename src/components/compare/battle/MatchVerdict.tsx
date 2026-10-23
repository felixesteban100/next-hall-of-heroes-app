// components/compare/matchesVerdict/TeamMatchVerdict.tsx
import type { TeamAggregate } from "@/lib/compare";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { Zap, Trophy, ShieldAlert } from "lucide-react";
import VS from "../VS";

type Props = {
    nameA?: string;
    nameB?: string;
    teamA: TeamAggregate | null;
    teamB: TeamAggregate | null;
    isNemesis?: boolean;
    entitiesA?: CharacterWithJoinTeamUniversePowerEnemies[];
    entitiesB?: CharacterWithJoinTeamUniversePowerEnemies[];
};

export default function MatchVerdict({
    nameA,
    nameB,
    teamA,
    teamB,
    isNemesis,
}: Props) {
    // Calculate winner / draw status
    const scoreA = teamA?.powerEstimate ?? null;
    const scoreB = teamB?.powerEstimate ?? null;

    let verdictBanner = null;

    if (scoreA !== null && scoreB !== null) {
        const diff = Math.abs(scoreA - scoreB);
        const maxScore = Math.max(scoreA, scoreB, 1);
        const isDraw = diff / maxScore < 0.06; // 6% Toss-up threshold

        if (isDraw) {
            verdictBanner = {
                text: "Match Result: Too Close / Draw (Toss-up)",
                bg: "bg-muted/60 border-muted-foreground/20 text-muted-foreground",
                icon: <ShieldAlert className="w-3.5 h-3.5" />
            };
        } else if (scoreA > scoreB) {
            verdictBanner = {
                text: `Winner: ${nameA || "Team A"}`,
                bg: "bg-primary/15 border-primary/30 text-primary",
                icon: <Trophy className="w-3.5 h-3.5" />
            };
        } else {
            verdictBanner = {
                text: `Winner: ${nameB || "Team B"}`,
                bg: "bg-secondary/15 border-secondary/30 text-secondary",
                icon: <Trophy className="w-3.5 h-3.5" />
            };
        }
    }

    return (
        /* ${isNemesis
            ? "border-red-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] ring-1 ring-red-500/20"
            : "border-muted-foreground/15"
            } */
        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 bg-card/10 backdrop-blur-sm  `}>
            {/* Background glow */}
            <div className={`pointer-events-none absolute inset-0 `} />

            {/* Top Bar: Shows Winner / Draw + Nemesis status cleanly combined */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-muted-foreground/10 px-4 py-2 gap-2 bg-muted/20">
                {/* Winner or Draw Badge */}
                {verdictBanner ? (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${verdictBanner.bg}`}>
                        {verdictBanner.icon}
                        <span>{verdictBanner.text}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground font-medium">Awaiting match data...</span>
                )}


            </div>

            <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center px-4 py-5 sm:px-6 sm:py-6">
                <Side name={nameA} team={teamA} variant="primary" align="right" />

                <div className="flex flex-col items-center gap-2 shrink-0">
                    <VS />
                    <EdgeBadge
                        a={scoreA}
                        b={scoreB}
                        isNemesis={isNemesis}
                    />
                </div>

                <Side name={nameB} team={teamB} variant="secondary" align="left" />
            </div>
        </div>
    );
}

function Side({
    name,
    team,
    variant,
    align,
}: {
    name?: string;
    team: TeamAggregate | null;
    variant: "primary" | "secondary";
    align: "right" | "left";
}) {
    const isPrimary = variant === "primary";
    const scoreColor = isPrimary ? "text-primary" : "text-secondary";
    const soft = isPrimary ? "text-primary/80" : "text-secondary/80";
    const pill = isPrimary
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-secondary/10 text-secondary border-secondary/20";

    if (!team) {
        return (
            <div className={`min-w-0 space-y-1 ${align === "right" ? "text-right" : "text-left"}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground truncate">
                    {name ?? "—"}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-muted-foreground/30 tabular-nums">—</p>
            </div>
        );
    }

    const notes = team.chemistry?.notes?.slice(0, 3) ?? [];

    return (
        <div className={`min-w-0 space-y-2 ${align === "right" ? "text-right" : "text-left"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground truncate">
                {name ?? "Team"}
            </p>

            <p className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${scoreColor} leading-none`}>
                {team.powerEstimate.toFixed(1)}
            </p>

            <div className={`text-[11px] sm:text-xs text-muted-foreground flex flex-col md:flex-row ${align === "right" ? "justify-end" : "justify-start"}`}>
                <span className="text-foreground/80">Avg {team.avg.overall.toFixed(1)}</span>
                <span className="mx-1.5 text-muted-foreground/40">·</span>
                <span>
                    Ace {team.ace.overall.toFixed(1)}
                    {team.aceName ? (
                        <span className="text-muted-foreground"> ({team.aceName})</span>
                    ) : null}
                </span>
            </div>

            <div className={`text-[10px] sm:text-[11px] ${soft} flex flex-col md:flex-row ${align === "right" ? "justify-end" : "justify-start"}`}>
                {team.chemistry && (
                    <div className={`flex gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
                        <span>Chem {team.chemistry.score}</span>
                        {team.chemistryBoost > 0 && (
                            <span className="text-muted-foreground"> (+{team.chemistryBoost.toFixed(1)})</span>
                        )}
                    </div>
                )}
                {team.rosterMedian > 0 && (
                    <>
                        {team.chemistry ? <span className="mx-1 text-muted-foreground/40">·</span> : null}
                        Median Depth +{(team.rosterMedian * 0.35).toFixed(1)}
                    </>
                )}
                <span className="mx-1 text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">Σ {team.scoresCombined.toFixed(0)}</span>
            </div>

            {notes.length > 0 && (
                <div
                    className={`flex flex-wrap gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}
                >
                    {notes.map((n) => (
                        <span
                            key={n}
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-medium ${pill}`}
                        >
                            {n}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function EdgeBadge({
    a,
    b,
    isNemesis,
}: {
    a: number | null;
    b: number | null;
    isNemesis?: boolean;
}) {
    if (a == null && b == null) return null;
    if (a == null) {
        return (
            <span className="rounded-full bg-secondary/15 text-secondary text-[10px] font-bold px-2.5 py-1">
                B edge
            </span>
        );
    }
    if (b == null) {
        return (
            <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2.5 py-1">
                A edge
            </span>
        );
    }

    const d = a - b;
    const pct = Math.abs(d) / Math.max(a, b, 1);

    if (pct < 0.06) {
        return (
            <div className="flex flex-col items-center gap-1">
                <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 flex items-center gap-1">
                    {isNemesis && <Zap className="w-3 h-3 text-red-400 fill-red-400" />}
                    Toss-up
                </span>
                <span className="text-[9px] tabular-nums text-muted-foreground">
                    Δ {d >= 0 ? "+" : ""}
                    {d.toFixed(1)}
                </span>
            </div>
        );
    }

    const aWins = d > 0;
    return (
        <div className="flex flex-col items-center gap-1">
            <span
                className={`rounded-full text-[10px] font-bold px-2.5 py-1 flex items-center gap-1 ${aWins ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                    }`}
            >
                {isNemesis && <Zap className="w-3 h-3 text-red-400 fill-red-400" />}
                {aWins ? "A edge" : "B edge"}
            </span>
            <span className="text-[9px] tabular-nums text-muted-foreground">
                Avg {d >= 0 ? "+" : ""}
                {d.toFixed(1)}
            </span>
        </div>
    );
}

