// components/compare/CompareModeToggle.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { parseIdList } from "@/lib/compare/compareParams";
import { MAX_BRACKET_SIZE } from "@/app/(main)/compare/page";

// 🌟 Restricted to team and bracket only
export type CompareMode = "team" | "bracket";

function detectClientMode(searchParams: URLSearchParams): CompareMode {
    if (searchParams.get("mode") === "bracket" || searchParams.get("p")) {
        return "bracket";
    }
    // Default fallback to team since 1v1 is gone
    return "team";
}

export function CompareModeToggle() {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const current = detectClientMode(searchParams);

    const go = (next: CompareMode) => {
        if (next === current) return;

        const params = new URLSearchParams(searchParams.toString());

        if (next === "team") {
            params.set("mode", "team");
            params.delete("p");
            params.delete("size");

            // Seed from id1/id2 if switching from legacy states
            if (!params.get("a") && searchParams.get("id1")) {
                params.set("a", searchParams.get("id1")!);
            }
            if (!params.get("b") && searchParams.get("id2")) {
                params.set("b", searchParams.get("id2")!);
            }

            // If coming from bracket, put first half in a, rest in b
            if (!params.get("a") && !params.get("b") && searchParams.get("p")) {
                const seed = parseIdList(searchParams.get("p"));
                const mid = Math.ceil(seed.length / 2);
                if (seed.length) {
                    params.set("a", seed.slice(0, mid).join(","));
                    if (seed.length > mid) params.set("b", seed.slice(mid).join(","));
                }
            }

            params.delete("id1");
            params.delete("id2");
            params.delete("a_name");
            params.delete("b_name");
            pushParams(params);
            return;
        }

        if (next === "bracket") {
            // Seed IDs from current parameters (p, a, b, id1, id2)
            const seed = [
                ...parseIdList(searchParams.get("p")),
                ...parseIdList(searchParams.get("a")),
                ...parseIdList(searchParams.get("b")),
                Number(searchParams.get("id1")),
                Number(searchParams.get("id2")),
            ].filter((n) => typeof n === "number" && !Number.isNaN(n) && n > 0);

            // Unique deduplicated participant IDs
            const unique = Array.from(new Set(seed));
            const trimmedParticipants = unique.slice(0, MAX_BRACKET_SIZE);

            params.set("mode", "bracket");

            if (trimmedParticipants.length > 0) {
                params.set("p", trimmedParticipants.join(","));
            } else {
                params.delete("p");
            }

            // Cleanup non-bracket query params
            params.delete("a");
            params.delete("b");
            params.delete("id1");
            params.delete("id2");
            params.delete("a_name");
            params.delete("b_name");

            pushParams(params);
            return;
        }
    };

    const btn = (m: CompareMode, label: string) => (
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
            {btn("team", "Teams")}
            {btn("bracket", "Bracket")}
        </div>
    );
}