"use client"

import { useSearchParams } from 'next/navigation'
import { Input } from "../ui/input";
import { Button } from '../ui/button';
import { useCallback, useMemo, useState } from 'react';
import { Mars, SearchIcon, SlidersHorizontal, Venus, X } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
// import { Power, Team, Universe } from '@/types';
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON,
    CHARACTER_CLASS_ORDER,
    CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON,
    CHARACTER_TIER_ORDER,
    CHARACTER_TYPES, CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON, CHARACTER_TYPE_LABEL,
    type CharacterType
} from '@/lib/constants';
import { CharacterBadgeIcon } from '@/lib/characters_utils';
import ActiveFiltersBadges, { ActiveFiltersBadgesProps } from './ActiveFiltersBadges';
import { useParamLoading } from '../layout/ParamLoadingContext';
import SortButton from './SortButton';

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
    team: string;
    character_type: string;
    tier: string;
    class: string;
    gender: string;
    powers: number[];
};

const EMPTY_FILTERS: DraftFilters = {
    alignment: "", universe: "", team: "", character_type: "", tier: "", class: "", gender: "", powers: [],
};

type DropdownValue = { id: number, name: string }

export const FilterBar = ({ universes, teams, powers, activeFilterProps }: {
    universes: DropdownValue[];
    teams: (DropdownValue & {
        universe: number
    })[];
    powers: DropdownValue[];
    activeFilterProps: ActiveFiltersBadgesProps;
}) => {
    // const { push } = useRouter();
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();

    const [name, setName] = useState(searchParams.get("name") || "");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const sort = searchParams.get("sort") || "id";
    const sortOrientation = searchParams.get("sortOrientation") || "asc";

    const [draftFilters, setDraftFilters] = useState<DraftFilters>(() => ({
        alignment: searchParams.get("alignment") || "",
        universe: searchParams.get("universe") || "",
        team: searchParams.get("team") || "",
        character_type: searchParams.get("character_type") || "",
        tier: searchParams.get("tier") || "",
        class: searchParams.get("class") || "",
        gender: searchParams.get("gender") || "",
        powers: JSON.parse(searchParams.get("powers") || "[]") as number[],
    }));

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        // console.log(key, value)
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        pushParams(params);
    }, [searchParams, pushParams]);

    const removeFilter = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        params.delete("page");
        pushParams(params);
        setDraftFilters(prev => ({ ...prev, [key]: key === "powers" ? [] : "" }));
    }, [searchParams, pushParams]);

    const activeFilterCount = useMemo(() => {
        return [
            draftFilters.alignment, draftFilters.gender, draftFilters.tier,
            draftFilters.universe, draftFilters.team, draftFilters.class, draftFilters.character_type,
        ].filter(Boolean).length + (draftFilters.powers.length > 0 ? 1 : 0);
    }, [draftFilters]);

    return (
        <div className="relative flex flex-col gap-3 w-full">
            {/* Row 1 — Search input */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search characters by name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateParam("name", name)}
                        className="pl-10 "
                    />
                    {name && (
                        <X
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                            onClick={() => { setName(""); updateParam("name", ""); }}
                        />
                    )}
                </div>
                <Button size="sm" onClick={() => updateParam("name", name)}>
                    <SearchIcon size={16} />
                </Button>
            </div>

            {/* Row 2 — Chips + Filter Drawer + Sort */}
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <ActiveFiltersBadges {...activeFilterProps} onRemove={removeFilter} />
                </div>
                <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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

                    {/* Render heavy drawer content ONLY when drawer is opened */}
                    {isDrawerOpen && (
                        <FilterDrawerBody
                            universes={universes}
                            teams={teams}
                            powers={powers}
                            draftFilters={draftFilters}
                            setDraftFilters={setDraftFilters}
                            searchParams={searchParams}
                            pushParams={pushParams}
                            onClose={() => setIsDrawerOpen(false)}
                        />
                    )}
                </Drawer>

                <SortButton
                    sort={sort}
                    sortOrientation={sortOrientation}
                    updateParam={updateParam}
                    sortOptions={[
                        { value: "id", label: "Id" },
                        { value: "powerstats.total", label: "Power total" },
                        { value: "name", label: "Name" },
                        { value: "appearance.age", label: "Age" },
                    ]}
                />
            </div>
        </div>
    );
};

