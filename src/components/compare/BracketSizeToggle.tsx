// components/compare/BracketSizeToggle.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { parseIdList } from "@/lib/compare/compareParams";

export function BracketSizeToggle() {
    const searchParams = useSearchParams();
    const { pushParams } = useParamLoading();
    const size = searchParams.get("size") === "8" ? 8 : 4;
    const ids = parseIdList(searchParams.get("p"));

    const setSize = (next: 4 | 8) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "bracket");
        params.set("size", String(next));
        const clipped = ids.slice(0, next);
        if (clipped.length) params.set("p", clipped.join(","));
        else params.delete("p");
        params.delete("a");
        params.delete("b");
        params.delete("id1");
        params.delete("id2");
        pushParams(params);
    };

    return (
        <div className="inline-flex rounded-lg border p-0.5 text-xs font-semibold">
            <button type="button" onClick={() => setSize(4)} className={size === 4 ? "bg-primary text-primary-foreground px-2 py-1 rounded-md" : "px-2 py-1"}>
                4
            </button>
            <button type="button" onClick={() => setSize(8)} className={size === 8 ? "bg-primary text-primary-foreground px-2 py-1 rounded-md" : "px-2 py-1"}>
                8
            </button>
        </div>
    );
}