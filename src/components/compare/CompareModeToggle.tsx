// components/compare/CompareModeToggle.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils"; // or your cn helper
import { useParamLoading } from "../layout/ParamLoadingContext";

export function CompareModeToggle() {
    const { pushParams } = useParamLoading()
    const searchParams = useSearchParams();

    const mode =
        searchParams.get("mode") === "team" ||
            searchParams.has("a") ||
            searchParams.has("b")
            ? "team"
            : "1v1";

    const setMode = (next: "1v1" | "team") => {
        const params = new URLSearchParams(searchParams.toString());

        if (next === "1v1") {
            params.delete("mode");
            params.delete("a");
            params.delete("b");
            // keep first id of each side if coming from team
            const a = searchParams.get("a")?.split(",")[0];
            const b = searchParams.get("b")?.split(",")[0];
            if (a) params.set("id1", a);
            if (b) params.set("id2", b);
        } else {
            params.set("mode", "team");
            const id1 = searchParams.get("id1");
            const id2 = searchParams.get("id2");
            if (id1) params.set("a", id1);
            if (id2) params.set("b", id2);
            params.delete("id1");
            params.delete("id2");
        }

        pushParams(params);
    };

    return (
        <div className="inline-flex rounded-xl border border-muted-foreground/20 bg-card p-1 text-xs font-semibold">
            <button
                type="button"
                onClick={() => setMode("1v1")}
                className={cn(
                    "rounded-lg px-3 py-1.5 transition-colors",
                    mode === "1v1"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                1 vs 1
            </button>
            <button
                type="button"
                onClick={() => setMode("team")}
                className={cn(
                    "rounded-lg px-3 py-1.5 transition-colors",
                    mode === "team"
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Teams
            </button>
        </div>
    );
}