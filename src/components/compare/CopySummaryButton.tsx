// components/compare/CopySummaryButton.tsx
"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { CompareMode } from "@/lib/compare/compareParams";

type Props = {
  nameA?: string;
  nameB?: string;
  avgA?: number | null;
  avgB?: number | null;
  aceA?: { name: string; overall: number } | null;
  aceB?: { name: string; overall: number } | null;
  mode?: CompareMode;
  className?: string;
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
}: Props) {
  const [copied, setCopied] = useState(false);

  const buildSummary = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const edge =
      avgA != null && avgB != null ? avgA - avgB : null;
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
      // fallback
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