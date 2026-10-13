"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Sparkles } from "lucide-react";
import { searchCharacters } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { CharacterOption } from "@/types";

type Props = {
    excludeIds: number[];
    paramKey: "a" | "b" | "p";
    ids: number[];
    selectedIds?: number[];
    initialOptions?: CharacterOption[];
    placeholder?: string;
    disabled?: boolean;
    max?: number;
};

export function TeamAddCombobox({
    excludeIds,
    paramKey,
    ids,
    selectedIds = [],
    initialOptions = [],
    placeholder = "Add character…",
    disabled = false,
    max = 10,
}: Props) {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();

    const [options, setOptions] = useState<CharacterOption[]>(() =>
        initialOptions.filter((o) => !excludeIds.includes(o.id))
    );
    const [query, setQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    const excludeKey = useMemo(
        () =>
            [...excludeIds]
                .map(Number)
                .filter((n) => !Number.isNaN(n))
                .sort((a, b) => a - b)
                .join(","),
        [excludeIds]
    );

    const excludeSet = useMemo(
        () => new Set(excludeKey ? excludeKey.split(",").map(Number) : []),
        [excludeKey]
    );

    const initialRef = useRef(initialOptions);
    initialRef.current = initialOptions;

    useEffect(() => {
        if (!query.trim()) {
            setOptions(initialRef.current.filter((o) => !excludeSet.has(o.id)));
            return;
        }

        const t = setTimeout(() => {
            startTransition(async () => {
                const results = await searchCharacters(query, [...excludeSet], selectedIds);
                setOptions(results);
            });
        }, 250);

        return () => clearTimeout(t);
    }, [query, excludeKey, excludeSet]);

    const handleSelect = (slug: string | null) => {
        if (!slug) return;
        const match = options.find((o) => o.slug === slug);
        if (!match || excludeSet.has(match.id) || ids.includes(match.id)) return;
        if (ids.length >= max) return;

        const nextIds = [...ids, match.id];
        const params = new URLSearchParams(searchParams.toString());

        if (paramKey === "p") {
            params.set("mode", "bracket");
            params.set("size", String(max === 8 ? 8 : 4));
            params.set("p", nextIds.join(","));
            params.delete("a");
            params.delete("b");
            params.delete("id1");
            params.delete("id2");
        } else {
            params.set("mode", "team");
            params.set(paramKey, nextIds.join(","));
            params.delete("id1");
            params.delete("id2");
            params.delete("p");
            params.delete("size");
        }

        pushParams(params);
        setQuery("");
    };

    // Split into synergy picks (score > 0) and the rest
    const synergyPicks = options.filter((o) => (o.synergyScore ?? 0) > 0);
    const rest = options.filter((o) => (o.synergyScore ?? 0) === 0);
    const hasSynergy = selectedIds.length > 0 && synergyPicks.length > 0;

    return (
        <Combobox
            items={options}
            value=""
            onValueChange={handleSelect}
            onInputValueChange={(v) => setQuery(v ?? "")}
        >
            <ComboboxInput
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={disabled || ids.length >= max}
                className="w-full bg-transparent rounded-lg text-sm p-3 outline-none focus:border-primary border-none shadow-none"
            />
            <ComboboxContent>
                <ComboboxEmpty>
                    {isPending ? "Searching…" : "No character found."}
                </ComboboxEmpty>
                <ComboboxList>
                    {(item: CharacterOption) => {
                        const isSynergy = (item.synergyScore ?? 0) > 0;
                        const isFirstRest = !isSynergy && hasSynergy && item === rest[0];

                        return (
                            <>
                                {/* Synergy section header — render before first synergy item */}
                                {isSynergy && hasSynergy && item === synergyPicks[0] && (
                                    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                                            Good synergy
                                        </span>
                                    </div>
                                )}

                                <ComboboxItem
                                    key={item.id}
                                    value={item.slug}
                                    className={
                                        isSynergy
                                            ? "border-l-2 border-amber-400/60 bg-amber-400/5 data-[highlighted]:bg-amber-400/10"
                                            : ""
                                    }
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium truncate">{item.name}</span>
                                            {isSynergy && (
                                                <Sparkles className="w-3 h-3 shrink-0 text-amber-400/70" />
                                            )}
                                        </div>
                                        {item.biography?.fullName && (
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {item.biography.fullName}
                                            </span>
                                        )}
                                    </div>
                                </ComboboxItem>

                                {/* Divider before the "rest" group */}
                                {isFirstRest && (
                                    <div className="flex items-center gap-2 px-3 py-1.5">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-[10px] text-muted-foreground">Others</span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                )}
                            </>
                        );
                    }}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}