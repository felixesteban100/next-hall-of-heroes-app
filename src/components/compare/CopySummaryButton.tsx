// components/compare/CopySummaryButton.tsx
"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { CompareMode } from "@/lib/compare/compareParams";
import { Bout } from "@/lib/compare/bracket";

type Props = {
  nameA?: string;
  nameB?: string;
  avgA?: number | null;
  avgB?: number | null;
  aceA?: { name: string; overall: number } | null;
  aceB?: { name: string; overall: number } | null;
  mode?: CompareMode;
  className?: string;
  champion?: { name: string } | null;
  totalCorrect?: number;
  totalVoted?: number;
  fighterCount?: number;
  allBouts?: Bout[];
  userPredictions?: Record<string, string | number>;
};

function fmt(n: number | null | undefined) {
  return n == null || Number.isNaN(n) ? "—" : n.toFixed(1);
}

export function CopySummaryButton({
  nameA = "Side A",
  nameB = "Side B",
  avgA,
  avgB,
  aceA,
  aceB,
  mode = "1v1",
  className = "",
  champion,
  totalCorrect = 0,
  totalVoted = 0,
  fighterCount,
  allBouts = [],
  userPredictions = {},
}: Props) {
  const [copied, setCopied] = useState(false);

  const buildSummary = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (mode === "bracket") {
      const champStr = champion ? `🏆 Champion: ${champion.name}` : "🏆 Tournament in progress";
      const accuracyPct = totalVoted > 0 ? Math.round((totalCorrect / totalVoted) * 100) : 0;
      const scoreStr = totalVoted > 0 ? `🎯 Overall Accuracy: ${totalCorrect}/${totalVoted} (${accuracyPct}%)` : "🎯 No predictions cast yet";
      const sizeStr = fighterCount ? `${fighterCount}-Fighter Tournament` : "Custom Bracket";

      // Build detailed match breakdown using your Edge / Toss-up logic
      const boutLines = allBouts.map((bout, idx) => {
        const fighterA = bout.a?.name || "TBD";
        const fighterB = bout.b?.name || "TBD";
        const scoreA = bout.scoreA;
        const scoreB = bout.scoreB;
        const actualWinner = bout.winner?.name || "Pending";

        // Edge and Toss-up Calculation Logic
        let edgeDescription = "Pending";
        if (scoreA != null && scoreB != null) {
          const d = scoreA - scoreB;
          const pct = Math.abs(d) / Math.max(scoreA, scoreB, 1);

          if (pct < 0.06) {
            edgeDescription = `⚖️ Toss-up (Δ ${d >= 0 ? "+" : ""}${d.toFixed(1)})`;
          } else {
            const aWins = d > 0;
            edgeDescription = `${aWins ? "A" : "B"} edge (+${Math.abs(d).toFixed(1)})`;
          }
        }

        // Find what the user picked
        const userChoiceId = userPredictions[bout.id];
        const userPickedName =
          userChoiceId === bout.a?.id ? fighterA :
            userChoiceId === bout.b?.id ? fighterB : "No Pick";

        const isCorrect = userChoiceId != null && bout.winner?.id != null && userChoiceId === bout.winner.id;
        const resultIcon = userChoiceId == null ? "⏳" : isCorrect ? "✅" : "❌";

        return `Match ${idx + 1} [${bout.roundName}]:\n  • ${fighterA} vs ${fighterB}\n  • Matchup: ${edgeDescription}\n  • Winner: ${actualWinner}\n  • Your Pick: ${userPickedName} ${resultIcon}`;
      });

      return [
        `⚔️ Hall of Heroes - ${sizeStr}`,
        champStr,
        scoreStr,
        "\n📋 Match Breakdown:",
        ...boutLines,
        `\n🔗 ${url}`
      ].filter(Boolean).join("\n");
    }

    // Standard 1v1 / Team summaries...
    const edge = avgA != null && avgB != null ? avgA - avgB : null;
    const edgeText =
      edge == null
        ? ""
        : edge > 0.3
          ? ` · ${nameA} edges by +${edge.toFixed(1)}`
          : edge < -0.3
            ? ` · ${nameB} edges by +${Math.abs(edge).toFixed(1)}`
            : " · roughly even";

    const aceLine =
      aceA || aceB
        ? ` · Ace: ${aceA ? `${aceA.name} (${fmt(aceA.overall)})` : "—"} vs ${aceB ? `${aceB.name} (${fmt(aceB.overall)})` : "—"}`
        : "";

    return mode === "team"
      ? `Team compare: ${nameA} (${fmt(avgA)} avg) vs ${nameB} (${fmt(avgB)} avg)${aceLine}${edgeText}\n${url}`
      : `Compare: ${nameA} (${fmt(avgA)}) vs ${nameB} (${fmt(avgB)})${edgeText}\n${url}`;
  };

  const onCopy = async () => {
    const text = buildSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy summary:", text);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-muted-foreground/20 bg-card hover:bg-muted/50 transition-colors ${className}`}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Link2 className="size-3.5" />
          Copy summary
        </>
      )}
    </button>
  );
}