// src/components/ViewTransitionListener.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";

export function ViewTransitionListener() {
    const router = useRouter();

    useEffect(() => {
        const handlePopState = () => {
            // Wrap Next.js router restoration inside React 19's transition boundary.
            // This allows React's root <ViewTransition> component to coordinate 
            // the DOM update natively without triggering double-startViewTransition conflicts.
            startTransition(() => {
                router.refresh();
            });
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [router]);

    return null;
}