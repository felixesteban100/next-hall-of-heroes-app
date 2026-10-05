"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, useMemo } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { searchCharacters } from "@/app/actions";

export type CharacterOption = {
    id: number;
    name: string;
    slug: string;
};

interface CharacterComboboxProps {
    paramKey: "id1" | "id2";
    initialOptions: CharacterOption[];
    selectedId: number;
    selectedName: string;
    selectedSlug: string;
    excludeId: number;
}

export function CharacterCombobox({
    paramKey,
    initialOptions,
    selectedId,
    selectedName,
    selectedSlug,
    excludeId,
}: CharacterComboboxProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [options, setOptions] = useState<CharacterOption[]>(initialOptions);
    // null = not typing (show selected name); string = user is editing ("" is allowed)
    const [inputText, setInputText] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Always keep the current selection in the list (limit(10) may omit it)
    const items = useMemo(() => {
        const map = new Map<number, CharacterOption>();
        for (const o of options) {
            if (o.id !== excludeId) map.set(o.id, o);
        }
        if (selectedId && selectedId !== excludeId) {
            map.set(selectedId, {
                id: selectedId,
                name: selectedName,
                slug: selectedSlug,
            });
        }
        return Array.from(map.values());
    }, [options, selectedId, selectedName, selectedSlug, excludeId]);

    // After URL/selection changes, leave “typing” mode
    useEffect(() => {
        setInputText(null);
        setOptions(initialOptions);
    }, [selectedId, initialOptions]);

    // Search
    useEffect(() => {
        if (inputText === null) return;
        if (inputText.trim().length === 0) {
            setOptions(initialOptions);
            return;
        }

        const timer = setTimeout(() => {
            startTransition(async () => {
                const results = await searchCharacters(inputText, excludeId);
                setOptions(results);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [inputText, initialOptions, excludeId]);

    const handleSelect = (slug: string | null) => {
        if (!slug) return;
        const match = items.find((opt) => opt.slug === slug);
        if (!match) return;

        setInputText(null); // show selectedName again
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, match.id.toString());
        router.push(`?${params.toString()}`);
    };

    // What the user sees in the input
    const displayValue = inputText !== null ? inputText : selectedName;

    return (
        <Combobox
            items={items}
            value={selectedSlug}
            onValueChange={handleSelect}
            // Don't let the combobox overwrite the input with the slug
            inputValue={displayValue}
            onInputValueChange={(value) => {
                // Ignore library trying to push the slug into the input
                if (value === selectedSlug) return;
                setInputText(value);
            }}
        >
            <ComboboxInput
                placeholder="Search character..."
                // Controlled display: name while idle, free text while typing
                value={displayValue}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => {
                    if (inputText === null) setInputText(selectedName);
                }}
                onBlur={() => {
                    requestAnimationFrame(() => setInputText(null));
                }}
                className="w-full bg-transparent rounded-lg text-sm p-3 outline-none focus:border-primary border-none shadow-none"
            />
            <ComboboxContent>
                <ComboboxEmpty>
                    {isPending ? "Searching..." : "No character found."}
                </ComboboxEmpty>
                <ComboboxList>
                    {(item: CharacterOption) => (
                        <ComboboxItem key={item.id} value={item.slug}>
                            {item.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}