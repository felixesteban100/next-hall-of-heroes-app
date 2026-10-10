// components/compare/matchesVerdict/TeamMatchVerdict.tsx
import type { TeamAggregate } from "@/lib/compare/compare_utls";
import type { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
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

            {/* Hero number */}
            <p className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${scoreColor} leading-none`}>
                {team.powerEstimate.toFixed(1)}
            </p>

            {/* Secondary */}
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

            {/* Tertiary boosts — single quiet line */}
            <div className={`text-[10px] sm:text-[11px] ${soft} flex flex-col md:flex-row ${align === "right" ? "justify-end" : "justify-start"}`}>
                {team.chemistry && (
                    <div className={`flex gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
                        <span>Chem {team.chemistry.score}</span>
                        {team.chemistryBoost > 0 && (
                            <span className="text-muted-foreground"> (+{team.chemistryBoost.toFixed(1)})</span>
                        )}
                    </div>
                )}
                {team.supportBoost > 0 && (
                    <>
                        {team.chemistry ? <span className="mx-1 text-muted-foreground/40">·</span> : null}
                        Support +{team.supportBoost.toFixed(1)}
                    </>
                )}
                <span className="mx-1 text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">Σ {team.scoresCombined.toFixed(0)}</span>
            </div>

            {/* Notes */}
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
                <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1">
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
                className={`rounded-full text-[10px] font-bold px-2.5 py-1 ${aWins ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                    }`}
            >
                {isNemesis ? "⚡ " : ""}
                {aWins ? "A edge" : "B edge"}
            </span>
            <span className="text-[9px] tabular-nums text-muted-foreground">
                {aWins ? "Avg" : "Avg"} {d >= 0 ? "+" : ""}
                {d.toFixed(1)}
            </span>
        </div>
    );
}

export default function TeamMatchVerdict({
    nameA,
    nameB,
    teamA,
    teamB,
    isNemesis,
}: Props) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-muted-foreground/15 bg-card/80 backdrop-blur-sm shadow-sm">
            {/* soft glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />

            <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center px-4 py-5 sm:px-6 sm:py-6">
                <Side name={nameA} team={teamA} variant="primary" align="right" />

                <div className="flex flex-col items-center gap-2 shrink-0">
                    <VS />
                    <EdgeBadge
                        a={teamA?.powerEstimate ?? null}
                        b={teamB?.powerEstimate ?? null}
                        isNemesis={isNemesis}
                    />
                </div>

                <Side name={nameB} team={teamB} variant="secondary" align="left" />
            </div>
        </div>
    );
}