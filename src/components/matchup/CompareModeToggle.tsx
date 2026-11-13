"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { MatchMode } from "@/lib/matchup/matchupParams";

export function CompareModeToggle() {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const current = searchParams.get("mode") ?? "matchup";

    const go = (next: MatchMode) => {
        if (next === current) return;
        const params = new URLSearchParams(searchParams.toString());
        // Leaving 'a', 'b', and 'p' intact means each mode preserves its own characters!
        params.set("mode", next);
        pushParams(params);
    };

    const btn = (m: MatchMode, label: string) => (
        <button
            type="button"
            onClick={() => go(m)}
            className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${current === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="inline-flex rounded-xl border border-muted-foreground/20 bg-card p-1 text-xs font-semibold">
            {btn("matchup", "Matchup")}
            {btn("bracket", "Bracket")}
        </div>
    );
}