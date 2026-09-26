"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon, ArrowBigDown, Filter, SlidersHorizontal } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { POWER_TIER, POWER_TIER_ICON, POWER_TIER_COLOR } from "@/lib/constants"; // Adjust path to your constants file
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";

const sortOptions = [
    { value: "score", label: "Score" },
    { value: "name", label: "Name" },
    { value: "id", label: "Id" },
];

export default function PowersFilterBar() {
    const { push } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [name, setName] = useState(searchParams.get("name") || "");
    const sort = searchParams.get("sort") || "score";
    const sortOrientation = searchParams.get("sortOrientation") || "desc";
    const activeTier = searchParams.get("tier") || "";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        if (value) params.set(key, value);
        else params.delete(key);
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push]);

    const tierKey = activeTier ? Number(activeTier) : undefined;
    const tierName = tierKey !== undefined ? POWER_TIER[tierKey as keyof typeof POWER_TIER] : undefined;
    const TierIcon = tierKey !== undefined ? POWER_TIER_ICON[tierKey as keyof typeof POWER_TIER_ICON] : undefined;
    const tierColor = tierKey !== undefined ? POWER_TIER_COLOR[tierKey as keyof typeof POWER_TIER_COLOR] : undefined;

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Search row */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search powers..."
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

            {/* Filters and Controls row */}
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    {(tierName && TierIcon && tierColor) && (
                        <span
                            key={tierName}
                            className={`capitalize inline-flex items-center gap-1 text-xs ${tierColor.foreground ?? "text-muted-foreground"} font-bold ${tierColor.bg ?? "bg-muted"} rounded-full px-3 py-1`}
                        >
                            <TierIcon size={10} />
                            {tierName}{" "}
                            #{activeTier}
                        </span>
                    )}
                </div>

                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button size="sm" variant="outline">
                            <SlidersHorizontal size={16} /> Filter
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2 border-b pb-2">
                                <SlidersHorizontal size={16} /> Filter Powers
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto px-4 space-y-4">
                            {Object.entries(POWER_TIER).map(([key, label]) => {
                                const tierNum = Number(key);
                                const Icon = POWER_TIER_ICON[tierNum];
                                const colors = POWER_TIER_COLOR[tierNum as keyof typeof POWER_TIER_COLOR];
                                const isActive = activeTier === key;

                                return (
                                    <DrawerClose
                                        key={key}
                                        asChild
                                    >
                                        <Button
                                            size="sm"
                                            variant={isActive ? "outline" : "ghost"}
                                            onClick={() => updateParam("tier", isActive ? "" : key)}
                                            className={`${colors.text} hover:${colors.text} ${isActive ? "font-bold" : "font-medium"}`}
                                        >

                                            {Icon && <Icon className="w-3.5 h-3.5 mr-1 inline-block" />}
                                            T{key}: {label.split(" / ")[0]}

                                        </Button>
                                    </DrawerClose>

                                );
                            })}
                            {/* <FilterSection label="TIER" active={!!draftFilters.tier} onClear={() => updateParam("tier", "")}>
                                {Object.entries(POWER_TIER).map(([value, label]) => {
                                    const color = POWER_TIER_COLOR[Number(value) as keyof typeof POWER_TIER_COLOR];
                                    const Icon = POWER_TIER_ICON[Number(value) as keyof typeof POWER_TIER_ICON];
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
                            </FilterSection> */}
                        </div>
                    </DrawerContent>
                </Drawer>

                {/* Sort controls */}
                <ButtonGroup>
                    <Button size="sm" variant="outline" onClick={() => updateParam("sortOrientation", sortOrientation === "asc" ? "desc" : "asc")}>
                        <ArrowBigDown className={`${sortOrientation === "asc" ? "rotate-180" : ""} transition-all`} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                                Sort: {sortOptions.find(o => o.value === sort)?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => updateParam("sort", v)}>
                                    {sortOptions.map(o => (
                                        <DropdownMenuRadioItem key={o.value} value={o.value}>
                                            {o.label}
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
}