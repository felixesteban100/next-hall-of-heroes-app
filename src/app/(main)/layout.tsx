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
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}