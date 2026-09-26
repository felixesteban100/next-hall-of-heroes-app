"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input";
import { Button } from './ui/button';
import { useCallback, useState } from 'react';
import { ArrowBigDown, Mars, SearchIcon, SlidersHorizontal, Venus } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Power, Universe } from '@/types';
import { ButtonGroup } from './ui/button-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup } from './ui/dropdown-menu';
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, CHARACTER_TYPES } from '@/lib/constants';
import { CharacterBadgeIcon } from '@/lib/characters_utils';
import ActiveFiltersBadges, { ActiveFiltersBadgesProps } from './ActiveFiltersBadges';

const sortOptions = [
    { value: "id", label: "Id" },
    { value: "powerstats.total", label: "Power total" },
    { value: "name", label: "Name" },
    { value: "appearance.age", label: "Age" },
]

// Reusable section wrapper — eliminates the repeated label + Clear button pattern
export function FilterSection({ label, active, onClear, children }: {
    label: string;
    active: boolean;
    onClear: () => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex justify-between">
                <p className="font-light text-muted-foreground">{label}</p>
                <Button disabled={!active} variant="link" size="sm" onClick={onClear}>Clear</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">{children}</div>
        </div>
    );
}

type DraftFilters = {
    alignment: string;
    universe: string;
    character_type: string;
    tier: string;
    class: string;
    gender: string;
    powers: number[];
}

const EMPTY_FILTERS: DraftFilters = {
    alignment: "", universe: "", character_type: "",
    tier: "", class: "", gender: "", powers: [],
};

