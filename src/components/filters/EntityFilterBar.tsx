// components/filters/EntityFilterBar.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, type LucideIcon } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select";
import { useParamLoading } from '../layout/ParamLoadingContext';
import { SearchInputBar } from './SearchInputBar';
import { getFilterProps, EntityFilterType } from './getFilterProps';
import { cn } from '@/lib/utils';
import {
    CHARACTER_TIER, CHARACTER_TIER_ORDER, CHARACTER_TIER_ICON, CHARACTER_TIER_COLOR,
    CHARACTER_CLASS, CHARACTER_CLASS_ORDER, CHARACTER_CLASS_ICON, CHARACTER_CLASS_COLOR,
    CHARACTER_TYPES, CHARACTER_TYPE_LABEL, CHARACTER_TYPE_ICON, CHARACTER_TYPE_COLOR,
    POWER_COMBAT_ROLE_ICON, POWER_COMBAT_ROLE_COLOR,
    POWER_ACTIVATION_TYPE_ICON, POWER_ACTIVATION_TYPE_COLOR,
    POWER_TIER, POWER_TIER_ICON, POWER_TIER_COLOR,
} from '@/lib/constants';
import { getAlignmentIcon, getCharacterAlignmentBadgeColors, getCharacterAlignmentText, getCharacterGenderBackground, getCharacterGenderBadgeColors, getCharacterGenderIcon } from '@/lib/character_utils';
import { BannerIcon, BannerItem, ExtremeBanner } from '../shared/ExtremeBanner';

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

// ── Option shape ──────────────────────────────────────────────────────────────
type ToggleOption = {
    id: string;
    label: string;
    Icon?: LucideIcon;
    /** Tailwind bg class applied when selected, e.g. "bg-orange-400 dark:bg-orange-700" */
    activeBg?: string;
    /** Tailwind text class for icon + label when selected */
    activeText?: string;
};

