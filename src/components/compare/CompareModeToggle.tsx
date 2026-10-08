// components/compare/CompareModeToggle.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { parseIdList, type CompareMode } from "@/lib/compare/compareParams";

function detectClientMode(searchParams: URLSearchParams): CompareMode {
    if (searchParams.get("mode") === "bracket" || searchParams.get("p")) {
        return "bracket";
    }
    if (
        searchParams.get("mode") === "team" ||
        searchParams.get("a") ||
        searchParams.get("b")
    ) {
        return "team";
    }
    return "1v1";
}

export function CompareModeToggle() {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const current = detectClientMode(searchParams);

    const go = (next: CompareMode) => {
        if (next === current) return;

        const params = new URLSearchParams(searchParams.toString());

        if (next === "1v1") {
            params.delete("mode");
            params.delete("a");
            params.delete("b");
            params.delete("p");
            params.delete("size");

            // Prefer existing id1/id2; otherwise seed from team/bracket
            const hasId1 = params.get("id1");
            const hasId2 = params.get("id2");
            if (!hasId1 || !hasId2) {
                const seed = parseIdList(
                    searchParams.get("p") ||
                    [searchParams.get("a"), searchParams.get("b")]
                        .filter(Boolean)
                        .join(",") ||
                    undefined,
                );
                if (!hasId1 && seed[0] != null) params.set("id1", String(seed[0]));
                if (!hasId2 && seed[1] != null) params.set("id2", String(seed[1]));
            }

            pushParams(params);
            return;
        }

        if (next === "team") {
            params.set("mode", "team");
            params.delete("p");
            params.delete("size");

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

            // Determine bracket size: check existing param, default to 8 if count > 4, else 4
            const rawSize = searchParams.get("size");
            const targetSize = rawSize
                ? parseInt(rawSize, 10)
                : unique.length > 4
                    ? 8
                    : 4;

            const trimmedParticipants = unique.slice(0, targetSize);

            params.set("mode", "bracket");
            params.set("size", String(targetSize));

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
            {btn("1v1", "1 vs 1")}
            {btn("team", "Teams")}
            {btn("bracket", "Bracket")}
        </div>
    );
}