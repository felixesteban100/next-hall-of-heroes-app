"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    // Home,
    Users,
    Shield,
    Globe2,
    Zap,
    Sparkles
} from "lucide-react";
import { ModeToggle } from "@/components/layout/toggle-mode"; // Adjust path if needed

export function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        // { name: "Home", href: "/", icon: Home },
        { name: "Characters", href: "/characters", icon: Users },
        { name: "Teams", href: "/teams", icon: Shield },
        { name: "Universes", href: "/universes", icon: Globe2 },
        { name: "Powers", href: "/powers", icon: Zap },
    ];

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

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            // Check if active route (exact for Home, startsWith for domain subroutes)
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive
                                        ? "text-primary bg-primary/0 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="hidden sm:inline">{link.name}</span>

                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions / Theme Toggle */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>

            </div>
        </header>
    );
}