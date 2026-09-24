"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname, useSearchParams } from 'next/navigation'
import { GlobeIcon, ShieldHalfIcon, Shuffle, UsersIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ROUTE_KEYS: Record<string, string> = {
    "/": "lastParams_characters",
    "/teams": "lastParams_teams",
    "/universes": "lastParams_universes",
    "/powers": "lastParams_powers",
};

const pages = [
    { name: "Characters", href: "/", icon: <UsersIcon /> },
    { name: "Teams", href: "/teams", icon: <ShieldHalfIcon /> },
    { name: "Universes", href: "/universes", icon: <GlobeIcon /> },
    { name: "Powers", href: "/powers", icon: <ZapIcon /> },
    { name: "Random", href: "/characters/random", icon: <Shuffle /> },
];

export function NavbarActiveLinks() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [savedParams, setSavedParams] = useState<Record<string, string>>({});

    // Load initial values from localStorage on mount
    useEffect(() => {
        const loaded: Record<string, string> = {};
        for (const [route, key] of Object.entries(ROUTE_KEYS)) {
            const stored = localStorage.getItem(key);
            if (stored) loaded[route] = stored;
        }
        setSavedParams(loaded);
    }, []);

    // Synchronize current route params to localStorage AND React state
    useEffect(() => {
        const key = ROUTE_KEYS[pathname];
        if (!key) return;

        const qs = searchParams.toString();

        if (qs) {
            localStorage.setItem(key, qs);
            setSavedParams((prev) => ({ ...prev, [pathname]: qs }));
        } else {
            // Optional: remove stored params if user cleared filters
            localStorage.removeItem(key);
            setSavedParams((prev) => {
                const next = { ...prev };
                delete next[pathname];
                return next;
            });
        }
    }, [pathname, searchParams]);

    function buildHref(href: string) {
        const stored = savedParams[href];
        if (!stored) return href;
        return `${href}?${stored}`;
    }

    return (
        <div className="flex space-x-2">
            {pages.map((page) => (
                <Link key={page.href} href={buildHref(page.href)}>
                    <Button variant={pathname === page.href ? "default" : "ghost"}>
                        {page.icon}
                        <span className="ml-2 hidden md:block">{page.name}</span>
                    </Button>
                </Link>
            ))}
        </div>
    );
}