// ── Reusable rich toggle-button group ─────────────────────────────────────────
function ToggleGroup({ label, options, value, onChange, cols = 2 }: {
    label: string;
    options: ToggleOption[];
    value?: string;
    onChange: (v: string) => void;
    cols?: number;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <div className={`grid grid-cols-${cols} gap-1`}>
                {options.map(o => {
                    const active = value === o.id;
                    return (
                        <Button key={o.id} size="sm"
                            variant={active ? "default" : "outline"}
                            onClick={() => onChange(active ? "" : o.id)}
                            className={cn(
                                "h-7 text-xs justify-start truncate gap-1.5",
                                active && o.activeBg && o.activeBg,
                                active && o.activeText && o.activeText,
                                active && `hover:${o.activeBg}`,
                                // keep border visible when bg overrides default variant
                                active && o.activeBg && "border-transparent"
                            )}>
                            {o.Icon && <o.Icon className="size-3 shrink-0" />}
                            {o.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Option builders from constants ───────────────────────────────────────────
const TIER_OPTIONS: ToggleOption[] = CHARACTER_TIER_ORDER.map(k => ({
    id: String(k),
    label: CHARACTER_TIER[k],
    Icon: CHARACTER_TIER_ICON[k],
    activeBg: CHARACTER_TIER_COLOR[k].bg,
    activeText: CHARACTER_TIER_COLOR[k].foreground,
}));

const CLASS_OPTIONS: ToggleOption[] = CHARACTER_CLASS_ORDER.map(k => ({
    id: String(k),
    label: CHARACTER_CLASS[k],
    Icon: CHARACTER_CLASS_ICON[k],
    activeBg: CHARACTER_CLASS_COLOR[k].bg,
    activeText: CHARACTER_CLASS_COLOR[k].foreground,
}));

const CHARACTER_TYPE_OPTIONS: ToggleOption[] = CHARACTER_TYPES.map(ct => ({
    id: ct,
    label: CHARACTER_TYPE_LABEL[ct],
    Icon: CHARACTER_TYPE_ICON[ct],
    activeBg: CHARACTER_TYPE_COLOR[ct].bg,
    activeText: CHARACTER_TYPE_COLOR[ct].foreground,
}));

const COMBAT_ROLE_OPTIONS: ToggleOption[] = Object.keys(POWER_COMBAT_ROLE_ICON).map(role => ({
    id: role,
    label: role,
    Icon: POWER_COMBAT_ROLE_ICON[role as keyof typeof POWER_COMBAT_ROLE_ICON],
    activeBg: POWER_COMBAT_ROLE_COLOR[role as keyof typeof POWER_COMBAT_ROLE_COLOR].bg,
    activeText: "text-white",
}));

const ACTIVATION_TYPE_OPTIONS: ToggleOption[] = Object.keys(POWER_ACTIVATION_TYPE_ICON).map(t => ({
    id: t,
    label: t,
    Icon: POWER_ACTIVATION_TYPE_ICON[t],
    activeBg: POWER_ACTIVATION_TYPE_COLOR[t as keyof typeof POWER_ACTIVATION_TYPE_COLOR].bg,
    activeText: "text-white",
}));

const POWER_TIER_OPTIONS: ToggleOption[] = (Object.keys(POWER_TIER).map(Number)).map(k => ({
    id: String(k),
    label: POWER_TIER[k as keyof typeof POWER_TIER],
    Icon: POWER_TIER_ICON[k],
    activeBg: POWER_TIER_COLOR[k as keyof typeof POWER_TIER_COLOR].bg,
    activeText: POWER_TIER_COLOR[k as keyof typeof POWER_TIER_COLOR].foreground,
}));

// Plain options (no color/icon constants for these)
const ALIGNMENT_OPTIONS: ToggleOption[] = [
    { id: "good", label: "Hero", activeBg: "bg-green-500 text-white", activeText: "", Icon: getAlignmentIcon("good") },
    { id: "neutral", label: "Anti-Hero", activeBg: "bg-yellow-500 text-white", activeText: "", Icon: getAlignmentIcon("neutral") },
    { id: "bad", label: "Villain", activeBg: "bg-red-600 text-white", activeText: "", Icon: getAlignmentIcon("bad") },
];
// const TEAM_STATUS_OPTIONS: ToggleOption[] = [
//     { id: "active", label: "Active", activeBg: "bg-blue-500", activeText: "text-white" },
//     { id: "disbanded", label: "Disbanded", activeBg: "bg-zinc-500", activeText: "text-white" },
//     { id: "reformed", label: "Reformed", activeBg: "bg-green-500", activeText: "text-white" },
// ];
// const UNIVERSE_TYPE_OPTIONS: ToggleOption[] = [
//     { id: "original", label: "Original" },
//     { id: "alternate", label: "Alternate" },
//     { id: "crossover", label: "Crossover" },
// ];

// ── Main component ────────────────────────────────────────────────────────────
export const EntityFilterBar = ({
    type,
    sortOptions,
    extraData,
    // extremeBannerItems
}: {
    type: EntityFilterType;
    sortOptions: SortOption[];
    extraData?: { universes?: any[]; teams?: any[]; powers?: any[] };
    // extremeBannerItems: BannerItem[];
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
    const [sortOrientation, setSortOrientation] = useState(searchParams.get("sortOrientation") || "desc");
    const [draftFilters, setDraftFilters] = useState<DraftFilters>(filterProps.draftFilters);

    const setFilter = (key: keyof DraftFilters, value: any) =>
        setDraftFilters(prev => ({ ...prev, [key]: value }));

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
        if (name) params.set("name", name); else params.delete("name");
        if (fields.length > 0) params.set("fields", fields.join(",")); else params.delete("fields");
        if (modes.length > 0) params.set("modes", modes.join(",")); else params.delete("modes");
        if (sort) params.set("sort", sort);
        params.set("sortOrientation", sortOrientation);
        Object.entries(draftFilters).forEach(([key, value]) => {
            params.delete(key);
            if (Array.isArray(value) && value.length > 0) params.set(key, `[${value.toString()}]`);
            else if (value) params.set(key, String(value));
        });
        pushParams(params);
        setIsDrawerOpen(false);
    };

    const hasActiveFilters = Object.values(draftFilters).some(val =>
        Array.isArray(val) ? val.length > 0 : Boolean(val)
    ) || Boolean(name) || modes.length > 0 || fields.length > 0;

    function getExtremeBannerItems(): BannerItem[] {
        let extremeBannerItems: BannerItem[] = [];
        const alreadyStablishedFilters = filterProps.draftFilters
        const nameQueried = filterProps.name
        const { universe, alignment, gender, character_type, tier, class: classQ, team, activationType, combatRole, type, powers } = alreadyStablishedFilters

        if (nameQueried) {
            extremeBannerItems.push({
                label: `Name: ${nameQueried}`,
                icon: "star",
                color: "bg-blue-500/15 text-blue-400 border border-blue-500/25"
            });
        }

        if (alignment) {
            extremeBannerItems.push({
                label: `Alignment: ${getCharacterAlignmentText(alignment)}`,
                icon: alignment as BannerIcon,
                color: getCharacterAlignmentBadgeColors(alignment),
            });
        }

        if (gender) {
            extremeBannerItems.push({
                label: `Gender: ${gender}`,
                icon: gender.toLowerCase() as BannerIcon,
                color: getCharacterGenderBadgeColors(gender)
            });
        }

        if (character_type) {
            extremeBannerItems.push({
                label: `Type: ${CHARACTER_TYPE_LABEL[character_type as keyof typeof CHARACTER_TYPE_LABEL]}`,
                icon: character_type.toLowerCase() as BannerIcon,
                color: CHARACTER_TYPE_COLOR[character_type as keyof typeof CHARACTER_TYPE_COLOR].badge
            });
        }

        if (tier) {
            if (type === "power") {
                extremeBannerItems.push({
                    label: `Tier: ${POWER_TIER[Number(tier) as keyof typeof POWER_TIER]} (T${tier})`,
                    icon: `power_tier_${tier}` as BannerIcon,
                    color: POWER_TIER_COLOR[Number(tier) as keyof typeof POWER_TIER_COLOR].badge
                });
            } else {
                extremeBannerItems.push({
                    label: `Tier: ${CHARACTER_TIER[Number(tier) as keyof typeof CHARACTER_TIER]} (T${tier})`,
                    icon: `character_tier_${tier}` as BannerIcon,
                    color: CHARACTER_TIER_COLOR[Number(tier) as keyof typeof CHARACTER_TIER_COLOR].badge
                });
            }
        }

        if (classQ) {
            extremeBannerItems.push({
                label: `Class: ${CHARACTER_CLASS[Number(classQ) as keyof typeof CHARACTER_CLASS]}`,
                icon: `character_class_${classQ}` as BannerIcon,
                color: CHARACTER_CLASS_COLOR[Number(classQ) as keyof typeof CHARACTER_CLASS_COLOR].badge
            });
        }

        if (universe) {
            const universeObj = extraData?.universes?.find(u => String(u.id) === String(universe));

            extremeBannerItems.push({
                label: `Universe: ${universeObj?.name || universe}`,
                icon: "trophy",
                color: "bg-purple-500/15 text-purple-400 border border-purple-500/25"
            });
        }

        if (team) {
            const teamObj = extraData?.teams?.find(t => String(t.id) === String(team));
            if (teamObj) {
                extremeBannerItems.push({
                    label: `Team: ${teamObj.name}`,
                    icon: "zap",
                    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                });
            }
        }

        if (activationType) {
            extremeBannerItems.push({
                label: `Activation Type: ${activationType}`,
                icon: activationType.toLowerCase() as BannerIcon,
                color: POWER_ACTIVATION_TYPE_COLOR[activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR].badge
            });
        }

        if (combatRole) {
            extremeBannerItems.push({
                label: `Combat Role: ${combatRole}`,
                icon: combatRole.toLowerCase() as BannerIcon,
                color: POWER_COMBAT_ROLE_COLOR[combatRole as keyof typeof POWER_COMBAT_ROLE_COLOR].badge
            });
        }

        if (type) {
            extremeBannerItems.push({
                label: `Type: ${type}`,
                icon: type.toLowerCase() as BannerIcon,
                color: "bg-amber-500/15 text-amber-400 border border-amber-500/25"
            });
        }

        if (powers && powers.length > 0) {
            for (const powerId of powers) {
                const powerObj = extraData?.powers?.find(p => p.id === powerId);
                if (powerObj) {
                    extremeBannerItems.push({
                        label: `Power: ${powerObj.name}`,
                        icon: "zap",
                        color: "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                    });
                }
            }
        }

        return extremeBannerItems;
    }

    return (
        <div className="flex items-center justify-between w-full gap-2">
            {
                getExtremeBannerItems().length > 0 ? (<ExtremeBanner items={getExtremeBannerItems()} interval={3500} />) : (<div className="h-7" />)
            }

            <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 relative">
                        <SlidersHorizontal size={14} /> <span className="hidden md:inline">Filters & Search</span>
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
                        {/* Search */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Search Input</Label>
                            <SearchInputBar
                                type={type} value={name} onChange={setName}
                                placeholder={filterProps.placeholder}
                                modes={modes} onModesChange={setModes}
                                fields={fields} onFieldsChange={setFields}
                            />
                        </div>

                        <Separator />

                        {/* Sorting */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                                <ArrowUpDown size={12} /> Sorting Controls
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Sort by..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select value={sortOrientation} onValueChange={setSortOrientation}>
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Direction" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator className={type === "universe" ? "hidden" : ""} />

                        {/* ── Character filters ── */}
                        {type === "character" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Attributes</Label>
                                <ToggleGroup label="Alignment" cols={3}
                                    options={ALIGNMENT_OPTIONS}
                                    value={draftFilters.alignment} onChange={v => setFilter("alignment", v)} />

                                <ToggleGroup label="Gender"
                                    options={[{ id: "Male", label: "Male", activeBg: getCharacterGenderBackground("male"), Icon: getCharacterGenderIcon("male") }, { id: "Female", label: "Female", activeBg: getCharacterGenderBackground("female"), Icon: getCharacterGenderIcon("female") }]}
                                    value={draftFilters.gender} onChange={v => setFilter("gender", v)} />

                                <ToggleGroup label="Character Type"
                                    options={CHARACTER_TYPE_OPTIONS}
                                    value={draftFilters.character_type} onChange={v => setFilter("character_type", v)} />

                                <ToggleGroup label="Tier"
                                    options={TIER_OPTIONS}
                                    value={draftFilters.tier} onChange={v => setFilter("tier", v)} />

                                <ToggleGroup label="Class"
                                    options={CLASS_OPTIONS}
                                    value={draftFilters.class} onChange={v => setFilter("class", v)} />

                                {/* Universe */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Universe</span>
                                    <Select value={draftFilters.universe} onValueChange={v => { setFilter("universe", v); setFilter("team", ""); }}>
                                        <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Select Universe..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {extraData?.universes?.map(u => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Team (conditional) */}
                                {filteredTeams && filteredTeams.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] text-muted-foreground">Team</span>
                                        <Select value={draftFilters.team} onValueChange={v => setFilter("team", v)}>
                                            <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Select Team..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {filteredTeams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Powers */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Powers</span>
                                    <MultiSelect values={(draftFilters.powers || []).map(String)} onValuesChange={v => setFilter("powers", v.map(Number))}>
                                        <MultiSelectTrigger className="w-full text-xs h-8 border border-text-muted-foreground/25 rounded-md px-2 py-1.5 flex items-center justify-between gap-2">
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

                        {/* ── Power filters ── */}
                        {type === "power" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Power Properties</Label>
                                <ToggleGroup label="Tier"
                                    options={POWER_TIER_OPTIONS}
                                    value={draftFilters.tier} onChange={v => setFilter("tier", v)} />
                                <ToggleGroup label="Combat Role"
                                    options={COMBAT_ROLE_OPTIONS}
                                    value={draftFilters.combatRole} onChange={v => setFilter("combatRole", v)} />
                                <ToggleGroup label="Activation Type"
                                    options={ACTIVATION_TYPE_OPTIONS}
                                    value={draftFilters.activationType} onChange={v => setFilter("activationType", v)} />

                            </div>
                        )}

                        {/* ── Team filters ── */}
                        {type === "team" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Team Properties</Label>
                                <ToggleGroup label="Alignment" cols={3}
                                    options={ALIGNMENT_OPTIONS}
                                    value={draftFilters.alignment} onChange={v => setFilter("alignment", v)} />
                                {/* <ToggleGroup label="Status" cols={3}
                                    options={TEAM_STATUS_OPTIONS}
                                    value={draftFilters.status} onChange={v => setFilter("status", v)} /> */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] text-muted-foreground">Universe with teams</span>
                                    <Select defaultValue={filterProps.draftFilters.universe} value={draftFilters.universe} onValueChange={v => { setFilter("universe", v); }}>
                                        <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Select Universe..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {extraData?.universes?.map(u => <SelectItem key={u.id} value={u.id}>#{u.id}-{u.name}</SelectItem>)}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* ── Universe filters ── */}
                        {/* {type === "universe" && (
                            <div className="space-y-4">
                                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Universe Properties</Label>
                                <ToggleGroup label="Type" cols={3}
                                    options={UNIVERSE_TYPE_OPTIONS}
                                    value={draftFilters.type} onChange={v => setFilter("type", v)} />
                            </div>
                        )} */}
                    </div>

                    <DrawerFooter className="border-t pt-3 flex flex-row gap-2">
                        <Button size="sm" className="flex-1" onClick={applyFiltersAndSearch}>Apply Filters</Button>
                        <Button size="sm" variant="ghost" disabled={!hasActiveFilters} onClick={() => {
                            setDraftFilters(EMPTY_FILTERS);
                            setName("");
                            setModes([]);
                            setFields([]);
                            const params = new URLSearchParams(searchParams)
                            params.forEach((_, key) => params.delete(key))
                            pushParams(params)
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