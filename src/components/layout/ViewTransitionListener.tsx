// src/components/ViewTransitionListener.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";

export function ViewTransitionListener() {
    const router = useRouter();

    useEffect(() => {
        const handlePopState = () => {
            startTransition(() => {
                router.refresh();

                // Slight frame delay to give Next.js time to commit the un-cached DOM
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { });
                });
            });
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [router]);

    return null;
}