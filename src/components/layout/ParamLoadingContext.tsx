"use client";

import { createContext, useContext, useTransition, ReactNode, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
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

export function ParamLoadingProvider({ children }: { children: ReactNode }) {
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
            {/* ⚡ Full-App Screen Overlay (z-[100] covers sticky navbars) */}
            <Suspense fallback={null}>
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
            </Suspense>
            {children}
        </ParamLoadingContext.Provider>
    );
}

export const useParamLoading = () => useContext(ParamLoadingContext);