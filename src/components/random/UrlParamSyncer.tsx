// components/shared/UrlParamSyncer.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function UrlParamSyncer({ paramKey, query }: { paramKey: string; query: string }) {
    const router = useRouter();

    useEffect(() => {
        // Save to localStorage for NavbarActiveLinks
        localStorage.setItem(paramKey, query);

        // Update URL bar silently without triggering server components or loader traps
        window.history.replaceState(null, "", `?${query}`);
    }, [paramKey, query]);

    return null;
}