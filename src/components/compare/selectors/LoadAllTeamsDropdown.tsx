// components/compare/selectors/LoadAllTeamsDropdown.tsx
"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { Users, Loader2, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MAX_TEAM_SIZE } from "@/app/(main)/compare/page";

type TeamOption = {
    name: string;
    team_id?: number;
    ids: number[];
    totalCount: number;
};

type Props = {
    paramKey: "a" | "b";
    excludeIds: number[];
    // Pass a server-fetched list or fetch on open
    fetchTeamsAction: () => Promise<TeamOption[]>;
};

export function LoadAllTeamsDropdown({ paramKey, excludeIds, fetchTeamsAction }: Props) {
    const searchParams = useSearchParams();
    const { pushParams } = useParamLoading();
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, startTransition] = useTransition();

    // Lazy load teams only when the user opens the menu for maximum speed
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && teams.length === 0) {
            startTransition(async () => {
                const data = await fetchTeamsAction();
                setTeams(data);
            });
        }
    };

    const handleSelectTeam = (teamName: string, allTeamIds: number[]) => {
        // 1. Filter out any characters that are already selected on the OPPOSITE team
        const availableIds = allTeamIds.filter(id => !excludeIds.includes(id));

        // 2. Fisher-Yates shuffle on the filtered pool
        const shuffled = [...availableIds];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selectedIds = shuffled.slice(0, MAX_TEAM_SIZE);

        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, selectedIds.join(","));
        params.set(`${paramKey}_name`, teamName);

        pushParams(params);
    };

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
        && t.totalCount > 1
    );

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/30 hover:bg-muted text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                    <Users className="size-3.5" />
                    {/* <span>Load Team...</span> */}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto p-2">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>All Factions</span>
                    {isLoading && <Loader2 className="size-3 animate-spin text-primary" />}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Search filter for fast navigation */}
                <div className="p-1 pb-2 sticky top-0 bg-popover z-10">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background">
                        <Search className="size-3 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {filteredTeams.length === 0 && !isLoading ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                        No teams found
                    </div>
                ) : (
                    filteredTeams.map((team) => (
                        <DropdownMenuItem
                            key={team.name}
                            onClick={() => handleSelectTeam(team.name, team.ids)}
                            className="flex items-center justify-between cursor-pointer py-1.5 px-2 text-xs"
                        >
                            <span className="font-light text-muted-foreground text-foreground truncate max-w-[160px]">
                                {team.name} <span className="font-semibold text-foreground">{team.team_id && `#${team.team_id}`}</span>
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                                {team.totalCount}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}