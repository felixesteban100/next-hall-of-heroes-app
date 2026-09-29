"use client";

import { createContext, useContext, useTransition, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ParamLoadingContextType {
    isPending: boolean;
    pushParams: (newParams: URLSearchParams) => void;
}

const ParamLoadingContext = createContext<ParamLoadingContextType>({
    isPending: false,
    pushParams: () => { },
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

    return (
        <ParamLoadingContext.Provider value={{ isPending, pushParams }}>
            {/* Top Banner / Spinner overlay when pending */}
            {isPending && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-primary text-primary-foreground text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    Updating characters...
                </div>
            )}
            {children}
        </ParamLoadingContext.Provider>
    );
}

export const useParamLoading = () => useContext(ParamLoadingContext);