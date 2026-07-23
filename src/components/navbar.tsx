"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { GlobeIcon, ShieldHalfIcon, UsersIcon, ZapIcon } from "lucide-react";
import { ModeToggle } from "./toggle-mode";
import { usePathname } from 'next/navigation'

const pages = [
    { name: "Characters", href: "/", icon: <UsersIcon /> },
    { name: "Teams", href: "/teams", icon: <ShieldHalfIcon /> },
    { name: "Universes", href: "/universes", icon: <GlobeIcon /> },
    { name: "Powers", href: "/powers", icon: <ZapIcon /> },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b py-4 px-6 flex justify-between items-center">
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
