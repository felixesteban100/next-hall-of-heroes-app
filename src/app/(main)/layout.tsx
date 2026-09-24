import Navbar, { NavbarSkeleton } from "@/components/navbar";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen">
            <header>
                <Suspense fallback={<NavbarSkeleton />}>
                    <Navbar />
                </Suspense>
            </header>
            <div className="p-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Suspense fallback={<div>Loading page content...</div>}>
                    {children}
                </Suspense>
            </div>
        </div>
    )
}