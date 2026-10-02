"use client";

import { Suspense } from "react";
import { NavbarActiveLinks } from "./NavbarActiveLinks";
import { ModeToggle } from "./toggle-mode";

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md touch-manipulation">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-2 sm:gap-4">
                {/* Navigation Links Scroll Container */}
                <div className="flex-1 overflow-x-auto no-scrollbar py-1 min-w-0">
                    <Suspense fallback={<div className="h-8 w-full bg-muted/40 animate-pulse rounded-lg" />}>
                        <NavbarActiveLinks />
                    </Suspense>
                </div>

                {/* Action Tools: Mode Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}