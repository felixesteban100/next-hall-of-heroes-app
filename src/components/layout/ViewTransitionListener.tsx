"use client";

import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";

export function ViewTransitionListener() {
    const router = useRouter();

    useEffect(() => {
        const handlePopState = () => {
            if (document.visibilityState !== "visible") return;

            startTransition(() => {
                router.refresh();
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