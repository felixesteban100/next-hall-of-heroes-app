"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon, ArrowBigDown } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger
} from "./ui/dropdown-menu";

type SortOption = { value: string; label: string };

export default function SimpleFilterBar({
    placeholder = "Search...",
    sortOptions,
}: {
    placeholder?: string;
    sortOptions: SortOption[];
}) {
    const { push } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [name, setName] = useState(searchParams.get("name") || "");
    const sort = searchParams.get("sort") || sortOptions[0].value;
    const sortOrientation = searchParams.get("sortOrientation") || "desc";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        if (value) params.set(key, value);
        else params.delete(key);
        push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, push]);

    return (
        <div className="flex flex-col gap-3 w-full">

            {/* Row 1 — search only */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
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

            {/* Row 2 — sort (no filter drawer needed for simple pages) */}
            <div className="flex items-center justify-end gap-2">
                <ButtonGroup>
                    <Button
                        size="sm"
                        variant="outline"
                        aria-label="Toggle sort direction"
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
                        <DropdownMenuContent className="w-36">
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