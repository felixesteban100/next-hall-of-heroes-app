import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        // 🚀 Only apply h-[100dvh] and overflow-hidden on mobile; allow normal height & scroll on desktop (sm:)
        <div className="relative w-full max-w-full overflow-x-hidden bg-background isolate h-[100dvh] sm:h-auto overflow-hidden sm:overflow-auto flex flex-col">
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
            {/* Sticky Header MUST be a top-level block sibling of the main content */}
            <Suspense fallback={<div className="h-16 w-full border-b border-border/40 bg-background/80 shrink-0" />}>
                <Navbar />
            </Suspense>

            {/* 🚀 Allow main content to flow naturally on desktop, flex-1 on mobile */}
            <main className="w-full max-w-5xl mx-auto py-0 mt-3 px-4 sm:px-6 lg:px-8 md:py-6 flex-1 sm:flex-none flex flex-col " data-page-content>
                {children}
            </main>
        </div>
    )
}