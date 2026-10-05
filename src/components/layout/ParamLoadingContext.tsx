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
} from "react";
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
    // true only while we're in a back/forward navigation
    const isPopNavigation = useRef(false);
    const urlAtPop = useRef<string | null>(null);

    const isLoading = isPending || isPopLoading;

    // 1. Browser back / forward
    useEffect(() => {
        const handlePopState = () => {
            // At popstate time, React hooks often still have the OLD url
            isPopNavigation.current = true;
            urlAtPop.current = currentUrl; // snapshot of what React still sees
            setIsPopLoading(true);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [currentUrl]);

    // 2. After React receives the new URL, keep the overlay visible briefly, then clear
    useEffect(() => {
        if (!isPopNavigation.current) return;

        // Wait until hooks have moved past the URL we snapped at pop time
        const urlChanged =
            urlAtPop.current !== null && currentUrl !== urlAtPop.current;

        // If Next is very fast, url might already match window.location —
        // still treat any pop as "in progress" until min time elapses
        if (!urlChanged && urlAtPop.current === currentUrl) {
            // hooks not updated yet — stay loading
            return;
        }

        const MIN_MS = 280; // long enough to actually see the spinner
        const t = setTimeout(() => {
            isPopNavigation.current = false;
            urlAtPop.current = null;
            setIsPopLoading(false);
        }, MIN_MS);

        return () => clearTimeout(t);
    }, [currentUrl]);

    // Safety net: never leave the overlay stuck
    useEffect(() => {
        if (!isPopLoading) return;
        const t = setTimeout(() => {
            isPopNavigation.current = false;
            urlAtPop.current = null;
            setIsPopLoading(false);
        }, 2500);
        return () => clearTimeout(t);
    }, [isPopLoading]);

    // Scroll lock
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

    const pushParams = (newParams: URLSearchParams) => {
        startTransition(() => {
            push(`${pathname}?${newParams.toString()}`, { scroll: false });
        });
    };

    const navigateRoute = (href: string) => {
        startTransition(() => {
            push(href);
        });
    };

    return (
        <ParamLoadingContext.Provider
            value={{ isPending: isLoading, pushParams, navigateRoute }}
        >
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto cursor-wait">
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