"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Shield, Globe2, Zap, Sparkles } from "lucide-react";
import { useParamLoading } from "./ParamLoadingContext";

const ROUTE_KEYS: Record<string, string> = {
    "/characters": "lastParams_characters",
    "/teams": "lastParams_teams",
    "/universes": "lastParams_universes",
    "/powers": "lastParams_powers",
    "/compare": "lastParams_compare",
};

const navLinks = [
    { name: "Characters", href: "/characters", icon: Users },
    { name: "Teams", href: "/teams", icon: Shield },
    { name: "Universes", href: "/universes", icon: Globe2 },
    { name: "Powers", href: "/powers", icon: Zap },
    { name: "Random", href: "/random", icon: Users },
    { name: "Compare", href: "/compare", icon: Sparkles },
];

export function NavbarActiveLinks() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [savedParams, setSavedParams] = useState<Record<string, string>>({});
    const { navigateRoute } = useParamLoading();

    // Sync localStorage
    useEffect(() => {
        const loaded: Record<string, string> = {};
        for (const [route, key] of Object.entries(ROUTE_KEYS)) {
            const stored = localStorage.getItem(key);
            if (stored) loaded[route] = stored;
        }
        setSavedParams(loaded);
    }, []);

    useEffect(() => {
        const matchedBaseRoute = Object.keys(ROUTE_KEYS).find((route) =>
            pathname == route
        );

        if (!matchedBaseRoute) return;

        const key = ROUTE_KEYS[matchedBaseRoute];
        const currentQuery = searchParams.toString();

        if (currentQuery) {
            localStorage.setItem(key, currentQuery);
            setSavedParams((prev) => {
                if (prev[matchedBaseRoute] === currentQuery) return prev;
                return { ...prev, [matchedBaseRoute]: currentQuery };
            });
        } else {
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

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetHref: string) => {
        const fullHref = buildHref(targetHref);
        const currentFull = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

        if (currentFull === fullHref) {
            e.preventDefault();
            return;
        }

        // Trigger the loading overlay via navigateRoute
        e.preventDefault();
        navigateRoute(fullHref);
    };

    return (
        /* ⚡ overflow-x-auto allows smooth horizontal swipe scrolling on mobile without pushing layout */
        <div className="w-full overflow-x-auto no-scrollbar py-1">
            {/* Brand / Logo Link */}
            <nav className="flex items-center gap-1 sm:gap-2 min-w-max">
                <Link
                    href="/"
                    className="flex items-center gap-2 shrink-0 font-bold text-base sm:text-lg hover:opacity-90 transition-opacity"
                    onClick={(e) => handleLinkClick(e, "/")}
                >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden lg:inline">
                        Hall of Heroes
                    </span>
                </Link>
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    const fullHref = buildHref(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={fullHref}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation select-none shrink-0 ${isActive
                                ? "text-primary bg-primary/10 sm:bg-transparent font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent"
                                }`}
                        >
                            <Icon
                                className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`}
                            />
                            <span className="whitespace-nowrap hidden md:block">{link.name}</span>

                            {isActive && (
                                <span className="hidden sm:block absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}