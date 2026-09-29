import Link from "next/link";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/layout/toggle-mode";
import { NavbarActiveLinks } from "./NavbarActiveLinks";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center justify-start gap-5">
                    {/* Brand / Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-extrabold text-base sm:text-lg tracking-tight hover:opacity-90 transition-opacity"
                    >
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                            Hall of Heroes
                        </span>
                    </Link>

                    {/* Render Active Links here inside Suspense */}
                    <Suspense fallback={<div className="h-8 w-64 bg-accent/20 animate-pulse rounded-lg" />}>
                        <NavbarActiveLinks />
                    </Suspense>
                </div>

                {/* Right Actions / Theme Toggle */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}