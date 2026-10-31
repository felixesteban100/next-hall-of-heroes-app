// components/filters/EntityFilterBar.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select";
import { useParamLoading } from '../layout/ParamLoadingContext';
import { SearchInputBar } from './SearchInputBar';
import { getFilterProps, EntityFilterType } from './getFilterProps';
import {
    CHARACTER_TIER,
    CHARACTER_TIER_ORDER,
    CHARACTER_CLASS,
    CHARACTER_CLASS_ORDER,
    CHARACTER_TYPES,
    CHARACTER_TYPE_LABEL,
    POWER_COMBAT_ROLE_ICON
} from '@/lib/constants';

export type DraftFilters = {
    alignment?: string;
    universe?: string;
    team?: string;
    character_type?: string;
    tier?: string;
    class?: string;
    gender?: string;
    powers?: number[];
    combatRole?: string;
    activationType?: string;
    status?: string;
    type?: string;
};

type SortOption = { value: string; label: string };

const EMPTY_FILTERS: DraftFilters = {
    alignment: "", universe: "", team: "", character_type: "", tier: "", class: "", gender: "", powers: [],
    combatRole: "", activationType: "", status: "", type: "",
};

export const EntityFilterBar = ({
    type,
    sortOptions,
    extraData,
}: {
    type: EntityFilterType;
    sortOptions: SortOption[];
    extraData?: { universes?: any[]; teams?: any[]; powers?: any[] };
}) => {
    const { pushParams } = useParamLoading();
    const searchParams = useSearchParams();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const filterProps = getFilterProps(type, searchParams, extraData);

    const [name, setName] = useState(filterProps.name);
    const [modes, setModes] = useState<string[]>(filterProps.modes || []);
    const [fields, setFields] = useState<string[]>(
        (filterProps as any).fields || (searchParams.get("fields") ? searchParams.get("fields")!.split(",") : [])
    );
    const [sort, setSort] = useState(searchParams.get("sort") || sortOptions[0]?.value || "");
    const [sortOrientation, setSortOrientation] = useState(searchParams.get("sortOrientation") || "asc");
    const [draftFilters, setDraftFilters] = useState<DraftFilters>(filterProps.draftFilters);

    const setFilter = (key: keyof DraftFilters, value: any) =>
        setDraftFilters(prev => ({ ...prev, [key]: value }));

    // Filter teams dynamically based on selected universe in draftFilters
    const selectedUniverseObj = useMemo(() =>
        extraData?.universes?.find(u => u.name === draftFilters.universe),
        [extraData?.universes, draftFilters.universe]
    );

    const filteredTeams = useMemo(() =>
        selectedUniverseObj
            ? extraData?.teams?.filter(t => String(t.universe) === String(selectedUniverseObj.id))
            : [],
        [selectedUniverseObj, extraData?.teams]
    );

    const applyFiltersAndSearch = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");

        if (name) params.set("name", name);
        else params.delete("name");

        if (fields.length > 0) params.set("fields", fields.join(","));
        else params.delete("fields");

        if (modes.length > 0) params.set("modes", modes.join(","));
        else params.delete("modes");

        if (sort) params.set("sort", sort);
        params.set("sortOrientation", sortOrientation);

        Object.entries(draftFilters).forEach(([key, value]) => {
            params.delete(key);
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, `[${value.toString()}]`);
            } else if (value) {
                params.set(key, String(value));
            }
        });

        pushParams(params);
        setIsDrawerOpen(false);
    };

    const hasActiveFilters = Object.values(draftFilters).some(val =>
        Array.isArray(val) ? val.length > 0 : Boolean(val)
    ) || Boolean(name) || modes.length > 0 || fields.length > 0;

    return (
        <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2"></div>

            <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 relative">
                        <SlidersHorizontal size={14} /> Filters & Search
                        {filterProps.activeCount > 0 && (
                            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                {filterProps.activeCount}
                            </Badge>
                        )}
                    </Button>
                </DrawerTrigger>

                <DrawerContent className="flex flex-col h-full max-w-md ml-auto">
                    <DrawerHeader className="border-b pb-3">
                        <DrawerTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <SlidersHorizontal size={14} /> Filter & Search {type}s
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="no-scrollbar overflow-y-auto px-4 py-4 space-y-5 flex-1 text-xs">
                        {/* Search Group */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Search Input</Label>
                            <SearchInputBar
                                type={type}
                                value={name}
                                onChange={setName}
                                placeholder={filterProps.placeholder}
                                modes={modes}
                                onModesChange={setModes}
                                fields={fields}
                                onFieldsChange={setFields}
                            />
                        </div>

                        <Separator />

                        {/* Sorting Group */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                                <ArrowUpDown size={12} /> Sorting Controls
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger className="h-8 text-xs  w-full"><SelectValue placeholder="Sort by..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sortOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <Select value={sortOrientation} onValueChange={setSortOrientation}>
                                    <SelectTrigger className="h-8 text-xs  w-full"><SelectValue placeholder="Direction" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Character Filters Group */}
                        {type === "character" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Attributes</Label>

                                {/* Gender */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Gender</span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {["Male", "Female"].map(g => (
                                            <Button key={g} size="sm" variant={draftFilters.gender === g ? "default" : "outline"} onClick={() => setFilter("gender", draftFilters.gender === g ? "" : g)} className="h-7 text-xs">
                                                {g}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Alignment */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Alignment</span>
                                    <div className="grid grid-cols-3 gap-1">
                                        {[{ id: "good", label: "Good" }, { id: "neutral", label: "Neutral" }, { id: "bad", label: "Villain" }].map(a => (
                                            <Button key={a.id} size="sm" variant={draftFilters.alignment === a.id ? "default" : "outline"} onClick={() => setFilter("alignment", draftFilters.alignment === a.id ? "" : a.id)} className="h-7 text-xs">
                                                {a.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Character Type */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Character Type</span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {CHARACTER_TYPES.map(ct => (
                                            <Button key={ct} size="sm" variant={draftFilters.character_type === ct ? "default" : "outline"} onClick={() => setFilter("character_type", draftFilters.character_type === ct ? "" : ct)} className="h-7 text-xs justify-start">
                                                {CHARACTER_TYPE_LABEL[ct as keyof typeof CHARACTER_TYPE_LABEL] || ct}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tier */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Tier</span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {CHARACTER_TIER_ORDER.map(tKey => (
                                            <Button key={tKey} size="sm" variant={draftFilters.tier === String(tKey) ? "default" : "outline"} onClick={() => setFilter("tier", draftFilters.tier === String(tKey) ? "" : String(tKey))} className="h-7 text-xs justify-start truncate">
                                                {CHARACTER_TIER[tKey as keyof typeof CHARACTER_TIER]}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Class */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Class</span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {CHARACTER_CLASS_ORDER.map(cKey => (
                                            <Button key={cKey} size="sm" variant={draftFilters.class === String(cKey) ? "default" : "outline"} onClick={() => setFilter("class", draftFilters.class === String(cKey) ? "" : String(cKey))} className="h-7 text-xs justify-start truncate">
                                                {CHARACTER_CLASS[cKey as keyof typeof CHARACTER_CLASS]}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Universe Select */}
                                <div className="space-y-1.5  w-full">
                                    <span className="text-[11px] text-muted-foreground">Universe</span>
                                    <Select value={draftFilters.universe} onValueChange={(v) => { setFilter("universe", v); setFilter("team", ""); }}>
                                        <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Select Universe..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {extraData?.universes?.map(u => <SelectItem key={u.name} value={String(u.name)}>{u.name}</SelectItem>)}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Team Select (Conditional based on Universe) */}
                                {filteredTeams && filteredTeams.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] text-muted-foreground">Team</span>
                                        <Select value={draftFilters.team} onValueChange={(v) => setFilter("team", v)}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Team..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {filteredTeams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Powers MultiSelect */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Powers</span>
                                    <MultiSelect values={(draftFilters.powers || []).map(String)} onValuesChange={(v) => setFilter("powers", v.map(Number))}>
                                        <MultiSelectTrigger className="w-full text-xs h-8">
                                            <MultiSelectValue placeholder="Select powers..." overflowBehavior="cutoff" />
                                        </MultiSelectTrigger>
                                        <MultiSelectContent>
                                            <MultiSelectGroup>
                                                {extraData?.powers?.map(p => <MultiSelectItem key={p.id} value={String(p.id)}>{p.name}</MultiSelectItem>)}
                                            </MultiSelectGroup>
                                        </MultiSelectContent>
                                    </MultiSelect>
                                </div>
                            </div>
                        )}

                        {type === "power" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Power Properties</Label>
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Combat Role</span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {Object.keys(POWER_COMBAT_ROLE_ICON).map(role => (
                                            <Button key={role} size="sm" variant={draftFilters.combatRole === role ? "default" : "outline"} className="justify-start h-7 text-[11px]" onClick={() => setFilter("combatRole", draftFilters.combatRole === role ? "" : role)}>
                                                {role}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="border-t pt-3 flex flex-row gap-2">
                        <Button size="sm" className="flex-1" onClick={applyFiltersAndSearch}>Apply Filters</Button>
                        <Button size="sm" variant="ghost" disabled={!hasActiveFilters} onClick={() => {
                            setDraftFilters(EMPTY_FILTERS);
                            setName("");
                            setModes([]);
                            setFields([]);
                        }}>
                            <RotateCcw size={14} className="mr-1" /> Reset
                        </Button>
                        <DrawerClose asChild>
                            <Button size="sm" variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};