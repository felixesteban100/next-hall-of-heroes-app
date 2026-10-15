'use client';

import { useRouter } from 'next/navigation';
import { clearDataCache } from '@/app/actions';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

export function CacheClearButton({ path }: { path: string }) {
    const router = useRouter();

    const handleClick = async () => {
        // 1. Clear server data cache
        await clearDataCache(path);

        // 2. Refresh current route to clear Router Cache and fetch fresh data
        router.refresh();
    };

    return (
        <Button onClick={handleClick} size="sm" variant="outline" className="mb-4">
            <RefreshCcw /><span className='hidden md:inline'>Clear Cache & Refresh</span>
        </Button>
    );
}   