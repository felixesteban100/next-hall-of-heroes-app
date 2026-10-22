"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { LucideIcon, SlidersHorizontal, Zap } from "lucide-react";
import {
    POWER_TIER,
    POWER_TIER_ICON,
    POWER_TIER_COLOR,
    POWER_COMBAT_ROLE_ICON,
    POWER_ACTIVATION_TYPE_ICON,
    POWER_ACTIVATION_TYPE_COLOR,
    POWER_COMBAT_ROLE_COLOR
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
    const activeHasActions = searchParams.get("hasActions") === "true";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        if (value) params.set(key, value);
        else params.delete(key);
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push]);

    const filterTogglesButtons = [
        {
            activeProperty: activeRole,
            arrayToMap: Object.keys(POWER_COMBAT_ROLE_ICON),
            Icons: POWER_COMBAT_ROLE_ICON,
            colors: POWER_COMBAT_ROLE_COLOR,
            updateParam: updateParam,
            paramKeyName: "combatRole",
            label: "Combat Role"
        },
        {
            activeProperty: activeActivation,
            arrayToMap: Object.keys(POWER_ACTIVATION_TYPE_ICON),
            Icons: POWER_ACTIVATION_TYPE_ICON,
            colors: POWER_ACTIVATION_TYPE_COLOR,
            updateParam: updateParam,
            paramKeyName: "activationType",
            label: "Activation Type"
        },
        {
            activeProperty: activeTier,
            arrayToMap: Object.entries(POWER_TIER).map(([key, value]) => (key)),
            objectLabels: POWER_TIER,
            Icons: POWER_TIER_ICON,
            colors: POWER_TIER_COLOR,
            updateParam: updateParam,
            paramKeyName: "tier",
            label: "Tier"
        }
    ]

    const ActiveTierIcon = POWER_TIER_ICON[parseInt(activeTier) as keyof typeof POWER_TIER_ICON]
    const ActiveActivationIcon = POWER_ACTIVATION_TYPE_ICON[activeActivation as keyof typeof POWER_ACTIVATION_TYPE_ICON]
    const ActiveRoleIcon = POWER_COMBAT_ROLE_ICON[activeRole as keyof typeof POWER_COMBAT_ROLE_ICON]

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
                                <SlidersHorizontal size={16} />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="flex items-center gap-2 border-b pb-2">
                                    <SlidersHorizontal size={16} /> Filter Powers
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="no-scrollbar overflow-y-auto px-4 space-y-6 pb-6">
                                {filterTogglesButtons.map(c => (
                                    <TogglePropertyFilterButtons
                                        key={c.paramKeyName}
                                        Icons={c.Icons}
                                        activeProperty={c.activeProperty}
                                        arrayToMap={c.arrayToMap}
                                        colors={c.colors}
                                        updateParam={c.updateParam}
                                        paramKeyName={c.paramKeyName}
                                        label={c.label}
                                        objectLabels={c.objectLabels}
                                    />
                                ))}
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
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${POWER_COMBAT_ROLE_COLOR[activeRole as keyof typeof POWER_COMBAT_ROLE_COLOR].bg} rounded-full px-3 py-1`}>
                        <ActiveRoleIcon size={12} /> Role: {activeRole}
                    </span>
                )}
                {activeActivation && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${POWER_ACTIVATION_TYPE_COLOR[activeActivation as keyof typeof POWER_ACTIVATION_TYPE_COLOR].bg} rounded-full px-3 py-1`}>
                        <ActiveActivationIcon size={12} /> Activation: {activeActivation}
                    </span>
                )}
                {activeTier && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${POWER_TIER_COLOR[parseInt(activeTier) as keyof typeof POWER_TIER].bg} rounded-full px-3 py-1`}>
                        <ActiveTierIcon size={12} /> Tier #{activeTier} {POWER_TIER[parseInt(activeTier) as keyof typeof POWER_TIER]}
                    </span>
                )}
            </div>
        </div>
    );
}

type TogglePropertyFilterButtonsProps = {
    activeProperty: string,
    arrayToMap: string[],
    Icons: { [key: string]: LucideIcon },
    colors: { [key: string]: { text: string } },
    updateParam: (key: string, value: string) => void,
    paramKeyName: string;
    label: string;
    objectLabels?: { [key: string]: string }
}

function TogglePropertyFilterButtons({ activeProperty, arrayToMap, Icons, colors, updateParam, paramKeyName, label, objectLabels }: TogglePropertyFilterButtonsProps) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h4>
            <div className="grid grid-cols-1 gap-1">
                {arrayToMap.map((item) => {
                    const isActive = activeProperty === item;
                    const Icon = Icons[item]

                    return (
                        <DrawerClose key={item} asChild>
                            <Button
                                size="sm"
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => updateParam(paramKeyName, isActive ? "" : item)}
                                className={`${colors[item]?.text ?? ""} justify-start ${isActive ? "font-bold border-current bg-muted/50 hover:bg-muted/50" : ""}`}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5 mr-2" />}
                                {item} {objectLabels ? objectLabels[item] : ""}
                            </Button>
                        </DrawerClose>
                    );
                })}
            </div>
        </div>
    )
}