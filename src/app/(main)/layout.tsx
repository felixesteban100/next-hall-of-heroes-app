"use client";

import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

// 🚀 Inner layout component that safely uses usePathname()
function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isLockedRoute = [
        "/characters",
        "/powers",
        "/universes",
        "/random",
        "/teams"
    ].includes(pathname);

    return (
        <div
            className={`relative w-full max-w-full overflow-x-hidden bg-background isolate flex flex-col ${isLockedRoute
                ? "h-[100dvh] overflow-hidden sm:h-auto sm:min-h-[100dvh] sm:overflow-y-auto" // 🚀 Locked on mobile, fully scrollable on desktop
                : "min-h-[100dvh] overflow-y-auto"
                }`}
        >
            <div
                className="
                    animate animate-pulse fixed top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] 
                    bg-gradient-to-tr 
                    from-primary/10 via-primary/10 to-primary/10
                    dak:from-primary blur-[140px] rounded-full pointer-events-none -z-10
                "
            />
            <div
                className="
                    animate animate-pulse fixed bottom-[-10%] right-[-5%] w-[600px] h-[400px] 
                    bg-secondary/10
                    dark:bg-secondary/20 
                    blur-[130px] rounded-full pointer-events-none -z-10 
                "
            />

            <Suspense fallback={<div className="h-16 w-full border-b border-border/40 bg-background/80 shrink-0" />}>
                <Navbar />
            </Suspense>

            <main className="w-full max-w-5xl mx-auto py-0 px-4 sm:px-6 lg:px-8 md:py-6 flex-1 flex flex-col min-h-0 mt-4" data-page-content>
                {children}
            </main>
        </div>
    );
}

// 🚀 Main layout wrapper with Suspense to satisfy build-time prerendering requirements
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-[100dvh] w-full bg-background" />}>
            <LayoutContent>{children}</LayoutContent>
        </Suspense>
    );
}