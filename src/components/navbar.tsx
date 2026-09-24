import { Suspense } from "react";
import { ModeToggle } from "./toggle-mode";
import { NavbarActiveLinks } from "./NavbarActiveLinks";
import { GlobeIcon, ShieldHalfIcon, Shuffle, UsersIcon, ZapIcon } from "lucide-react";
import { Button } from "./ui/button";

const pages = [
    { name: "Characters", href: "/", icon: <UsersIcon /> },
    { name: "Teams", href: "/teams", icon: <ShieldHalfIcon /> },
    { name: "Universes", href: "/universes", icon: <GlobeIcon /> },
    { name: "Powers", href: "/powers", icon: <ZapIcon /> },
    { name: "Random", href: "/characters/random", icon: <Shuffle /> },
];

export default function Navbar() {
    return (
        <nav
            className="border-b py-4 px-6 flex justify-between items-center"
            style={{ viewTransitionName: 'site-header' }}
        >
            <Suspense fallback={
                <div className="flex space-x-2">
                    {pages.map((page) => (
                        <Button key={page.href} variant="ghost" disabled>
                            {page.icon}
                            <span className="ml-2 hidden md:block">{page.name}</span>
                        </Button>
                    ))}
                </div>
            }>
                <NavbarActiveLinks />
            </Suspense>
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