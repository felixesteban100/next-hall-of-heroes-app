import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full">
            <div className="animate animate-pulse fixed top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-primary/10 via-primary/10 to-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />
            <div className="animate animate-pulse fixed bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-secondary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
            <Suspense fallback={<div className="h-16 w-full border-b border-border/40 bg-background/80" />}>
                <Navbar />
            </Suspense>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </div>
    )
}