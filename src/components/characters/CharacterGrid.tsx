// components/characters/CharacterGrid.tsx
"use client"

import { useState, useEffect, useRef } from "react";
import { LoadingLink } from "@/components/shared/LoadingLink";
import CharacterCard from "@/components/characters/CharacterCard";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { BrushCleaning } from "lucide-react";

import { useSyncExternalStore } from "react";

function useIsMobile() {
    return useSyncExternalStore(
        (callback) => {
            window.addEventListener("resize", callback);
            return () => window.removeEventListener("resize", callback);
        },
        () => window.innerWidth < 640,
        () => false // Server fallback
    );
}

export function CharacterGrid({ characters }: { characters: CharacterWithJoinTeamUniversePowerEnemies[] }) {
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const isMobile = useIsMobile();

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

    {/* Mobile — snap scroll like TikTok/Shorts */ }
    if (isMobile) {
        return (
            <div className="sm:hidden flex flex-col h-[calc(100svh-8rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth">
                {characters.map((character, i) => (
                    <div
                        key={character.id}
                        className="snap-start snap-always shrink-0 h-[calc(100svh-8rem)] flex items-center justify-center px-4 py-2"
                        onFocus={() => setFocusedIndex(i)}
                    >
                        <LoadingLink
                            href={`/characters/${character.slug}`}
                            className="w-full h-full max-w-sm mx-auto"
                        >
                            <CharacterCard
                                character={character}
                                size="lg"
                            />
                        </LoadingLink>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {/* Desktop — regular grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
                {characters.map((character) => (
                    <LoadingLink key={character.id} href={`/characters/${character.slug}`}>
                        <CharacterCard character={character} />
                    </LoadingLink>
                ))}
            </div>
        </>
    );
}