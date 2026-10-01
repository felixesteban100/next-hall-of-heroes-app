"use client";

import { createContext, useContext, useTransition, ReactNode, Suspense } from "react";
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

// Inner component isolates dynamic hooks so SSG / prerendering doesn't break
function ParamLoadingInner({ children }: { children: ReactNode }) {
    const [isPending, startTransition] = useTransition();
    const { push } = useRouter();
    const pathname = usePathname();

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
        <ParamLoadingContext.Provider value={{ isPending, pushParams, navigateRoute }}>
            {isPending && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto cursor-wait">
                    <div className="flex items-center gap-3 p-4 px-6 rounded-2xl bg-card border border-border shadow-2xl">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            Loading...
                        </span>
                    </div>
                </div>
            )}
            {children}
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