"use client"

import { useState, useEffect, useRef } from "react";
import { LoadingLink } from "@/components/shared/LoadingLink";
import CharacterCard from "@/components/characters/CharacterCard";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { BrushCleaning } from "lucide-react";

import { useSyncExternalStore } from "react";

export function useIsMobile() {
    return useSyncExternalStore(
        (callback) => {
            window.addEventListener("resize", callback);
            return () => window.removeEventListener("resize", callback);
        },
        () => window.innerWidth < 640,
        () => false // Server fallback
    );
}

/* focusedIndex is not getting used here, I feel it should be used */

export function CharacterGrid({ characters }: { characters: CharacterWithJoinTeamUniversePowerEnemies[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // Instant reset on characters/page change without visible scrolling animation
    useEffect(() => {
        if (containerRef.current) {
            // Instantly jump to top bypassing smooth animation
            containerRef.current.scrollTo({
                top: 0,
                behavior: "instant"
            });
        }
    }, [characters]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("scale-100", "opacity-100");
                        entry.target.classList.remove("scale-95", "opacity-70");
                    } else {
                        entry.target.classList.add("scale-95", "opacity-70");
                        entry.target.classList.remove("scale-100", "opacity-100");
                    }
                });
            },
            { threshold: 0.8 }
        );

        document.querySelectorAll(".snap-card").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [characters]);

    if (characters.length === 0) {
        return (
            <div className="col-span-full text-center text-muted-foreground font-bold mt-5">
                <div className="flex flex-col items-center justify-center gap-2">
                    <BrushCleaning />
                    No characters found.
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div
                ref={containerRef}
                className="sm:hidden h-[65vh] w-full flex flex-col self-center overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {characters.map((character) => (
                    <LoadingLink
                        key={character.id}
                        href={`/characters/${character.id}`}
                        className="snap-card snap-center snap-always shrink-0 h-full w-full flex items-center justify-center p-0 transition-all duration-300 scale-95 "
                    >
                        <CharacterCard character={character} />
                    </LoadingLink>
                ))}
            </div>
        );
    }

    return (
        <>
            {/* Desktop — regular grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
                {characters.map((character) => (
                    <LoadingLink key={character.id} href={`/characters/${character.id}`}>
                        <CharacterCard character={character} />
                    </LoadingLink>
                ))}
            </div>
        </>
    );
}