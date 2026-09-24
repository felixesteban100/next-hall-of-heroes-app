// src/components/ViewTransitionListener.tsx
"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function ViewTransitionListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentUrl = `${pathname}?${searchParams.toString()}`;

    // Store the active transition's resolve function and timeout ID
    const resolveRef = useRef<(() => void) | null>(null);
    const activeTransitionRef = useRef<any>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanly finalize any running transition so a new one can start without AbortError
    const completeActiveTransition = () => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        if (resolveRef.current) {
            resolveRef.current();
            resolveRef.current = null;
        }
    };

    useEffect(() => {
        if (!("startViewTransition" in document)) return;

        const handlePopState = () => {
            // 1. Immediately finish previous transition if user clicked back/forward quickly
            completeActiveTransition();

            // 2. Start new view transition
            try {
                const transition = document.startViewTransition(() => {
                    return new Promise<void>((resolve) => {
                        resolveRef.current = resolve;

                        // Fallback timer: prevent hanging promise if Next.js router cache resolves silently
                        timeoutIdRef.current = setTimeout(() => {
                            if (resolveRef.current) {
                                router.refresh();
                                requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                        completeActiveTransition();
                                    });
                                });
                            }
                        }, 60);
                    });
                });

                // Catch internal browser aborts quietly
                transition.finished.catch(() => {
                    // Ignores harmless "Transition was skipped" browser aborts
                });

                activeTransitionRef.current = transition;
            } catch {
                // Fallback if browser rejects startViewTransition call
                completeActiveTransition();
            }
        };

        window.addEventListener("popstate", handlePopState, true);
        return () => {
            window.removeEventListener("popstate", handlePopState, true);
            completeActiveTransition();
        };
    }, [router]);

    // Resolve active transition when Next.js finishes updating path/query params
    useEffect(() => {
        if (resolveRef.current) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    completeActiveTransition();
                });
            });
        }
    }, [currentUrl]);

    return null;
}