"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence used in AnimatedCard exit
import { Pin, PinOff } from "lucide-react";
import { SwipeGrid, useIsMobile } from "@/components/shared/SwipeGrid";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { RefreshRandomPageButton } from "@/components/random/RefreshRandomPageButton";
import { cn } from "@/lib/utils";
import { ExtremeBanner, BannerItem } from "@/components/shared/ExtremeBanner";

// ── Types ─────────────────────────────────────────────────────────────────────

/** BatchExtreme extends BannerItem with a semantic type for server-side categorisation */
export type BatchExtreme = BannerItem & {
    type: "highest_tier" | "lowest_tier" | "villain_count" | "hero_count" | "publisher_mix" | "rare_find";
};

type Props = {
    sanitizedCharacters: any[];
    characterIdsString: string;
    isFreshRandom: boolean;
    extremes: BatchExtreme[];
};

// ── Keep/pin localStorage key ─────────────────────────────────────────────────
const PINNED_KEY = "random_pinned_ids";

function loadPinned(): Set<number> {
    try {
        const raw = localStorage.getItem(PINNED_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as number[]);
    } catch {
        return new Set();
    }
}

function savePinned(ids: Set<number>) {
    try {
        localStorage.setItem(PINNED_KEY, JSON.stringify([...ids]));
    } catch { }
}

// ── Pin overlay wrapper ───────────────────────────────────────────────────────

function PinButton({ id, pinned, onToggle }: { id: number; pinned: boolean; onToggle: (id: number) => void }) {
    return (
        <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(id); }}
            className={cn(
                "absolute top-2 right-2 z-20 p-1 rounded-full backdrop-blur-sm border transition-all duration-200",
                pinned
                    ? "bg-primary/90 border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                    : "bg-background/60 border-muted-foreground/20 text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
            title={pinned ? "Unpin (survives next refresh)" : "Pin (keep on next refresh)"}
        >
            {pinned ? <Pin className="size-3" /> : <PinOff className="size-3" />}
        </button>
    );
}

// ── Animated card wrapper ─────────────────────────────────────────────────────

function AnimatedCard({ item, index, pinned, onToggle, href, children }: {
    item: any;
    index: number;
    pinned: boolean;
    onToggle: (id: number) => void;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -16 }}
            transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
            className="relative"
        >
            <PinButton id={item.id} pinned={pinned} onToggle={onToggle} />
            {pinned && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-primary/60 ring-offset-1 ring-offset-background z-10 pointer-events-none" />
            )}
            {children}
        </motion.div>
    );
}

// ── Main client component ─────────────────────────────────────────────────────

export function RandomPageClient({ sanitizedCharacters, characterIdsString, extremes }: Props) {
    const [pinned, setPinned] = useState<Set<number>>(new Set());
    const [animKey, setAnimKey] = useState(0);
    const prevIdsRef = useRef(characterIdsString);
    const isMobile = useIsMobile();


    // Load pinned from localStorage on mount
    useEffect(() => {
        setPinned(loadPinned());
    }, []);

    // Trigger animation when the character batch changes
    useEffect(() => {
        if (characterIdsString !== prevIdsRef.current) {
            setAnimKey(k => k + 1);
            prevIdsRef.current = characterIdsString;
        }
    }, [characterIdsString]);

    const togglePin = useCallback((id: number) => {
        setPinned(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            savePinned(next);
            return next;
        });
    }, []);

    const pinnedCount = [...sanitizedCharacters].filter(c => pinned.has(c.id)).length;

    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between w-full gap-2 mb-1">
                {/* Stat extremes banner */}
                <ExtremeBanner items={extremes} /* className="mb-1" */ />
                <div className="flex items-center gap-2">
                    <RefreshRandomPageButton path="/random" />
                    <Button size="sm" variant="outline" asChild>
                        <LoadingLink href={`/compare?mode=bracket&size=8&p=${characterIdsString}`}>
                            <Scale />
                            <span className="hidden md:inline">Compare in bracket</span>
                        </LoadingLink>
                    </Button>
                </div>

            </div>


            {!isMobile && pinnedCount > 0 && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-primary font-semibold flex items-center gap-1"
                >
                    <Pin className="size-3" /> {pinnedCount} pinned
                </motion.span>
            )}

            {/* Animated desktop grid */}
            {!isMobile && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animKey}
                        className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-start mt-3 mb-4"
                    >
                        {sanitizedCharacters.map((item, index) => (
                            <AnimatedCard
                                key={item.id}
                                item={item}
                                index={index}
                                pinned={pinned.has(item.id)}
                                onToggle={togglePin}
                                href={`/characters/${item.id}`}
                            >
                                <LoadingLink href={`/characters/${item.id}`}>
                                    {/* EntityCard is rendered by SwipeGrid on mobile;
                                    on desktop we render it directly via the grid here.
                                    We import and use it inline to keep the pin overlay working. */}
                                    <DesktopCardSlot item={item} />
                                </LoadingLink>
                            </AnimatedCard>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Mobile swipe feed — SwipeGrid handles its own layout on sm: */}
            {isMobile && (
                <div className="sm:hidden">
                    <SwipeGrid
                        items={sanitizedCharacters}
                        currentPage={1}
                        totalPages={1}
                        type="character"
                        emptyMessage="No characters found."
                    />
                </div>)}
        </div>
    );
}

// ── Thin slot for desktop grid (re-uses getCardProps + EntityCard) ────────────
// We lazy-import to avoid a "use client" / server import boundary issue.
import { EntityCard } from "@/components/shared/EntityCard";
import { getCardProps } from "@/components/shared/getCardProps";

function DesktopCardSlot({ item }: { item: any }) {
    const props = getCardProps(item, "character");
    if (!props) return null;
    return <EntityCard {...props} />;
}