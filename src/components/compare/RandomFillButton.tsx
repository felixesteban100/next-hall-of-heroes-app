// components/compare/RandomFillButton.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { sampleCharacterIds } from "@/app/actions";
import { Dices } from "lucide-react";
import { useTransition } from "react";
import { CompareMode } from "@/lib/compare/compareParams";

export function RandomFillButton({
    mode,
    idsA,
    idsB,
    sizeA = 3,
    sizeB = 3,
}: {
    mode: CompareMode;
    idsA: number[];
    idsB: number[];
    sizeA?: number;
    sizeB?: number;
}) {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const [pending, start] = useTransition();

    const onClick = () => {
        start(async () => {
            if (mode === "team") {
                const a = await sampleCharacterIds(sizeA, [...idsA, ...idsB]);
                const b = await sampleCharacterIds(sizeB, [...idsA, ...idsB, ...a]);
                const params = new URLSearchParams(searchParams.toString());
                params.set("mode", "team");
                params.delete("id1");
                params.delete("id2");
                params.set("a", a.join(","));
                params.set("b", b.join(","));
                pushParams(params);
            } else {
                const [id1, id2] = await sampleCharacterIds(2, [...idsA, ...idsB]);
                const params = new URLSearchParams(searchParams.toString());
                params.delete("mode");
                params.delete("a");
                params.delete("b");
                if (id1) params.set("id1", String(id1));
                if (id2) params.set("id2", String(id2));
                pushParams(params);
            }
        });
    };

    return (
        <button
            type="button"
            disabled={pending}
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-muted-foreground/20 bg-card hover:bg-muted/50 disabled:opacity-50"
        >
            <Dices className="size-3.5" />
            {pending ? "Rolling…" : "Surprise me"}
        </button>
    );
}