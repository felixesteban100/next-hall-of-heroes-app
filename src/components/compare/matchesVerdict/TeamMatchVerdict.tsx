import { compareMatchScores, MatchBreakdown } from "@/lib/compare_utls";
import { Equal, Swords, Trophy } from "lucide-react";

type Props = {
    nameA?: string;
    nameB?: string;
    teamA: {
        avg: MatchBreakdown;
        ace: MatchBreakdown;
        aceName: string | null;
        memberCount: number;
    };
    teamB: {
        avg: MatchBreakdown;
        ace: MatchBreakdown;
        aceName: string | null;
        memberCount: number;
    };
    isNemesis?: boolean;
};

export default function TeamMatchVerdict({ nameA, nameB, teamA, teamB, isNemesis }: Props) {
    const verdict = compareMatchScores(teamA.avg, teamB.avg);

    return (
        <div className="sticky top-0 z-30 mb-4 rounded-xl border border-muted-foreground/20 bg-card/95 backdrop-blur-md shadow-lg">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 p-3 sm:p-4">
                <div className="text-right space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground truncate">
                        {nameA}
                    </p>
                    <p className="text-3xl font-black text-primary tabular-nums">
                        {teamA.avg.overall.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Avg · Ace {teamA.ace.overall.toFixed(1)}
                        {teamA.aceName ? ` (${teamA.aceName})` : ""}
                    </p>
                </div>

                <div className="text-center">
                    {/* VS + edge from avg or ace — your choice */}
                    {verdict.winner === "a" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <Trophy className="size-3" /> A edge
                        </span>
                    )}
                    {verdict.winner === "b" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
                            <Trophy className="size-3" /> B edge
                        </span>
                    )}
                    {verdict.winner === "tie" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            <Equal className="size-3" /> Toss-up
                        </span>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                        Avg {(teamA.avg.overall - teamB.avg.overall) >= 0 ? "+" : ""}
                        {(teamA.avg.overall - teamB.avg.overall).toFixed(1)}
                        {" · "}
                        Ace {(teamA.ace.overall - teamB.ace.overall) >= 0 ? "+" : ""}
                        {(teamA.ace.overall - teamB.ace.overall).toFixed(1)}
                    </p>
                </div>

                <div className="text-left space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground truncate">
                        {nameB}
                    </p>
                    <p className="text-3xl font-black text-primary tabular-nums text-secondary">
                        {teamB.avg.overall.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Avg · Ace {teamB.ace.overall.toFixed(1)}
                        {teamB.aceName ? ` (${teamB.aceName})` : ""}
                    </p>
                </div>
            </div>
            {isNemesis && (
                <div className="border-t border-muted-foreground/15 px-3 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-amber-500">
                    <Swords className="size-3.5" />
                    Canonical rivalry — listed as enemies
                </div>
            )}
        </div>
    )
}
