'use client';

import { useRouter } from 'next/navigation';
import { clearDataCache } from '@/app/actions';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';
import { useParamLoading } from '../layout/ParamLoadingContext';

export function RefreshRandomPageButton({ path }: { path: string }) {
    const { pushParams } = useParamLoading()
    const handleClick = async () => {
        // 1. Clear saved random parameters from localStorage so a brand new set generates
        localStorage.removeItem("lastParams_random");

        // 2. Clear server data cache
        await clearDataCache(path);

        // 3. Navigate cleanly to the base /random route without query params to roll a new sample
        const params = new URLSearchParams("");

        pushParams(params)
    };

    return (
        <Button onClick={handleClick} size="sm" variant="outline" className="mb-4">
            <RefreshCcw /><span className='hidden md:inline'>New Random Batch</span>
        </Button>
    );
}