// Isolated Drawer Body — prevents rendering 100s of power/class/tier items when drawer is hidden
function FilterDrawerBody({
    universes,
    teams,
    powers,
    draftFilters,
    setDraftFilters,
    searchParams,
    pushParams,
    onClose,
}: {
    universes: DropdownValue[];
    teams: (DropdownValue & {
        universe: number
    })[];
    powers: DropdownValue[];
    draftFilters: DraftFilters;
    setDraftFilters: React.Dispatch<React.SetStateAction<DraftFilters>>;
    searchParams: ReturnType<typeof useSearchParams>;
    pushParams: (params: URLSearchParams) => void;
    onClose: () => void;
}) {
    const setFilter = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) =>
        setDraftFilters(prev => ({ ...prev, [key]: value }));

    const selectedUniverseObj = useMemo(() =>
        universes.find(u => u.name === draftFilters.universe || u.name === draftFilters.universe),
        [universes, draftFilters.universe]
    );

    const filteredTeams = useMemo(() =>
        selectedUniverseObj
            ? teams.filter(t => String(t.universe) === String(selectedUniverseObj.id))
            : [],
        [selectedUniverseObj, teams]
    );

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");

        const stringFilters: [string, string][] = [
            ["alignment", draftFilters.alignment],
            ["universe", draftFilters.universe],
            ["team", draftFilters.team],
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
        onClose();
    };

    const hasActiveFilters = !!draftFilters.alignment || !!draftFilters.gender ||
        !!draftFilters.tier || !!draftFilters.universe || !!draftFilters.team ||
        draftFilters.powers.length > 0;

    return (
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2 border-b pb-2">
                    <SlidersHorizontal size={16} /> Filter Characters
                </DrawerTitle>
            </DrawerHeader>
            <div className="no-scrollbar overflow-y-auto px-4 space-y-4 max-h-[70vh]">
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

                <FilterSection label="CHARACTER TYPE" active={!!draftFilters.character_type} onClear={() => setFilter("character_type", "")}>
                    {CHARACTER_TYPES.map((type) => {
                        const color = CHARACTER_TYPE_COLOR[type as CharacterType];
                        const Icon = CHARACTER_TYPE_ICON[type as CharacterType];
                        const label = CHARACTER_TYPE_LABEL[type as CharacterType] || type;
                        const isSelected = draftFilters.character_type === type;

                        return (
                            <Button
                                key={type}
                                variant={isSelected ? "outline" : "ghost"}
                                className={`${color.text} hover:${color.text} ${isSelected ? "font-bold border-current bg-muted/50" : "font-medium"}`}
                                onClick={() => setFilter("character_type", isSelected ? "" : type)}
                            >
                                {Icon && <Icon className="w-4 h-4 mr-1.5 shrink-0" />}
                                {label}
                            </Button>
                        );
                    })}
                </FilterSection>

                <FilterSection label="TIER" active={!!draftFilters.tier} onClear={() => setFilter("tier", "")}>
                    {CHARACTER_TIER_ORDER.map((tierKey) => {
                        const value = String(tierKey);
                        const label = CHARACTER_TIER[tierKey as keyof typeof CHARACTER_TIER];
                        const color = CHARACTER_TIER_COLOR[tierKey as keyof typeof CHARACTER_TIER_COLOR];
                        const Icon = CHARACTER_TIER_ICON[tierKey as keyof typeof CHARACTER_TIER_ICON];

                        return (
                            <Button
                                key={value}
                                variant={draftFilters.tier === value ? "outline" : "ghost"}
                                className={`${color.text} hover:${color.text} ${draftFilters.tier === value ? "font-bold border-current bg-muted/50" : "font-medium"}`}
                                onClick={() => setFilter("tier", value)}
                            >
                                {Icon && <Icon className="w-4 h-4 mr-1.5 shrink-0" />}
                                {label}
                            </Button>
                        );
                    })}
                </FilterSection>

                <FilterSection label="CLASS" active={!!draftFilters.class} onClear={() => setFilter("class", "")}>
                    {CHARACTER_CLASS_ORDER.map((classKey) => {
                        const value = String(classKey);
                        const label = CHARACTER_CLASS[classKey as keyof typeof CHARACTER_CLASS];
                        const color = CHARACTER_CLASS_COLOR[classKey as keyof typeof CHARACTER_CLASS_COLOR];
                        const Icon = CHARACTER_CLASS_ICON[classKey as keyof typeof CHARACTER_CLASS_ICON];

                        return (
                            <Button
                                key={value}
                                variant={draftFilters.class === value ? "outline" : "ghost"}
                                className={`${color.text} hover:${color.text} ${draftFilters.class === value ? "font-bold border-current bg-muted/50" : "font-medium"}`}
                                onClick={() => setFilter("class", value)}
                            >
                                {Icon && <Icon className="w-4 h-4 mr-1.5 shrink-0" />}
                                {label}
                            </Button>
                        );
                    })}
                </FilterSection>

                <FilterSection
                    label="UNIVERSE"
                    active={!!draftFilters.universe}
                    onClear={() => {
                        setFilter("universe", "");
                        setFilter("team", "");
                    }}
                >
                    <Select
                        value={draftFilters.universe}
                        onValueChange={(v) => {
                            setFilter("universe", v);
                            setFilter("team", "");
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select universe..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {universes.map(u => (
                                    <SelectItem key={u.name} value={String(u.name)}>{u.id}.{u.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </FilterSection>

                {filteredTeams.length > 0 && (
                    <FilterSection label="TEAM" active={!!draftFilters.team} onClear={() => setFilter("team", "")}>
                        <Select value={draftFilters.team} onValueChange={(v) => setFilter("team", v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={draftFilters.universe ? "Select team from universe..." : "Select team..."} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {filteredTeams.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{String(t.id)}. {t.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FilterSection>
                )}

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
    );
}