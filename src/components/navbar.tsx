"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { GlobeIcon, ShieldHalfIcon, Shuffle, UsersIcon, ZapIcon } from "lucide-react";
import { ModeToggle } from "./toggle-mode";
import { usePathname } from 'next/navigation'

const pages = [
    { name: "Characters", href: "/", icon: <UsersIcon /> },
    { name: "Teams", href: "/teams", icon: <ShieldHalfIcon /> },
    { name: "Universes", href: "/universes", icon: <GlobeIcon /> },
    { name: "Powers", href: "/powers", icon: <ZapIcon /> },
    { name: "Random", href: "/characters/random", icon: <Shuffle /> },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b py-4 px-6 flex justify-between items-center" style={{ viewTransitionName: 'site-header' }}>
            <div className="flex space-x-2">
                {pages.map((page) => (
                    <Link key={page.href} href={page.href}>
                        <Button variant={pathname === page.href ? "default" : "ghost"} >
                            {page.icon} <span className="ml-2 hidden md:block">{page.name}</span>
                        </Button>
                    </Link>
                ))}
            </div>

            <ModeToggle />
        </nav>
    )
}

export function NavbarSkeleton() {
    return (
        <nav className="border-b py-4 px-6 flex justify-between items-center" style={{ viewTransitionName: 'site-header' }}>
            <div className="flex space-x-2">
                {pages.map((page) => (
                    <Button key={page.href} variant="ghost" disabled>
                        {page.icon} <span className="ml-2 hidden md:block">{page.name}</span>
                    </Button>
                ))}
            </div>
            <Button variant="ghost" disabled>
                <span className="ml-2 hidden md:block">Loading...</span>
            </Button>
        </nav>
    )
}