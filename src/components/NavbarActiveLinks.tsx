"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation'
import { GlobeIcon, ShieldHalfIcon, Shuffle, UsersIcon, ZapIcon } from "lucide-react";

const pages = [
    { name: "Characters", href: "/", icon: <UsersIcon /> },
    { name: "Teams", href: "/teams", icon: <ShieldHalfIcon /> },
    { name: "Universes", href: "/universes", icon: <GlobeIcon /> },
    { name: "Powers", href: "/powers", icon: <ZapIcon /> },
    { name: "Random", href: "/characters/random", icon: <Shuffle /> },
];

export function NavbarActiveLinks() {
    const pathname = usePathname();

    return (
        <div className="flex space-x-2">
            {pages.map((page) => (
                <Link key={page.href} href={page.href}>
                    <Button variant={pathname === page.href ? "default" : "ghost"}>
                        {page.icon}
                        <span className="ml-2 hidden md:block">{page.name}</span>
                    </Button>
                </Link>
            ))}
        </div>
    )
}