"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input";
import { Button } from './ui/button';
import { useCallback, useState } from 'react';
import { ArrowBigDown, Mars, SearchIcon, SlidersHorizontal, Venus } from 'lucide-react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Power, Universe } from '@/types';
import { ButtonGroup } from './ui/button-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup } from './ui/dropdown-menu';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CHARACTER_CLASS, CHARACTER_CLASS_COLOR, CHARACTER_CLASS_ICON, CHARACTER_TIER, CHARACTER_TIER_COLOR, CHARACTER_TIER_ICON, CHARACTER_TYPES } from '@/lib/constants';
import { CharacterBadgeIcon } from '@/lib/characters_utils';

const sortOptions = [
    { value: "id", label: "Id" },
    { value: "powerstats.total", label: "Power total" },
    { value: "name", label: "Name" },
    { value: "appearance.age", label: "Age" },
]

export const FilterBar = ({ universes, powers }: { universes: Universe[], powers: Power[] }) => {
    const { push } = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [name, setName] = useState(searchParams.get("name") || "");
    const sort = searchParams.get("sort") || "id";
    const sortOrientation = searchParams.get("sortOrientation") || "desc";

    const updateNameSearchParam = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams)
        params.delete("page")
        params.set("name", value)
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push])

    const updateSortSearchParam = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("sort", value)
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push])

    const setSortOrientation = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("sortOrientation", value)
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push])

    const [draftFilters, setDraftFilters] = useState({
        alignment: searchParams.get("alignment") || "",
        universe: searchParams.get("universe") || "",
        character_type: searchParams.get("character_type") || "",
        tier: searchParams.get("tier") || "",
        class: searchParams.get("class") || "",
        gender: searchParams.get("gender") || "",
        powers: JSON.parse(searchParams.get("powers") || "[]") as number[],
    });

    const applyFilters = useCallback(() => {
        /* the ones that are empty string don't include them in the URL in case they already are delete them */
        const params = new URLSearchParams(searchParams);
        params.delete("alignment")
        if (draftFilters.alignment != "") {
            params.set("alignment", draftFilters.alignment);
        }
        params.delete("universe")
        if (draftFilters.universe != "") {
            params.set("universe", draftFilters.universe);
        }
        params.delete("character_type")
        if (draftFilters.character_type != "") {
            params.set("character_type", draftFilters.character_type);
        }
        params.delete("tier")
        if (draftFilters.tier != "") {
            params.set("tier", draftFilters.tier);
        }
        params.delete("class")
        if (draftFilters.class != "") {
            params.set("class", draftFilters.class);
        }
        params.delete("gender")
        if (draftFilters.gender != "") {
            params.set("gender", draftFilters.gender);
        }
        params.delete("powers");
        if (draftFilters.powers.length > 0) {
            params.set("powers", `[${draftFilters.powers.map(c => Number(c)).toString()}]`);
            // draftFilters.powers.forEach(p => params.append("powers", p));
        }
        params.delete("page")
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [draftFilters, searchParams, pathname, push]);

    const hasActiveFilters = !!draftFilters.alignment ||
        !!draftFilters.gender ||
        !!draftFilters.tier ||
        !!draftFilters.universe ||
        draftFilters.powers.length > 0;

    return (
        <div className="flex items-center justify-between py-4 w-full gap-2 flex-col">
            {/* place the search icon inside left of the input field */}
            <div className="flex items-center gap-2 w-full">
                <div className="relative w-full">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search characters by name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded-sm p-2 pl-10"
                    />
                </div>
                <Button onClick={() => updateNameSearchParam(name)}><SearchIcon /></Button>
            </div>

            <div className="flex justify-end items-center gap-2 w-full">
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button variant="outline"><SlidersHorizontal /> Filter</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2 border-b pb-2"><SlidersHorizontal size={16} /> Filter Characters</DrawerTitle>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto px-4 space-y-4">
                            <div id="ALIGNMENT">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">ALIGNMENT</p>
                                    <Button disabled={draftFilters.alignment && draftFilters.alignment !== "" ? false : true} variant="link" size="sm" onClick={() => setDraftFilters(prev => ({ ...prev, alignment: "" }))}>Clear</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Button
                                        variant={draftFilters.alignment === "good" ? "outline" : "ghost"}
                                        onClick={() => setDraftFilters(prev => ({ ...prev, alignment: "good" }))}
                                        // className={`hover:bg-green-100 dark:hover:bg-green-100 hover:text-green-500 text-green-500 ${draftFilters.alignment === "good" ? "bg-green-100 dark:bg-green-100" : ""}`}
                                        // className={`hover:text-green-500 text-green-500 ${draftFilters.alignment === "good" ? "bg-green-100 " : ""}`}
                                        className={`hover:text-green-500 text-green-500 `}
                                    >
                                        {CharacterBadgeIcon("good")} Good
                                    </Button>
                                    <Button
                                        variant={draftFilters.alignment === "neutral" ? "outline" : "ghost"}
                                        onClick={() => setDraftFilters(prev => ({ ...prev, alignment: "neutral" }))}
                                        // className={`hover:bg-blue-100 dark:hover:bg-blue-100 hover:text-blue-500 text-blue-500 ${draftFilters.alignment === "neutral" ? "bg-blue-100 dark:bg-blue-100" : ""}`}
                                        className={`hover:text-yellow-500  text-yellow-500`}
                                    >
                                        {CharacterBadgeIcon("neutral")} Anti-Hero
                                    </Button>
                                    <Button
                                        variant={draftFilters.alignment === "bad" ? "outline" : "ghost"}
                                        onClick={() => setDraftFilters(prev => ({ ...prev, alignment: "bad" }))}
                                        // className={`hover:bg-red-100 dark:hover:bg-red-100 hover:text-red-500 text-red-500 ${draftFilters.alignment === "bad" ? "bg-red-100 dark:bg-red-100" : ""}`}
                                        className={`hover:text-red-500  text-red-500 `}
                                    >
                                        {CharacterBadgeIcon("bad")} Villain
                                    </Button>
                                </div>
                            </div>

                            <div id="TIER">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">TIER</p>
                                    <Button
                                        disabled={!draftFilters.tier}
                                        variant="link"
                                        size="sm"
                                        onClick={() => setDraftFilters(prev => ({ ...prev, tier: "" }))}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(CHARACTER_TIER).map(([value, label]) => {
                                        const color = CHARACTER_TIER_COLOR[Number(value) as keyof typeof CHARACTER_TIER_COLOR];
                                        const Icon = CHARACTER_TIER_ICON[Number(value) as keyof typeof CHARACTER_TIER_COLOR]
                                        return (
                                            <Button
                                                key={value}
                                                variant={draftFilters.tier === value ? "outline" : "ghost"}
                                                // className={`hover:${color.bg} hover:${color.text} ${draftFilters.tier === value ? color.bg : ""} ${color.text} ${draftFilters.tier === value ? "font-bold" : "font-medium"}`}
                                                className={`hover:${color.text} ${color.text} ${draftFilters.tier === value ? "font-bold" : "font-medium"}`}
                                                onClick={() => setDraftFilters(prev => ({ ...prev, tier: value }))}
                                            >
                                                <Icon /> {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div id="CLASS">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">CLASS</p>
                                    <Button
                                        disabled={!draftFilters.class}
                                        variant="link"
                                        size="sm"
                                        onClick={() => setDraftFilters(prev => ({ ...prev, class: "" }))}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(CHARACTER_CLASS).map(([value, label]) => {
                                        const color = CHARACTER_CLASS_COLOR[Number(value) as keyof typeof CHARACTER_CLASS_COLOR];
                                        const Icon = CHARACTER_CLASS_ICON[Number(value) as keyof typeof CHARACTER_CLASS_COLOR]

                                        return (
                                            <Button
                                                key={value}
                                                variant={draftFilters.class === value ? "outline" : "ghost"}
                                                // className={`hover:${color.bg} hover:${color.text} ${draftFilters.class === value ? color.bg : ""} ${color.text} ${draftFilters.class === value ? "font-bold" : "font-medium"}`}
                                                // className={`hover:${color.text} ${draftFilters.class === value ? color.bg : ""} ${color.text} ${draftFilters.class === value ? "font-bold" : "font-medium"}`}
                                                className={`hover:${color.text}  ${color.text} ${draftFilters.class === value ? "font-bold" : "font-medium"}`}
                                                onClick={() => setDraftFilters(prev => ({ ...prev, class: value }))}
                                            >
                                                <Icon /> {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div id="GENDER">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">GENDER</p>
                                    <Button disabled={draftFilters.gender && draftFilters.gender != "" ? false : true} variant="link" size="sm" onClick={() => setDraftFilters(prev => ({ ...prev, gender: "" }))}>Clear</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Button
                                        variant={draftFilters.gender === "Male" ? "outline" : "ghost"}
                                        onClick={() => setDraftFilters(prev => ({ ...prev, gender: "Male" }))}
                                        className={`hover:bg-blue-100 hover:text-blue-800 text-blue-500 ${draftFilters.gender === "Male" ? "bg-blue-100" : ""}`}
                                    >
                                        <Mars /> Male
                                    </Button>
                                    <Button
                                        variant={draftFilters.gender === "Female" ? "outline" : "ghost"}
                                        onClick={() => setDraftFilters(prev => ({ ...prev, gender: "Female" }))}
                                        // className={`hover:bg-pink-100 hover:text-pink-800 text-pink-500 ${draftFilters.gender === "Female" ? "bg-pink-100" : ""}`}
                                        className={` hover:text-pink-800 text-pink-500 `}
                                    >
                                        <Venus /> Female
                                    </Button>
                                </div>
                            </div>

                            <div id="UNIVERSE">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">UNIVERSE</p>
                                    <Button disabled={draftFilters.universe && draftFilters.universe != "" ? false : true} variant="link" size="sm" onClick={() => setDraftFilters(prev => ({ ...prev, universe: "" }))}>Clear</Button>
                                </div>
                                <Select value={draftFilters.universe} /* items={universes} */ onValueChange={(value) => setDraftFilters(prev => ({ ...prev, universe: value }))}>
                                    <SelectTrigger className="w-full max-w-100">
                                        <SelectValue placeholder="Select universe..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {universes.map((univese) => (
                                                <SelectItem key={univese.value} value={univese.value}>
                                                    {univese.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div id="POWERS">
                                <div className='flex justify-between'>
                                    <p className="font-light text-muted-foreground">POWERS</p>
                                    <Button disabled={draftFilters.powers && draftFilters.powers.length < 1 ? true : false} variant="link" size="sm" onClick={() => setDraftFilters(prev => ({ ...prev, powers: [] }))}>Clear</Button>
                                </div>
                                <MultiSelect values={draftFilters.powers.map((c) => c.toString())} onValuesChange={(values) => setDraftFilters(prev => ({
                                    ...prev,
                                    powers: values.map((value) => Number(value)),
                                }))}>
                                    <MultiSelectTrigger className="w-full max-w-100">
                                        <MultiSelectValue placeholder="Select powers..." overflowBehavior={"cutoff"} />
                                    </MultiSelectTrigger>
                                    <MultiSelectContent>
                                        <MultiSelectGroup>
                                            {powers.map((power) => (
                                                <MultiSelectItem key={power.id} value={power.id.toString()}>{power.name}</MultiSelectItem>
                                            ))}
                                        </MultiSelectGroup>
                                    </MultiSelectContent>
                                </MultiSelect>
                            </div>

                            <div id="CHARACTER_TYPE">
                                <div className="flex justify-between">
                                    <p className="font-light text-muted-foreground">CHARACTER TYPE</p>
                                    <Button disabled={draftFilters.character_type && draftFilters.character_type != "" ? false : true} variant="link" size="sm" onClick={() => setDraftFilters(prev => ({ ...prev, character_type: "" }))}>Clear</Button>
                                </div>
                                <Select value={draftFilters.character_type} /* items={characterTypes} */ onValueChange={(value) => setDraftFilters(prev => ({ ...prev, character_type: value === "unknown" ? "" : value }))}>
                                    <SelectTrigger className="w-full max-w-100 capitalize">
                                        <SelectValue placeholder="Select character type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {CHARACTER_TYPES.map((type) => (
                                                <SelectItem key={type} value={type} className="capitalize">
                                                    {type}
                                                </SelectItem>
                                            ))}
                                            <SelectItem key="" value={"unknown"}>Unknown</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                        <DrawerFooter>
                            <Button /*disabled={!hasActiveFilters}*/ onClick={applyFilters}>Show Results</Button>
                            <Button
                                disabled={!hasActiveFilters}
                                onClick={() => {
                                    setDraftFilters(() => ({ alignment: "", gender: "", powers: [], tier: "", universe: "", class: "", character_type: "" }));
                                    //applyFilters()
                                }}

                                variant="destructive"
                            >
                                Clear all
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                <ButtonGroup>
                    <Button aria-label="Toggle bookmark" variant="outline" onClick={() => setSortOrientation(sortOrientation === "asc" ? "desc" : "asc")}>
                        <ArrowBigDown className={`${sortOrientation === "asc" ? "rotate-180" : ""} transition-all`} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Sort by: {sortOptions.find((o) => o.value === sort)?.label}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                            <DropdownMenuGroup>
                                <DropdownMenuRadioGroup value={sort} onValueChange={updateSortSearchParam}>
                                    {sortOptions.map((option) => (
                                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                                            {option.label}
                                        </DropdownMenuRadioItem>
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