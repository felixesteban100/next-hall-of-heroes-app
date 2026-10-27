"use client";

import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // 🚀 Exact match check for base listing routes
    const isLockedRoute = [
        "/characters",
        "/powers",
        "/universes",
        "/random",
        "/teams"
    ].includes(pathname);

    // 🚀 Helper to determine the display page name dynamically
    const getPageTitle = (path: string) => {
        if (path === "/") return "Home";
        if (path.startsWith("/characters")) return path === "/characters" ? "Characters" : "Character Details";
        if (path.startsWith("/powers")) return path === "/powers" ? "Powers" : "Power Details";
        if (path.startsWith("/universes")) return path === "/universes" ? "Universes" : "Universe Details";
        if (path.startsWith("/teams")) return path === "/teams" ? "Teams" : "Team Details";
        if (path.startsWith("/random")) return "Random Explorer";

        // Default fallback: capitalize first segment
        const segment = path.split("/")[1];
        return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Hall of Heroes";
    };

    const pageTitle = getPageTitle(pathname);

    return (
        <div
            className={`relative w-full max-w-full overflow-x-hidden bg-background isolate flex flex-col ${isLockedRoute
                    ? "h-[100dvh] overflow-hidden"
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

            {/* Sticky Header */}
            <Suspense fallback={<div className="h-16 w-full border-b border-border/40 bg-background/80 shrink-0" />}>
                <Navbar />
            </Suspense>

            {/* 🚀 Dynamic Page Title Banner */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 flex items-center justify-between shrink-0">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {pageTitle}
                </h1>
            </div>

            {/* Main Content Flow */}
            <main className="w-full max-w-5xl mx-auto py-0 px-4 sm:px-6 lg:px-8 md:py-6 flex-1 flex flex-col min-h-0" data-page-content>
                {children}
            </main>
        </div>
    );
}