"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SearchIcon, X } from "lucide-react";
import SortButton, { SortOption } from "./SortButton";

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
    const sortOrientation = searchParams.get("sortOrientation") || "asc";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("page");

        if (value) params.set(key, value);
        else params.delete(key); setName("");
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
                        className="pl-10 "
                    />
                    <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setName("")} />
                </div>
                <Button size="sm" onClick={() => updateParam("name", name)}>
                    <SearchIcon size={16} />
                </Button>
            </div>

            {/* Row 2 — sort (no filter drawer needed for simple pages) */}
            <div className="flex items-center justify-end gap-2">
                <SortButton
                    sort={sort}
                    sortOrientation={sortOrientation}
                    updateParam={updateParam}
                    sortOptions={sortOptions}
                />
            </div>
        </div>
    );
}