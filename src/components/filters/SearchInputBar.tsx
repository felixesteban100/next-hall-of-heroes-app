// components/shared/SearchInputBar.tsx
"use client";

import { Search as SearchIcon, X, AlignLeft, AlignRight, Equal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { EntityFilterType } from "./getFilterProps";

type SearchInputBarProps = {
    type: EntityFilterType
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    className?: string;
    modes?: string[];
    onModesChange?: (modes: string[]) => void;
    fields?: string[];
    onFieldsChange?: (fields: string[]) => void;
};

const searchFields = [
    { id: "name", label: "Name" },
    { id: "fullName", label: "Full Name" },
    { id: "aliases", label: "Aliases" },
    { id: "alterEgos", label: "Alter Egos" },
];

export function SearchInputBar({
    type,
    value,
    onChange,
    onSearch,
    placeholder = "Search...",
    className = "",
    modes = [],
    onModesChange,
    fields,
    onFieldsChange
}: SearchInputBarProps) {
    const availableModes = [
        { id: "startsWith", label: "Starts", symbol: "^", title: "Starts with (^)", Icon: AlignLeft },
        { id: "endsWith", label: "Ends", symbol: "$", title: "Ends with ($)", Icon: AlignRight },
        { id: "exact", label: "Exact", symbol: "=", title: "Exact Match (=)", Icon: Equal },
    ];

    return (
        <div className={`flex flex-col gap-2 w-full ${className}`}>
            {/* Full-width Search Input */}
            {type == "character" &&
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-0.5">
                        Fields:
                    </span>
                    <ToggleGroup
                        type="multiple"
                        variant="outline"
                        value={fields}
                        onValueChange={onFieldsChange}
                        className="gap-1"
                    >
                        {searchFields.map(({ id, label }) => (
                            <ToggleGroupItem key={id} value={id} className="text-[10px] h-7 px-2">
                                {label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>}
            <div className="relative w-full">
                <SearchIcon
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        e.preventDefault();
                        onChange(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                    className="pl-9 pr-8 h-9 text-xs rounded-md w-full"
                />
                {value && (
                    <X
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => onChange("")}
                    />
                )}
            </div>

            {/* Multi-Toggle Match Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-0.5">
                    Match:
                </span>

                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={modes}
                    onValueChange={onModesChange}
                >
                    {availableModes.map(({ id, label, symbol, title, Icon }) => (
                        <ToggleGroupItem
                            key={id}
                            className="text-[10px] h-7 px-2"
                            value={id}
                            aria-label="Toggle bold"
                        >
                            <Icon size={12} />
                            <span>{label}</span>
                            <span className="font-mono opacity-70">({symbol})</span>
                        </ToggleGroupItem>

                    ))}
                </ToggleGroup>
            </div>
        </div>
    );
}