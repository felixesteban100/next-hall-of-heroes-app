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
import { searchCharacters } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { CharacterOption } from "@/types";

type Props = {
    excludeIds: number[];
    /** "a" | "b" for teams, or "p" for a bracket */
    paramKey: "a" | "b" | "p";
    /** Current team ids from the URL */
    ids: number[];
    initialOptions?: CharacterOption[];
    placeholder?: string;
    disabled?: boolean;
    max?: number;
};

export function TeamAddCombobox({
    excludeIds,
    paramKey,
    ids,
    initialOptions = [],
    placeholder = "Add character…",
    disabled = false,
    max = 10, // MAX_TEAM_SIZE
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
        () =>
            new Set(excludeKey ? excludeKey.split(",").map(Number) : []),
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
                const results = await searchCharacters(query, [...excludeSet]);
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
            // existing team a/b branch
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
                    {(item: CharacterOption) => (
                        <ComboboxItem key={item.id} value={item.slug}>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-medium truncate">{item.name}</span>
                                {item.biography?.fullName && (
                                    <span className="text-[10px] text-muted-foreground truncate">
                                        {item.biography.fullName}
                                    </span>
                                )}
                            </div>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}