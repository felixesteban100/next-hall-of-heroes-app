"use client";

import {
    createContext,
    useContext,
    useTransition,
    ReactNode,
    Suspense,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import { flushSync } from "react-dom";          // ← add this
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ParamLoadingContextType {
    isPending: boolean;
    pushParams: (newParams: URLSearchParams) => void;
    navigateRoute: (href: string) => void;
}

const ParamLoadingContext = createContext<ParamLoadingContextType>({
    isPending: false,
    pushParams: () => { },
    navigateRoute: () => { },
});

function ParamLoadingInner({ children }: { children: ReactNode }) {
    const [isPending, startTransition] = useTransition();
    const [isPopLoading, setIsPopLoading] = useState(false);
    const { push } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentUrl = `${pathname}?${searchParams.toString()}`;
    const isPopNavigation = useRef(false);
    const urlAtPop = useRef<string | null>(null);
    const minShowUntil = useRef(0);

    const isLoading = isPending || isPopLoading;

    const clearPopLoading = useCallback(() => {
        isPopNavigation.current = false;
        urlAtPop.current = null;
        setIsPopLoading(false);
        document.documentElement.classList.remove("pop-loading");
        document.body.style.overflow = "";
    }, []);

    // Capture popstate as early as possible
    useEffect(() => {
        const handlePopState = () => {
            isPopNavigation.current = true;
            urlAtPop.current = currentUrl;
            minShowUntil.current = Date.now() + 320; // a bit longer for safety

            // Force the loading overlay to paint THIS frame (before Next paints the new page)
            flushSync(() => {
                setIsPopLoading(true);
            });

            // Instant CSS hide + scroll lock
            document.documentElement.classList.add("pop-loading");
            document.body.style.overflow = "hidden";
        };

        window.addEventListener("popstate", handlePopState, true);
        return () => window.removeEventListener("popstate", handlePopState, true);
    }, [currentUrl]);

    // Clear only after URL has changed AND minimum display time has passed
    useEffect(() => {
        if (!isPopNavigation.current) return;

        const urlChanged =
            urlAtPop.current !== null && currentUrl !== urlAtPop.current;

        if (!urlChanged) return;

        const remaining = Math.max(0, minShowUntil.current - Date.now());

        const t = setTimeout(clearPopLoading, remaining);
        return () => clearTimeout(t);
    }, [currentUrl, clearPopLoading]);

    // Safety net
    useEffect(() => {
        if (!isPopLoading) return;
        const t = setTimeout(clearPopLoading, 2500);
        return () => clearTimeout(t);
    }, [isPopLoading, clearPopLoading]);

    // Keep body scroll locked
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isLoading]);

    const pushParams = useCallback(
        (newParams: URLSearchParams) => {
            startTransition(() => {
                push(`${pathname}?${newParams.toString()}`, { scroll: false });
            });
        },
        [pathname, push]
    );

    const navigateRoute = useCallback(
        (href: string) => {
            startTransition(() => {
                push(href);
            });
        },
        [push]
    );

    return (
        <ParamLoadingContext.Provider
            value={{ isPending: isLoading, pushParams, navigateRoute }}
        >
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto cursor-wait">
                    <div className="flex items-center gap-3 p-4 px-6 rounded-2xl bg-card border border-border shadow-2xl">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            Loading...
                        </span>
                    </div>
                </div>
            )}
            <div inert={isLoading || undefined}>{children}</div>
        </ParamLoadingContext.Provider>
    );
}

export function ParamLoadingProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<>{children}</>}>
            <ParamLoadingInner>{children}</ParamLoadingInner>
        </Suspense>
    );
}

export const useParamLoading = () => useContext(ParamLoadingContext);