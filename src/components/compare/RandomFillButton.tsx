// components/compare/RandomFillButton.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { sampleCharacterIds } from "@/app/actions";
import { Dices } from "lucide-react";
import { useTransition } from "react";
import { CompareMode, parseIdList } from "@/lib/compare/compareParams";
import { MAX_BRACKET_SIZE, MAX_TEAM_SIZE } from "@/app/(main)/compare/page";

type Props = {
    mode: CompareMode;
    idsA?: number[];
    idsB?: number[];
    idsBracket?: number[];
    sizeA?: number;
    sizeB?: number;
    bracketSize?: number;
};

export function RandomFillButton({
    mode,
    idsA = [],
    idsB = [],
    idsBracket = [],
    sizeA = MAX_TEAM_SIZE,
    sizeB = MAX_TEAM_SIZE,
}: Props) {
    const { push: pushParams } = useRouter();
    const searchParams = useSearchParams();
    const [pending, start] = useTransition();

    const onClick = () => {
        start(async () => {
            const params = new URLSearchParams(searchParams.toString());

            if (mode === "bracket") {
                const targetSize = MAX_BRACKET_SIZE;

                // Read current bracket IDs or fall back to passed props
                const currentBracketIds =
                    idsBracket.length > 0
                        ? idsBracket
                        : parseIdList(searchParams.get("p"));

                // How many new IDs we need to fill the remaining bracket slots up to 24 max
                const neededCount = Math.max(0, targetSize - currentBracketIds.length);

                if (neededCount === 0 || currentBracketIds.length >= targetSize) {
                    // Bracket is full or exceeded -> randomize a fresh set of size `targetSize` (24)
                    const freshIds = await sampleCharacterIds(targetSize, []);
                    params.set("mode", "bracket");
                    params.set("p", freshIds.join(","));
                } else {
                    // Fill remaining empty slots up to 24 while excluding existing IDs
                    const newIds = await sampleCharacterIds(neededCount, currentBracketIds);
                    const completeRoster = [...currentBracketIds, ...newIds].slice(0, targetSize);

                    params.set("mode", "bracket");
                    params.set("p", completeRoster.join(","));
                }

                // Cleanup non-bracket params
                params.delete("a");
                params.delete("b");
                params.delete("id1");
                params.delete("id2");


                pushParams(`?${params.toString()}`);
            } else if (mode === "team") {
                const a = await sampleCharacterIds(sizeA, [...idsA, ...idsB]);
                const b = await sampleCharacterIds(sizeB, [...idsA, ...idsB, ...a]);

                params.set("mode", "team");
                params.delete("id1");
                params.delete("id2");
                params.delete("p");
                params.delete("size");
                params.set("a", a.join(","));
                params.set("b", b.join(","));
                params.delete("a_name");
                params.delete("b_name");

                pushParams(`?${params.toString()}`);
            } else {
                // 1v1 mode
                const [id1, id2] = await sampleCharacterIds(2, [...idsA, ...idsB]);

                params.delete("mode");
                params.delete("a");
                params.delete("b");
                params.delete("p");
                params.delete("size");
                params.delete("a_name");
                params.delete("b_name");
                if (id1) params.set("id1", String(id1));
                if (id2) params.set("id2", String(id2));

                pushParams(`?${params.toString()}`);
            }
        });
    };

    return (
        <button
            type="button"
            disabled={pending}
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-muted-foreground/20 bg-card hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer"
        >
            <Dices className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
            {pending ? "Rolling…" : "Surprise me"}
        </button>
    );
}