export const FilterBar = ({ universes, powers, activeFilterProps }: {
    universes: Universe[];
    powers: Power[];
    activeFilterProps: ActiveFiltersBadgesProps;
}) => {
    const { push } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [name, setName] = useState(searchParams.get("name") || "");
    const sort = searchParams.get("sort") || "id";
    const sortOrientation = searchParams.get("sortOrientation") || "desc";

    const [draftFilters, setDraftFilters] = useState<DraftFilters>({
        alignment: searchParams.get("alignment") || "",
        universe: searchParams.get("universe") || "",
        character_type: searchParams.get("character_type") || "",
        tier: searchParams.get("tier") || "",
        class: searchParams.get("class") || "",
        gender: searchParams.get("gender") || "",
        powers: JSON.parse(searchParams.get("powers") || "[]") as number[],
    });

    // Generic setter — eliminates all the setDraftFilters(prev => ({ ...prev, X: Y })) repetition
    const setFilter = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) =>
        setDraftFilters(prev => ({ ...prev, [key]: value }));

    const pushParams = useCallback((params: URLSearchParams) => {
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, push]);

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);
        pushParams(params);
    }, [searchParams, pushParams]);

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");

        // Collapse 7 near-identical blocks into a loop
        const stringFilters: [string, string][] = [
            ["alignment", draftFilters.alignment],
            ["universe", draftFilters.universe],
            ["character_type", draftFilters.character_type],
            ["tier", draftFilters.tier],
            ["class", draftFilters.class],
            ["gender", draftFilters.gender],
        ];
        for (const [key, value] of stringFilters) {
            params.delete(key);
            if (value) params.set(key, value);
        }
        params.delete("powers");
        if (draftFilters.powers.length > 0) {
            params.set("powers", `[${draftFilters.powers.toString()}]`);
        }
        pushParams(params);
    }, [draftFilters, searchParams, pushParams]);

    const removeFilter = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        params.delete("page");
        pushParams(params);
        setFilter(key as keyof DraftFilters, (key === "powers" ? [] : "") as never);
    }, [searchParams, pushParams]);

    const hasActiveFilters =
        !!draftFilters.alignment || !!draftFilters.gender ||
        !!draftFilters.tier || !!draftFilters.universe ||
        draftFilters.powers.length > 0;

    const activeFilterCount = [
        draftFilters.alignment, draftFilters.gender, draftFilters.tier,
        draftFilters.universe, draftFilters.class, draftFilters.character_type,
    ].filter(Boolean).length + (draftFilters.powers.length > 0 ? 1 : 0);

    return (
        <div className="flex flex-col gap-3 w-full">

            {/* Row 1 — search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search characters by name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateParam("name", name)}
                        className="pl-10 bg-muted/30"
                    />
                </div>
                <Button size="sm" onClick={() => updateParam("name", name)}>
                    <SearchIcon size={16} />
                </Button>
            </div>

            {/* Row 2 — chips + filter + sort */}
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <ActiveFiltersBadges {...activeFilterProps} onRemove={removeFilter} />
                </div>
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button size="sm" variant="outline">
                            <SlidersHorizontal size={16} /> Filter
                            {activeFilterCount > 0 && (
                                <span className="ml-1 text-xs bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 leading-none">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2 border-b pb-2">
                                <SlidersHorizontal size={16} /> Filter Characters
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto px-4 space-y-4">

                            <FilterSection label="ALIGNMENT" active={!!draftFilters.alignment} onClear={() => setFilter("alignment", "")}>
                                {[
                                    { value: "good", label: "Good", className: "text-green-500 hover:text-green-500" },
                                    { value: "neutral", label: "Anti-Hero", className: "text-yellow-500 hover:text-yellow-500" },
                                    { value: "bad", label: "Villain", className: "text-red-500 hover:text-red-500" },
                                ].map(({ value, label, className }) => (
                                    <Button key={value}
                                        variant={draftFilters.alignment === value ? "outline" : "ghost"}
                                        className={className}
                                        onClick={() => setFilter("alignment", value)}
                                    >
                                        {CharacterBadgeIcon(value)} {label}
                                    </Button>
                                ))}
                            </FilterSection>

                            <FilterSection label="TIER" active={!!draftFilters.tier} onClear={() => setFilter("tier", "")}>
                                {Object.entries(CHARACTER_TIER).map(([value, label]) => {
                                    const color = CHARACTER_TIER_COLOR[Number(value) as keyof typeof CHARACTER_TIER_COLOR];
                                    const Icon = CHARACTER_TIER_ICON[Number(value) as keyof typeof CHARACTER_TIER_ICON];
                                    return (
                                        <Button key={value}
                                            variant={draftFilters.tier === value ? "outline" : "ghost"}
                                            className={`${color.text} hover:${color.text} ${draftFilters.tier === value ? "font-bold" : "font-medium"}`}
                                            onClick={() => setFilter("tier", value)}
                                        >
                                            <Icon /> {label}
                                        </Button>
                                    );
                                })}
                            </FilterSection>

                            <FilterSection label="CLASS" active={!!draftFilters.class} onClear={() => setFilter("class", "")}>
                                {Object.entries(CHARACTER_CLASS).map(([value, label]) => {
                                    const color = CHARACTER_CLASS_COLOR[Number(value) as keyof typeof CHARACTER_CLASS_COLOR];
                                    const Icon = CHARACTER_CLASS_ICON[Number(value) as keyof typeof CHARACTER_CLASS_ICON];
                                    return (
                                        <Button key={value}
                                            variant={draftFilters.class === value ? "outline" : "ghost"}
                                            className={`${color.text} hover:${color.text} ${draftFilters.class === value ? "font-bold" : "font-medium"}`}
                                            onClick={() => setFilter("class", value)}
                                        >
                                            <Icon /> {label}
                                        </Button>
                                    );
                                })}
                            </FilterSection>

                            <FilterSection label="GENDER" active={!!draftFilters.gender} onClear={() => setFilter("gender", "")}>
                                <Button variant={draftFilters.gender === "Male" ? "outline" : "ghost"}
                                    className={`text-blue-500 hover:text-blue-800 ${draftFilters.gender === "Male" ? "bg-blue-100" : ""}`}
                                    onClick={() => setFilter("gender", "Male")}
                                >
                                    <Mars /> Male
                                </Button>
                                <Button variant={draftFilters.gender === "Female" ? "outline" : "ghost"}
                                    className="text-pink-500 hover:text-pink-800"
                                    onClick={() => setFilter("gender", "Female")}
                                >
                                    <Venus /> Female
                                </Button>
                            </FilterSection>

                            <FilterSection label="UNIVERSE" active={!!draftFilters.universe} onClear={() => setFilter("universe", "")}>
                                <Select value={draftFilters.universe} onValueChange={(v) => setFilter("universe", v)}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select universe..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {universes.map(u => <SelectItem key={u.value} value={u.value}>{u.name}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FilterSection>

                            <FilterSection label="POWERS" active={draftFilters.powers.length > 0} onClear={() => setFilter("powers", [])}>
                                <MultiSelect
                                    values={draftFilters.powers.map(String)}
                                    onValuesChange={(v) => setFilter("powers", v.map(Number))}
                                >
                                    <MultiSelectTrigger className="w-full">
                                        <MultiSelectValue placeholder="Select powers..." overflowBehavior="cutoff" />
                                    </MultiSelectTrigger>
                                    <MultiSelectContent>
                                        <MultiSelectGroup>
                                            {powers.map(p => <MultiSelectItem key={p.id} value={String(p.id)}>{p.name}</MultiSelectItem>)}
                                        </MultiSelectGroup>
                                    </MultiSelectContent>
                                </MultiSelect>
                            </FilterSection>

                            <FilterSection label="CHARACTER TYPE" active={!!draftFilters.character_type} onClear={() => setFilter("character_type", "")}>
                                <Select value={draftFilters.character_type} onValueChange={(v) => setFilter("character_type", v === "unknown" ? "" : v)}>
                                    <SelectTrigger className="w-full capitalize"><SelectValue placeholder="Select character type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {CHARACTER_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                            <SelectItem value="unknown">Unknown</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FilterSection>

                        </div>
                        <DrawerFooter>
                            <Button onClick={applyFilters}>Show Results</Button>
                            <Button disabled={!hasActiveFilters} variant="destructive" onClick={() => {
                                setDraftFilters(EMPTY_FILTERS);
                                localStorage.removeItem("lastParams_characters");
                            }}>
                                Clear all
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                <ButtonGroup>
                    <Button size="sm" variant="outline" aria-label="Toggle sort direction"
                        onClick={() => updateParam("sortOrientation", sortOrientation === "asc" ? "desc" : "asc")}
                    >
                        <ArrowBigDown className={`${sortOrientation === "asc" ? "rotate-180" : ""} transition-all`} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                                Sort: {sortOptions.find(o => o.value === sort)?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                            <DropdownMenuGroup>
                                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => updateParam("sort", v)}>
                                    {sortOptions.map(o => (
                                        <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
            </div>
        </div>
    );
};