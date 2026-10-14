"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { POWER_TIER, POWER_TIER_ICON, POWER_TIER_COLOR } from "@/lib/constants"; // Adjust path to your constants file
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import SortButton from "./SortButton";
import { SearchInputBar } from "./SearchInputBar";

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
        <div className="flex flex-col  gap-3 w-full">
            <div className="flex items-center w-full gap-2">
                <SearchInputBar
                    value={name}
                    onChange={(val) => setName(val)}
                    onSearch={() => updateParam("name", name)}
                    placeholder="Search characters by name..."
                />

                <div className="flex items-center justify-end gap-1">
                    <Drawer direction="right">
                        <DrawerTrigger asChild>
                            <Button size="sm" variant="outline" className='py-[17px]'>
                                <SlidersHorizontal size={16} />
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
                            </div>
                        </DrawerContent>
                    </Drawer>

                    <SortButton
                        sort={sort}
                        sortOrientation={sortOrientation}
                        updateParam={updateParam}
                        sortOptions={[
                            { value: "score", label: "Score" },
                            { value: "name", label: "Name" },
                            { value: "id", label: "Id" },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {(tierName && TierIcon && tierColor) && (
                    <span
                        key={tierName}
                        className={`capitalize inline-flex items-center gap-1 text-xs ${tierColor.foreground ?? "text-muted-foreground"} font-bold ${tierColor.bg ?? "bg-muted"} rounded-full px-3 py-1`}
                    >
                        <TierIcon size={10} />
                        <span className="hidden md:flex">{tierName}{" "}
                            #{activeTier}</span>
                    </span>
                )}
            </div>
        </div>
    );
}