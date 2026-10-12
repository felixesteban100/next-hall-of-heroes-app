// components/shared/SearchInputBar.tsx
"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchInputBarProps = {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholder?: string;
    className?: string;
};

export function SearchInputBar({
    value,
    onChange,
    onSearch,
    placeholder = "Search...",
    className = "",
}: SearchInputBarProps) {
    return (
        <div className={`flex items-center w-full ${className}`}>
            <div className="relative flex-1">
                <SearchIcon
                    size={16}
                    className="hidden md:inline absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className="pl-2 md:pl-10 rounded-r-none"
                />
                {value && (
                    <X
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => onChange("")}
                    />
                )}
            </div>
            <Button
                className="rounded-l-none py-4"
                size="sm"
                onClick={onSearch}
                type="button"
            >
                <SearchIcon size={16} />
            </Button>
        </div>
    );
}