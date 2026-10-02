"use client"

import { Search } from "lucide-react";
import { useParamLoading } from "../layout/ParamLoadingContext";

export function StartPageSearchLink() {
    const { navigateRoute } = useParamLoading();
    return (
        <button
            onClick={() => navigateRoute("/characters")}
            className="group flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
        >
            <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm">Search characters, teams, or powers...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                ⌘K
            </kbd>
        </button>
    );
}