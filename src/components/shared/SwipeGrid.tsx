"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowBigLeftIcon, ArrowBigRightIcon, BrushCleaning } from "lucide-react";
import { useSyncExternalStore } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

import { EntityCard } from "./EntityCard";
import { getCardProps } from "./getCardProps";
import { useParamLoading } from "../layout/ParamLoadingContext";

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

// make this function so that the 3d tilt work on tablets also
// export function useIsTablet() {
//     return useSyncExternalStore(
//         (callback) => {
//             window.addEventListener("resize", callback);
//             return () => window.removeEventListener("resize", callback);
//         },
//         () => window.innerWidth < 640,
//         () => false
//     );
// }

export type EntityType = "power" | "character" | "team" | "universe"

interface SwipeGridProps {
    items: any[];
    currentPage: number;
    totalPages: number;
    type: EntityType;
    emptyMessage?: string;
    desktopGridClassName?: string;
}

export function SwipeGrid({
    items,
    currentPage,
    totalPages,
    type,
    emptyMessage = "No items found.",
    desktopGridClassName = "hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8 items-start mt-3 h-full",
}: SwipeGridProps) {
    const { pushParams } = useParamLoading()
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();

    // Coordination with EntityCard: when any card enters 3D tilt, pause all scroll/nav logic
    const tiltActiveRef = useRef(false);

    const isNavigatingRef = useRef(false);
    const touchStartYRef = useRef<number | null>(null);
    const targetIndexRef = useRef<number | null>(null);

    const y = useMotionValue(0);
    const topArrowOpacity = useTransform(y, [0, 50], [0, currentPage > 1 ? 1 : 0]);
    const bottomArrowOpacity = useTransform(y, [0, -50], [0, currentPage < totalPages ? 1 : 0]);

    // ── Reset on new items ────────────────────────────────────────────────────
    useEffect(() => {
        isNavigatingRef.current = false;
        animate(y, 0, { duration: 0 });

        if (containerRef.current && items.length > 0) {
            const newIndex = targetIndexRef.current !== null
                ? Math.min(targetIndexRef.current, items.length - 1)
                : 0;
            setActiveIndex(newIndex);
            targetIndexRef.current = null;

            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;
                const cards = container.querySelectorAll<HTMLElement>(".snap-card");
                const target = cards[newIndex];
                if (target) container.scrollTo({ top: target.offsetTop, behavior: "instant" });
            });
        }
    }, [items, y]);

    // ── Page navigation ───────────────────────────────────────────────────────
    const triggerPageChange = useCallback((direction: "next" | "prev") => {
        if (isNavigatingRef.current) return;
        const params = new URLSearchParams(searchParams.toString());

        if (direction === "next" && currentPage < totalPages) {
            isNavigatingRef.current = true;
            targetIndexRef.current = 0;
            params.set("page", String(currentPage + 1));
            pushParams(params);
        } else if (direction === "prev" && currentPage > 1) {
            isNavigatingRef.current = true;
            targetIndexRef.current = items.length - 1;
            params.set("page", String(currentPage - 1));
            pushParams(params);
        }
    }, [currentPage, totalPages, items.length, pushParams, searchParams]);

    // ── Non-passive touchmove — only handles page-change edge swipes ──────────
    // EntityCard handles its own tilt; we only act when NO card is tilting.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onTouchMove = (e: TouchEvent) => {
            // If a card is in 3D tilt mode, do nothing — EntityCard owns the event
            if (tiltActiveRef.current || isNavigatingRef.current) return;
            if (touchStartYRef.current === null) return;

            const deltaY = touchStartYRef.current - e.touches[0].clientY; // + = pulling up

            const isAtTop = activeIndex === 0;
            const isAtBottom = activeIndex === items.length - 1;

            if (isAtTop && deltaY < 0) {
                e.preventDefault(); // block pull-to-refresh
                if (currentPage > 1) {
                    y.set(Math.abs(deltaY));
                    if (Math.abs(deltaY) > 70) triggerPageChange("prev");
                }
            } else if (isAtBottom && deltaY > 0) {
                if (currentPage < totalPages) {
                    e.preventDefault();
                    y.set(-deltaY);
                    if (deltaY > 70) triggerPageChange("next");
                }
            } else {
                y.set(0);
            }
        };

        el.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => el.removeEventListener("touchmove", onTouchMove);
    }, [activeIndex, currentPage, totalPages, items.length, y, triggerPageChange]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        touchStartYRef.current = null;
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerTop = container.scrollTop;
        const cards = Array.from(container.querySelectorAll<HTMLElement>(".snap-card"));

        let closestIndex = 0;
        let minDistance = Infinity;
        cards.forEach((card, i) => {
            const dist = Math.abs(containerTop - card.offsetTop);
            if (dist < minDistance) { minDistance = dist; closestIndex = i; }
        });

        if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
    };

    // ── Tilt coordination callback (passed to every EntityCard) ──────────────
    const handleTiltChange = useCallback((tilting: boolean) => {
        tiltActiveRef.current = tilting;
    }, []);

    // ── URL helpers ───────────────────────────────────────────────────────────
    const getItemHref = (item: any) => {
        switch (type) {
            case "power": return `/powers/${item.id}`;
            case "character": return `/characters/${item.id}`;
            case "team": return `/teams/${item.id}`;
            case "universe": return `/universes/${item.id}`;
            default: return `/${item.id}`;
        }
    };

    // ── Empty state ───────────────────────────────────────────────────────────
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

    // ── Mobile swipe feed ─────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div className="w-full h-[calc(100dvh-150px)] flex flex-col items-center relative select-none">

                {/* Top page-change indicator */}
                <div className="absolute inset-x-0 top-1 flex justify-center items-center pointer-events-none z-30">
                    {currentPage > 1 && (
                        <motion.span style={{ opacity: topArrowOpacity }}
                            className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
                            <ArrowBigLeftIcon className="w-6 h-6 rotate-90 mr-1" /> Prev Page
                        </motion.span>
                    )}
                </div>

                {/* Bottom page-change indicator */}
                <div className="absolute inset-x-0 bottom-1 flex justify-center items-center pointer-events-none z-30">
                    {currentPage < totalPages && (
                        <motion.span style={{ opacity: bottomArrowOpacity }}
                            className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
                            Next Page <ArrowBigRightIcon className="w-6 h-6 rotate-90 ml-1" />
                        </motion.span>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="text-xs text-muted-foreground font-medium my-1 shrink-0">
                        Page {currentPage} of {totalPages}
                    </div>
                )}

                {/* Scroll feed */}
                <div
                    ref={containerRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onScroll={handleScroll}
                    className="w-full h-full flex flex-col gap-5 items-center overflow-x-hidden overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative px-2 py-2"
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="snap-card snap-center snap-always shrink-0 w-full h-full flex flex-col items-center justify-center relative py-1"
                        >
                            <div className="w-full h-full flex items-center justify-center max-w-md mx-auto">
                                <EntityCard
                                    {...getCardProps(item, type)}
                                    onTiltChange={handleTiltChange}
                                    href={getItemHref(item)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Desktop grid ──────────────────────────────────────────────────────────
    return (
        <div className={`${desktopGridClassName} mb-4 overflow-visible`}>
            {items.map((item) => (
                <div key={item.id} className="w-auto h-[25rem] shrink-0 relative">
                    <EntityCard {...getCardProps(item, type)} href={getItemHref(item)} />
                </div>
            ))}
        </div>
    );
}