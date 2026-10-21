"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
    POWER_TIER,
    POWER_TIER_ICON,
    POWER_TIER_COLOR,
    POWER_COMBAT_ROLE_ICON,
    POWER_ACTIVATION_TYPE_ICON
} from "@/lib/constants";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import SortButton from "./SortButton";
import { SearchInputBar } from "./SearchInputBar";
import { PowerRole } from "@/types";

export default function PowersFilterBar() {
    const { push } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [name, setName] = useState(searchParams.get("name") || "");
    const sort = searchParams.get("sort") || "score";
    const sortOrientation = searchParams.get("sortOrientation") || "desc";
    const activeTier = searchParams.get("tier") || "";
    const activeRole = searchParams.get("combatRole") || "";
    const activeActivation = searchParams.get("activationType") || "";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        if (value) params.set(key, value);
        else params.delete(key);
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push]);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center w-full gap-2">
                <SearchInputBar
                    value={name}
                    onChange={(val) => setName(val)}
                    onSearch={() => updateParam("name", name)}
                    placeholder="Search powers by name..."
                />

                <div className="flex items-center justify-end gap-1">
                    <Drawer direction="right">
                        <DrawerTrigger asChild>
                            <Button size="sm" variant="outline" className='py-[17px]'>
                                <SlidersHorizontal size={16} /> Filters
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="flex items-center gap-2 border-b pb-2">
                                    <SlidersHorizontal size={16} /> Filter Powers
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="no-scrollbar overflow-y-auto px-4 space-y-6 pb-6">

                                {/* --- COMBAT ROLE FILTER SECTION --- */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Combat Role</h4>
                                    <div className="grid grid-cols-1 gap-1">
                                        {(Object.keys(POWER_COMBAT_ROLE_ICON) as PowerRole[]).map((role) => {
                                            const Icon = POWER_COMBAT_ROLE_ICON[role];
                                            const isActive = activeRole === role;
                                            return (
                                                <DrawerClose key={role} asChild>
                                                    <Button
                                                        size="sm"
                                                        variant={isActive ? "default" : "ghost"}
                                                        onClick={() => updateParam("combatRole", isActive ? "" : role)}
                                                        className={`justify-start ${isActive ? "font-bold" : ""}`}
                                                    >
                                                        {Icon && <Icon className="w-3.5 h-3.5 mr-2" />}
                                                        {role}
                                                    </Button>
                                                </DrawerClose>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* --- ACTIVATION TYPE FILTER SECTION --- */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activation Type</h4>
                                    <div className="grid grid-cols-2 gap-1">
                                        {Object.keys(POWER_ACTIVATION_TYPE_ICON).map((type) => {
                                            const Icon = POWER_ACTIVATION_TYPE_ICON[type];
                                            const isActive = activeActivation === type;
                                            return (
                                                <DrawerClose key={type} asChild>
                                                    <Button
                                                        size="sm"
                                                        variant={isActive ? "default" : "ghost"}
                                                        onClick={() => updateParam("activationType", isActive ? "" : type)}
                                                        className={`justify-start ${isActive ? "font-bold" : ""}`}
                                                    >
                                                        {Icon && <Icon className="w-3.5 h-3.5 mr-2" />}
                                                        {type}
                                                    </Button>
                                                </DrawerClose>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* --- POWER TIER FILTER SECTION --- */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Power Tier</h4>
                                    <div className="grid grid-cols-1 gap-1">
                                        {Object.entries(POWER_TIER).map(([key, label]) => {
                                            const tierNum = Number(key);
                                            const Icon = POWER_TIER_ICON[tierNum];
                                            const colors = POWER_TIER_COLOR[tierNum as keyof typeof POWER_TIER_COLOR];
                                            const isActive = activeTier === key;

                                            return (
                                                <DrawerClose key={key} asChild>
                                                    <Button
                                                        size="sm"
                                                        variant={isActive ? "default" : "ghost"}
                                                        onClick={() => updateParam("tier", isActive ? "" : key)}
                                                        className={`${colors?.text ?? ""} justify-start ${isActive ? "font-bold border-current bg-muted/50" : ""}`}
                                                    >
                                                        {Icon && <Icon className="w-3.5 h-3.5 mr-2 inline-block" />}
                                                        T{key}: {label.split(" / ")[0]}
                                                    </Button>
                                                </DrawerClose>
                                            );
                                        })}
                                    </div>
                                </div>

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

            {/* Active Filters Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {activeRole && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary rounded-full px-3 py-1">
                        Role: {activeRole}
                    </span>
                )}
                {activeActivation && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-500 rounded-full px-3 py-1">
                        Activation: {activeActivation}
                    </span>
                )}
                {activeTier && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/10 text-amber-500 rounded-full px-3 py-1">
                        Tier #{activeTier}
                    </span>
                )}
            </div>
        </div>
    );
}