"use client";

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { sampleCharacterIds } from "@/app/actions";
import { Dices, ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { useTransition, useState } from "react";
import { MatchMode, parseIdList } from "@/lib/matchup/matchupParams";
import { MAX_BRACKET_SIZE, MAX_TEAM_SIZE } from "@/app/(main)/matchup/page";

type Props = {
    mode: MatchMode;
    idsA?: number[];
    idsB?: number[];
    idsBracket?: number[];
};

export function FillSidesDropdown({
    mode,
    idsA = [],
    idsB = [],
    idsBracket = [],
}: Props) {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const runAction = (type: "fill" | "replace", target: "A" | "B" | "both") => {
        setIsOpen(false);
        startTransition(async () => {
            const params = new URLSearchParams(searchParams.toString());

            if (mode === "bracket") {
                const current = idsBracket.length ? idsBracket : parseIdList(searchParams.get("p"));
                const count = type === "replace" ? MAX_BRACKET_SIZE : Math.max(0, MAX_BRACKET_SIZE - current.length);
                const exclude = type === "replace" ? [] : current;
                const newIds = count > 0 ? await sampleCharacterIds(count, exclude) : [];
                const final = type === "replace" ? newIds : [...current, ...newIds];

                params.set("mode", "bracket");
                final.length ? params.set("p", final.join(",")) : params.delete("p");
                ["a", "b", "id1", "id2"].forEach((k) => params.delete(k));
                pushParams(params);
                return;
            }

            // --- Matchup Mode (Side A, Side B, or Both) ---
            const curA = idsA.length ? idsA : parseIdList(searchParams.get("a"));
            const curB = idsB.length ? idsB : parseIdList(searchParams.get("b"));

            let finalA = [...curA];
            let finalB = [...curB];

            if (target === "A" || target === "both") {
                const count = type === "replace" ? (curA.length > 0 ? curA.length : MAX_TEAM_SIZE) : Math.max(0, MAX_TEAM_SIZE - curA.length);
                const exclude = type === "replace" ? [] : curA;
                const newIds = count > 0 ? await sampleCharacterIds(count, exclude) : [];
                finalA = type === "replace" ? newIds : [...curA, ...newIds];
            }

            if (target === "B" || target === "both") {
                const count = type === "replace" ? (curB.length > 0 ? curB.length : MAX_TEAM_SIZE) : Math.max(0, MAX_TEAM_SIZE - curB.length);
                const exclude = type === "replace" ? [] : curB;
                const newIds = count > 0 ? await sampleCharacterIds(count, exclude) : [];
                finalB = type === "replace" ? newIds : [...curB, ...newIds];
            }

            params.set("mode", "matchup");
            ["id1", "id2", "p", "size"].forEach((k) => params.delete(k));

            finalA.length ? params.set("a", finalA.join(",")) : params.delete("a");
            finalB.length ? params.set("b", finalB.join(",")) : params.delete("b");

            pushParams(params);
        });
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                disabled={pending}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-muted-foreground/20 bg-card hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
                <Dices className={`size-3.5 text-primary ${pending ? "animate-spin" : ""}`} />
                <span className="hidden md:inline">{pending ? "Rolling…" : "Randomize / Fill"}</span>
                <ChevronDown className="size-3 opacity-60" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 text-xs space-y-1">
                        {mode === "bracket" ? (
                            <>
                                {!(idsBracket.length === MAX_BRACKET_SIZE) && <button onClick={() => runAction("fill", "both")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium transition-colors cursor-pointer">
                                    <Sparkles className="size-3.5 text-primary" /> Fill Empty Slots
                                </button>}
                                {!(idsBracket.length === 0) && <button onClick={() => runAction("replace", "both")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium text-red-400 transition-colors cursor-pointer">
                                    <RefreshCw className="size-3.5" /> Replace All
                                </button>}
                            </>
                        ) : (
                            <>
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team A</div>
                                {!(idsA.length === MAX_TEAM_SIZE) && <button onClick={() => runAction("fill", "A")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer">
                                    <Sparkles className="size-3 text-primary" /> Fill Side A
                                </button>}
                                {!(idsA.length === 0) && <button onClick={() => runAction("replace", "A")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer">
                                    <RefreshCw className="size-3 text-primary" /> Replace Side A
                                </button>}

                                <div className="h-px bg-border my-1" />

                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team B</div>
                                {!(idsB.length === MAX_TEAM_SIZE) && <button onClick={() => runAction("fill", "B")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer">
                                    <Sparkles className="size-3 text-secondary" /> Fill Side B
                                </button>}
                                {!(idsB.length === 0) && <button onClick={() => runAction("replace", "B")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer">
                                    <RefreshCw className="size-3 text-secondary" /> Replace Side B
                                </button>}

                                <div className="h-px bg-border my-1" />

                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Both</div>
                                {(!(idsB.length === MAX_TEAM_SIZE) && !(idsA.length === MAX_TEAM_SIZE)) && <button onClick={() => runAction("fill", "both")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left font-semibold text-amber-400 transition-colors cursor-pointer">
                                    <Sparkles className="size-3" /> Fill Both Sides
                                </button>}
                                {
                                    (!(idsB.length === 0) && !(idsA.length === 0)) &&
                                    < button onClick={() => runAction("replace", "both")} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left font-semibold text-red-400 transition-colors cursor-pointer">
                                        <RefreshCw className="size-3" /> Replace Both Sides
                                    </button>
                                }
                            </>
                        )}
                    </div>
                </>
            )
            }
        </div >
    );
}