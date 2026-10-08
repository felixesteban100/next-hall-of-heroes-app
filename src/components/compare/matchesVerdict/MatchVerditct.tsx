import { compareMatchScores, MatchBreakdown } from "@/lib/compare_utls";
import { Trophy, Swords, Equal } from "lucide-react";

type Props = {
    nameA?: string;
    nameB?: string;
    scoreA: MatchBreakdown | null;
    scoreB: MatchBreakdown | null;
    isNemesis?: boolean;
};

export function MatchVerdict({
    nameA = "Entity A",
    nameB = "Entity B",
    // nameA = "Character A",
    // nameB = "Character B",
    scoreA,
    scoreB,
    isNemesis,
}: Props) {
    const verdict = compareMatchScores(scoreA, scoreB);

    return (
        <div className="sticky top-0 z-30 mb-4 rounded-xl border border-muted-foreground/20 bg-card/95 backdrop-blur-md shadow-lg">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 p-3 sm:p-4">
                {/* A */}
                <div className="text-right min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
                        {nameA}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-primary tabular-nums">
                        {scoreA ? scoreA.overall.toFixed(1) : "—"}
                    </p>
                </div>

                {/* Center */}
                <div className="flex flex-col items-center gap-1 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-background font-black text-sm">
                        VS
                    </div>
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
                    <span className="text-[10px] text-muted-foreground text-center max-w-[9rem]">
                        {verdict.label}
                    </span>
                </div>

                {/* B */}
                <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
                        {nameB}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-secondary tabular-nums">
                        {scoreB ? scoreB.overall.toFixed(1) : "—"}
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
    );
}