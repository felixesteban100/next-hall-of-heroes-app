"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, Shield, Globe2, Zap } from "lucide-react";

const ROUTE_KEYS: Record<string, string> = {
    "/characters": "lastParams_characters",
    "/teams": "lastParams_teams",
    "/universes": "lastParams_universes",
    "/powers": "lastParams_powers",
};

const navLinks = [
    { name: "Characters", href: "/characters", icon: Users },
    { name: "Teams", href: "/teams", icon: Shield },
    { name: "Universes", href: "/universes", icon: Globe2 },
    { name: "Powers", href: "/powers", icon: Zap },
    { name: "Random", href: "/random", icon: Users },
];

export function NavbarActiveLinks() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [savedParams, setSavedParams] = useState<Record<string, string>>({});

    // 1. Load initial values from localStorage on mount
    useEffect(() => {
        const loaded: Record<string, string> = {};
        for (const [route, key] of Object.entries(ROUTE_KEYS)) {
            const stored = localStorage.getItem(key);
            if (stored) loaded[route] = stored;
        }
        setSavedParams(loaded);
    }, []);

    // 2. Synchronize current route params to localStorage AND state (Handles Clearing)
    useEffect(() => {
        const matchedBaseRoute = Object.keys(ROUTE_KEYS).find((route) =>
            // pathname.startsWith(route)
            pathname === route
        );

        if (!matchedBaseRoute) return;

        const key = ROUTE_KEYS[matchedBaseRoute];
        const currentQuery = searchParams.toString();

        if (currentQuery) {
            // Save active filters
            localStorage.setItem(key, currentQuery);
            setSavedParams((prev) => {
                if (prev[matchedBaseRoute] === currentQuery) return prev;
                return { ...prev, [matchedBaseRoute]: currentQuery };
            });
        } else {
            // ⚡ CLEAR STORAGE & STATE when searchParams are cleared (e.g. Clear All button)
            localStorage.removeItem(key);
            setSavedParams((prev) => {
                if (!prev[matchedBaseRoute]) return prev;
                const next = { ...prev };
                delete next[matchedBaseRoute];
                return next;
            });
        }
    }, [pathname, searchParams]);

    function buildHref(href: string) {
        const stored = savedParams[href];
        return stored ? `${href}?${stored}` : href;
    }

    return (
        <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                    <Link
                        key={link.href}
                        href={buildHref(link.href)}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive
                            ? "text-primary bg-primary/0 font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            }`}
                    >
                        <Icon
                            className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"
                                }`}
                        />
                        <span className="hidden sm:inline">{link.name}</span>

                        {/* Active Indicator Bar */}
                        {isActive && (
                            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}