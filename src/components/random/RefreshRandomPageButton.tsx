'use client';

import { clearDataCache } from '@/app/actions';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';
import { useParamLoading } from '../layout/ParamLoadingContext';

const PINNED_KEY = "random_pinned_ids";

export function RefreshRandomPageButton({ path }: { path: string }) {
    const { pushParams } = useParamLoading();

    const handleClick = async () => {
        // 1. Clear saved random parameters so a brand new set generates
        //    BUT keep any pinned IDs — the server will include them in the new batch
        //    by pre-seeding the ?p= param with pinned ids (if any).
        const pinnedRaw = localStorage.getItem(PINNED_KEY);
        const pinnedIds: number[] = pinnedRaw ? JSON.parse(pinnedRaw) : [];

        localStorage.removeItem("lastParams_random");

        // 2. Clear server data cache
        await clearDataCache(path);

        // 3. Navigate — if there are pinned IDs, seed them into the query so the server
        //    knows to include them. The server can then fill the remaining slots randomly.
        const params = new URLSearchParams("");
        if (pinnedIds.length > 0) {
            params.set("pinned", pinnedIds.join(","));
        }

        pushParams(params);
    };

    return (
        <Button onClick={handleClick} size="sm" variant="outline" >
            <RefreshCcw />
            <span className="hidden md:inline">New Random Batch</span>
        </Button>
    );
}