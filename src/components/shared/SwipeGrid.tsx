"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { ArrowBigLeftIcon, ArrowBigRightIcon, BrushCleaning } from "lucide-react";
import { useSyncExternalStore } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Import your card components here
import PowerCard from "@/components/powers/PowerCard";
import CharacterCard from "@/components/characters/CharacterCard";
import UniverseCard from "../universes/UniverseCard";
import TeamCard from "../teams/TeamCard";

export function useIsMobile() {
    return useSyncExternalStore(
        (callback) => {
            window.addEventListener("resize", callback);
            return () => window.removeEventListener("resize", callback);
        },
        () => window.innerWidth < 640,
        () => false
    );
}

interface SwipeGridProps {
    items: any[];
    currentPage: number;
    totalPages: number;
    type: "power" | "character" | "team" | "universe";
    emptyMessage?: string;
    desktopGridClassName?: string;
}

export function SwipeGrid({
    items,
    currentPage,
    totalPages,
    type,
    emptyMessage = "No items found.",
    desktopGridClassName = "hidden sm:grid sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch",
}: SwipeGridProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isNavigatingRef = useRef(false);
    const touchStartYRef = useRef<number | null>(null);

    // 🚀 Tracks whether we came from a next or previous page transition
    const targetIndexRef = useRef<number | null>(null);

    const x = useMotionValue(0);
    const prevOpacity = useTransform(x, (val) => (val > 20 && currentPage > 1 ? Math.min(val / 100, 1) : 0));
    const nextOpacity = useTransform(x, (val) => (val < -20 && currentPage < totalPages ? Math.min(Math.abs(val) / 100, 1) : 0));

    // Handle initial load or page change scroll alignment accurately
    useEffect(() => {
        isNavigatingRef.current = false;
        animate(x, 0, { duration: 0 });

        if (containerRef.current && items.length > 0) {
            const newIndex = targetIndexRef.current !== null
                ? Math.min(targetIndexRef.current, items.length - 1)
                : 0;

            setActiveIndex(newIndex);
            targetIndexRef.current = null;

            // 🚀 Force precise pixel alignment to bypass snap interference
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const cards = container.querySelectorAll<HTMLElement>(".snap-card");
                const targetCard = cards[newIndex];

                if (targetCard) {
                    const cardTop = targetCard.offsetTop;
                    const cardHeight = targetCard.offsetHeight;
                    const containerHeight = container.clientHeight;

                    // Calculate exact scroll position to center the target card perfectly
                    const centeredScrollTop = cardTop - (containerHeight / 2) + (cardHeight / 2);

                    container.scrollTo({
                        top: Math.max(0, centeredScrollTop),
                        behavior: "instant" // Instant prevents jitter during page loads
                    });
                }
            });
        }
    }, [items, x]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onTouchMove = (e: TouchEvent) => {
            if (touchStartYRef.current === null || isNavigatingRef.current) return;
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartYRef.current - touchY;
            const { scrollTop, scrollHeight, clientHeight } = el;

            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
            const isAtTop = scrollTop <= 2;

            if ((isAtBottom && deltaY > 40) || (isAtTop && deltaY < -40)) {
                e.preventDefault();
            }
        };

        el.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            el.removeEventListener("touchmove", onTouchMove);
        };
    }, [currentPage, totalPages]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || isNavigatingRef.current) return;

        const containerCenter = container.scrollTop + container.clientHeight / 2;
        const cards = Array.from(container.querySelectorAll<HTMLElement>(".snap-card"));

        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const cardCenter = card.offsetTop + card.offsetHeight / 2;
            const distance = Math.abs(containerCenter - cardCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
        }
    };

    const triggerPageChange = (direction: "next" | "prev") => {
        if (isNavigatingRef.current) return;
        const params = new URLSearchParams(searchParams.toString());

        if (direction === "next" && currentPage < totalPages) {
            isNavigatingRef.current = true;
            targetIndexRef.current = 0; // 🚀 Focus first item when going forward to next page
            params.set("page", (currentPage + 1).toString());
            router.push(`?${params.toString()}`);
        } else if (direction === "prev" && currentPage > 1) {
            isNavigatingRef.current = true;
            targetIndexRef.current = items.length - 1; // 🚀 Focus last item when going backward to previous page
            params.set("page", (currentPage - 1).toString());
            router.push(`?${params.toString()}`);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const el = containerRef.current;
        if (!el || touchStartYRef.current === null || isNavigatingRef.current) return;

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartYRef.current - touchY;
        const { scrollTop, scrollHeight, clientHeight } = el;

        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
        const isAtTop = scrollTop <= 2;

        if (isAtBottom && deltaY > 30 && currentPage < totalPages) {
            e.preventDefault();
            triggerPageChange("next");
        } else if (isAtTop && deltaY < -30 && currentPage > 1) {
            e.preventDefault();
            triggerPageChange("prev");
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        const el = containerRef.current;
        if (!el || isNavigatingRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
        const isAtTop = scrollTop <= 2;

        if (isAtBottom && e.deltaY > 25) {
            triggerPageChange("next");
        } else if (isAtTop && e.deltaY < -25) {
            triggerPageChange("prev");
        }
    };

    const getItemHref = (item: any) => {
        switch (type) {
            case "power": return `/powers/${item.id}`;
            case "character": return `/characters/${item.id}`;
            case "team": return `/teams/${item.id}`;
            case "universe": return `/universes/${item.id}`;
            default: return `/${item.id}`;
        }
    };

    const renderCard = (item: any) => {
        switch (type) {
            case "power": return <PowerCard power={item} size="default" />;
            case "character": return <CharacterCard character={item} />;
            case "universe": return <UniverseCard universe={item} size="default" />;
            case "team": return <TeamCard team={item} size="default" />;
            default: return null;
        }
    };

    if (items.length === 0) {
        return (
            <div className="col-span-full text-center text-muted-foreground font-bold mt-5">
                <div className="flex flex-col items-center justify-center gap-2">
                    <BrushCleaning />
                    {emptyMessage}
                </div>
            </div>
        );
    }

    if (isMobile) {
        const leftConstraint = currentPage < totalPages ? -120 : 0;
        const rightConstraint = currentPage > 1 ? 120 : 0;

        return (
            <div className="w-full flex flex-col items-center relative overflow-hidden">
                {totalPages > 1 && <div className="text-xs text-muted-foreground font-medium mt-1 mx-auto">
                    Page {currentPage} of {totalPages}
                </div>}

                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none px-2 z-20">
                    {currentPage > 1 ? (
                        <motion.span style={{ opacity: prevOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center">
                            <ArrowBigLeftIcon className="w-10 h-10 drop-shadow-md" />
                        </motion.span>
                    ) : <span />}

                    {currentPage < totalPages ? (
                        <motion.span style={{ opacity: nextOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center">
                            <ArrowBigRightIcon className="w-10 h-10 drop-shadow-md" />
                        </motion.span>
                    ) : <span />}
                </div>

                <motion.div
                    drag="x"
                    dragConstraints={{ left: leftConstraint, right: rightConstraint }}
                    dragElastic={0.3}
                    style={{ x }}
                    onDragEnd={(_e, info) => {
                        const threshold = 80;
                        if (info.offset.x < -threshold && currentPage < totalPages) {
                            triggerPageChange("next");
                        } else if (info.offset.x > threshold && currentPage > 1) {
                            triggerPageChange("prev");
                        } else {
                            animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
                        }
                    }}
                    className="w-full touch-pan-y"
                >
                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onWheel={handleWheel}
                        className="sm:hidden max-h-[68vh] w-full flex flex-col items-center overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-6 relative"
                    >
                        {items.map((item, index) => {
                            const isActive = activeIndex === index;
                            return (
                                <div
                                    key={item.id}
                                    className={`snap-card snap-center snap-always shrink-0 w-full flex flex-col items-center justify-center py-4 px-3 transition-all duration-300 ease-out relative ${isActive
                                        ? "scale-100 opacity-100 z-10 filter-none"
                                        : "scale-75 opacity-30 z-0 blur-[1px]"
                                        }`}
                                >
                                    <div className="w-full max-w-lg px-2 flex justify-center z-10 mx-auto">
                                        <LoadingLink href={getItemHref(item)} className="w-full block pointer-events-auto">
                                            {renderCard(item)}
                                        </LoadingLink>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={desktopGridClassName}>
            {items.map((item) => (
                <LoadingLink key={item.id} href={getItemHref(item)}>
                    {renderCard(item)}
                </LoadingLink>
            ))}
        </div>
    );
}