"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    sizeA?: number;
    sizeB?: number;
};

export function FillSidesDropdown({
    mode,
    idsA = [],
    idsB = [],
    idsBracket = [],
    sizeA = MAX_TEAM_SIZE,
    sizeB = MAX_TEAM_SIZE,
}: Props) {
    const { push: pushParams } = useRouter();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (actionType: "fill" | "replace", target: "A" | "B" | "both") => {
        setIsOpen(false);
        startTransition(async () => {
            const params = new URLSearchParams(searchParams.toString());

            if (mode === "bracket") {
                const targetSize = MAX_BRACKET_SIZE;
                const currentBracketIds =
                    idsBracket.length > 0 ? idsBracket : parseIdList(searchParams.get("p"));

                let finalBracket: number[] = [];
                if (actionType === "replace") {
                    finalBracket = await sampleCharacterIds(targetSize, []);
                } else {
                    const needed = Math.max(0, targetSize - currentBracketIds.length);
                    const newIds = await sampleCharacterIds(needed, currentBracketIds);
                    finalBracket = [...currentBracketIds, ...newIds].slice(0, targetSize);
                }

                params.set("mode", "bracket");
                params.set("p", finalBracket.join(","));
                params.delete("a");
                params.delete("b");
                params.delete("id1");
                params.delete("id2");

                pushParams(`?${params.toString()}`);
                return;
            }

            // --- Matchup Mode Logic (Robust fallback to URL params if props are empty) ---
            const currentA = idsA.length > 0 ? idsA : parseIdList(searchParams.get("a"));
            const currentB = idsB.length > 0 ? idsB : parseIdList(searchParams.get("b"));

            let newA = [...currentA];
            let newB = [...currentB];

            if (target === "A" || target === "both") {
                if (actionType === "replace") {
                    newA = await sampleCharacterIds(sizeA, []);
                } else {
                    const neededA = Math.max(0, sizeA - newA.length);
                    if (neededA > 0) {
                        const sampledA = await sampleCharacterIds(neededA, [...newA, ...newB]);
                        newA = [...newA, ...sampledA].slice(0, sizeA);
                    }
                }
            }

            if (target === "B" || target === "both") {
                if (actionType === "replace") {
                    // When replacing B, ensure we exclude newly generated A IDs if "both" was triggered
                    newB = await sampleCharacterIds(sizeB, target === "both" ? newA : []);
                } else {
                    const neededB = Math.max(0, sizeB - newB.length);
                    if (neededB > 0) {
                        const sampledB = await sampleCharacterIds(neededB, [...newA, ...newB]);
                        newB = [...newB, ...sampledB].slice(0, sizeB);
                    }
                }
            }

            params.set("mode", "matchup");
            params.delete("id1");
            params.delete("id2");
            params.delete("p");
            params.delete("size");
            params.set("a", newA.join(","));
            params.set("b", newB.join(","));

            pushParams(`?${params.toString()}`);
        });
    };

    const currentA = idsA.length > 0 ? idsA : parseIdList(searchParams.get("a"));
    const currentB = idsB.length > 0 ? idsB : parseIdList(searchParams.get("b"));

    return (
        <div className="relative inline-block text-left">
            {/* Main Trigger Button */}
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

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop to close on outside click */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 text-xs">
                        {mode === "bracket" ? (
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleAction("fill", "both")}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium transition-colors"
                                >
                                    <Sparkles className="size-3.5 text-primary" />
                                    <span>Fill Empty Bracket Slots</span>
                                </button>
                                <button
                                    onClick={() => handleAction("replace", "both")}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium transition-colors text-red-400 hover:text-red-300"
                                >
                                    <RefreshCw className="size-3.5 text-primary" />
                                    <span>Replace All Bracket Roster</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Side A Options */}
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Team / Side A
                                </div>

                                {!(currentA.length >= sizeA) && (
                                    <button
                                        onClick={() => handleAction("fill", "A")}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer"
                                    >
                                        <Sparkles className="size-3 text-primary" />
                                        <span>Fill Empty Slots (Side A)</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction("replace", "A")}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer"
                                >
                                    <RefreshCw className="size-3 text-primary" />
                                    <span>Replace All (Side A)</span>
                                </button>

                                <div className="h-px bg-border my-1" />

                                {/* Side B Options */}
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Team / Side B
                                </div>
                                {!(currentB.length >= sizeB) && (
                                    <button
                                        onClick={() => handleAction("fill", "B")}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer"
                                    >
                                        <Sparkles className="size-3 text-secondary" />
                                        <span>Fill Empty Slots (Side B)</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction("replace", "B")}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left transition-colors cursor-pointer"
                                >
                                    <RefreshCw className="size-3 text-secondary" />
                                    <span>Replace All (Side B)</span>
                                </button>

                                <div className="h-px bg-border my-1" />

                                {/* Both Sides Options */}
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Global Matchup
                                </div>
                                {(!(currentA.length >= sizeA) || !(currentB.length >= sizeB)) &&
                                    <button
                                        onClick={() => handleAction("fill", "both")}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left font-semibold transition-colors text-amber-400 cursor-pointer"
                                    >
                                        <Sparkles className="size-3" />
                                        <span>Fill Both Sides</span>
                                    </button>
                                }
                                <button
                                    onClick={() => handleAction("replace", "both")}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted text-left font-semibold transition-colors text-red-400 cursor-pointer"
                                >
                                    <RefreshCw className="size-3" />
                                    <span>Replace Both Sides (Surprise)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}