"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingLink } from "@/components/shared/LoadingLink";
import { ArrowBigLeftIcon, ArrowBigRightIcon, BrushCleaning } from "lucide-react";
import { useSyncExternalStore } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

import { EntityCard } from "./EntityCard";
import { getCardProps } from "./getCardProps";

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
    desktopGridClassName = "hidden sm:grid sm:grid-cols-2 md:grid-cols-3  gap-8 items-start mt-3",
}: SwipeGridProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isInspecting, setIsInspecting] = useState(false); // 🌟 Tracks 3D card inspection state
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isNavigatingRef = useRef(false);
    const touchStartXRef = useRef<number | null>(null);
    const touchStartYRef = useRef<number | null>(null);
    const targetIndexRef = useRef<number | null>(null);

    const y = useMotionValue(0);
    const topArrowOpacity = useTransform(y, [0, 50], [0, currentPage > 1 ? 1 : 0]);
    const bottomArrowOpacity = useTransform(y, [0, -50], [0, currentPage < totalPages ? 1 : 0]);

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
                const targetCard = cards[newIndex];

                if (targetCard) {
                    container.scrollTo({
                        top: targetCard.offsetTop,
                        behavior: "instant"
                    });
                }
            });
        }
    }, [items, y]);

    const triggerPageChange = (direction: "next" | "prev") => {
        if (isNavigatingRef.current) return;
        const params = new URLSearchParams(searchParams.toString());

        if (direction === "next" && currentPage < totalPages) {
            isNavigatingRef.current = true;
            targetIndexRef.current = 0;
            params.set("page", (currentPage + 1).toString());
            router.push(`?${params.toString()}`);
        } else if (direction === "prev" && currentPage > 1) {
            isNavigatingRef.current = true;
            targetIndexRef.current = items.length - 1;
            params.set("page", (currentPage - 1).toString());
            router.push(`?${params.toString()}`);
        }
    };

    // Native non-passive touch move handler with 3D tilt gesture detection & swipe lock
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onTouchMove = (e: TouchEvent) => {
            if (touchStartYRef.current === null || touchStartXRef.current === null || isNavigatingRef.current) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;

            const deltaX = currentX - touchStartXRef.current;
            const deltaY = touchStartYRef.current - currentY; // positive = pulling up, negative = pulling down

            // 🌟 If user moves finger across the card, activate 3D inspection mode
            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 12) {
                setIsInspecting(true);
            }

            // 🌟 While 3D inspecting, completely disable scroll and page swipe navigation
            if (isInspecting) {
                e.preventDefault();
                y.set(0);
                return;
            }

            const isAtTopCard = activeIndex === 0;
            const isAtBottomCard = activeIndex === items.length - 1;

            if (isAtTopCard && deltaY < 0) {
                if (currentPage > 1) {
                    e.preventDefault();
                    y.set(Math.abs(deltaY)); // Drive top arrow opacity
                    if (Math.abs(deltaY) > 70) {
                        triggerPageChange("prev");
                    }
                } else {
                    // Block pull-to-refresh on page 1 top
                    e.preventDefault();
                }
            } else if (isAtBottomCard && deltaY > 0) {
                if (currentPage < totalPages) {
                    e.preventDefault();
                    y.set(-deltaY); // Drive bottom arrow opacity
                    if (deltaY > 70) {
                        triggerPageChange("next");
                    }
                }
            } else {
                y.set(0);
            }
        };

        el.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            el.removeEventListener("touchmove", onTouchMove);
        };
    }, [activeIndex, currentPage, totalPages, items.length, y, isInspecting]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        setIsInspecting(false); // 🌟 Re-enable swipe navigation & scrolling when touch ends
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerTop = container.scrollTop;
        const cards = Array.from(container.querySelectorAll<HTMLElement>(".snap-card"));

        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const cardTop = card.offsetTop;
            const distance = Math.abs(containerTop - cardTop);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
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
        return (
            <div className="w-full h-[calc(100dvh-150px)] flex flex-col items-center relative select-none">

                {/* Top Edge Arrow Indicator */}
                <div className="absolute inset-x-0 top-1 flex justify-center items-center pointer-events-none z-30">
                    {currentPage > 1 ? (
                        <motion.span style={{ opacity: topArrowOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
                            <ArrowBigLeftIcon className="w-6 h-6 rotate-90 mr-1" /> Prev Page
                        </motion.span>
                    ) : null}
                </div>

                {/* Bottom Edge Arrow Indicator */}
                <div className="absolute inset-x-0 bottom-1 flex justify-center items-center pointer-events-none z-30">
                    {currentPage < totalPages ? (
                        <motion.span style={{ opacity: bottomArrowOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
                            Next Page <ArrowBigRightIcon className="w-6 h-6 rotate-90 ml-1" />
                        </motion.span>
                    ) : null}
                </div>

                {/* 🌟 3D Hologram Inspection State Status Badge */}
                {/* {isInspecting && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute top-10 z-40 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 pointer-events-none"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        3D Hologram Inspecting
                    </motion.div>
                )} */}

                {totalPages > 1 && <div className="text-xs text-muted-foreground font-medium my-1 shrink-0">
                    Page {currentPage} of {totalPages}
                </div>}

                {/* Main Vertical Feed Container */}
                <div
                    ref={containerRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onScroll={handleScroll}
                    className={`w-full h-full flex flex-col gap-5 items-center ${isInspecting ? "overflow-hidden" : "overflow-x-hidden overflow-y-auto"
                        } snap-y snap-mandatory scroll-smooth overscroll-behavior-y-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative px-2 py-2`}
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="snap-card snap-center snap-always shrink-0 w-full h-full flex flex-col items-center justify-center relative py-1"
                        >
                            <div className="w-full h-full flex items-center justify-center max-w-md mx-auto">
                                <LoadingLink href={getItemHref(item)} className="w-full h-full flex items-center justify-center pointer-events-auto">
                                    <EntityCard {...getCardProps(item, type)} />
                                </LoadingLink>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`${desktopGridClassName} mb-4 `}>
            {items.map((item) => (
                <LoadingLink key={item.id} href={getItemHref(item)}>
                    <EntityCard {...getCardProps(item, type)} />
                </LoadingLink>
            ))}
        </div>
    );
}





// "use client"

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { LoadingLink } from "@/components/shared/LoadingLink";
// import { ArrowBigLeftIcon, ArrowBigRightIcon, BrushCleaning } from "lucide-react";
// import { useSyncExternalStore } from "react";
// import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// import { EntityCard } from "./EntityCard";
// import { getCardProps } from "./getCardProps";

// export function useIsMobile() {
//     return useSyncExternalStore(
//         (callback) => {
//             window.addEventListener("resize", callback);
//             return () => window.removeEventListener("resize", callback);
//         },
//         () => window.innerWidth < 640,
//         () => false
//     );
// }

// export type EntityType = "power" | "character" | "team" | "universe"

// interface SwipeGridProps {
//     items: any[];
//     currentPage: number;
//     totalPages: number;
//     type: EntityType;
//     emptyMessage?: string;
//     desktopGridClassName?: string;
// }

// export function SwipeGrid({
//     items,
//     currentPage,
//     totalPages,
//     type,
//     emptyMessage = "No items found.",
//     desktopGridClassName = "hidden sm:grid sm:grid-cols-2 md:grid-cols-3  gap-8 items-start mt-3",
// }: SwipeGridProps) {
//     const [activeIndex, setActiveIndex] = useState(0);
//     const [isInspecting, setIsInspecting] = useState(false); // 🌟 Tracks 3D card inspection state
//     const containerRef = useRef<HTMLDivElement>(null);
//     const isMobile = useIsMobile();
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     const isNavigatingRef = useRef(false);
//     const touchStartXRef = useRef<number | null>(null);
//     const touchStartYRef = useRef<number | null>(null);
//     const targetIndexRef = useRef<number | null>(null);

//     const y = useMotionValue(0);
//     const topArrowOpacity = useTransform(y, [0, 50], [0, currentPage > 1 ? 1 : 0]);
//     const bottomArrowOpacity = useTransform(y, [0, -50], [0, currentPage < totalPages ? 1 : 0]);

//     useEffect(() => {
//         isNavigatingRef.current = false;
//         animate(y, 0, { duration: 0 });

//         if (containerRef.current && items.length > 0) {
//             const newIndex = targetIndexRef.current !== null
//                 ? Math.min(targetIndexRef.current, items.length - 1)
//                 : 0;

//             setActiveIndex(newIndex);
//             targetIndexRef.current = null;

//             requestAnimationFrame(() => {
//                 const container = containerRef.current;
//                 if (!container) return;
//                 const cards = container.querySelectorAll<HTMLElement>(".snap-card");
//                 const targetCard = cards[newIndex];

//                 if (targetCard) {
//                     container.scrollTo({
//                         top: targetCard.offsetTop,
//                         behavior: "instant"
//                     });
//                 }
//             });
//         }
//     }, [items, y]);

//     const triggerPageChange = (direction: "next" | "prev") => {
//         if (isNavigatingRef.current) return;
//         const params = new URLSearchParams(searchParams.toString());

//         if (direction === "next" && currentPage < totalPages) {
//             isNavigatingRef.current = true;
//             targetIndexRef.current = 0;
//             params.set("page", (currentPage + 1).toString());
//             router.push(`?${params.toString()}`);
//         } else if (direction === "prev" && currentPage > 1) {
//             isNavigatingRef.current = true;
//             targetIndexRef.current = items.length - 1;
//             params.set("page", (currentPage - 1).toString());
//             router.push(`?${params.toString()}`);
//         }
//     };

//     // Native non-passive touch move handler with 3D tilt gesture detection & swipe lock
//     useEffect(() => {
//         const el = containerRef.current;
//         if (!el) return;

//         const onTouchMove = (e: TouchEvent) => {
//             if (touchStartYRef.current === null || touchStartXRef.current === null || isNavigatingRef.current) return;
//             const currentX = e.touches[0].clientX;
//             const currentY = e.touches[0].clientY;

//             const deltaX = currentX - touchStartXRef.current;
//             const deltaY = touchStartYRef.current - currentY; // positive = pulling up, negative = pulling down

//             // 🌟 If user moves finger across the card, activate 3D inspection mode
//             if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 12) {
//                 setIsInspecting(true);
//             }

//             // 🌟 While 3D inspecting, completely disable scroll and page swipe navigation
//             if (isInspecting) {
//                 e.preventDefault();
//                 y.set(0);
//                 return;
//             }

//             const isAtTopCard = activeIndex === 0;
//             const isAtBottomCard = activeIndex === items.length - 1;

//             if (isAtTopCard && deltaY < 0) {
//                 if (currentPage > 1) {
//                     e.preventDefault();
//                     y.set(Math.abs(deltaY)); // Drive top arrow opacity
//                     if (Math.abs(deltaY) > 70) {
//                         triggerPageChange("prev");
//                     }
//                 } else {
//                     // Block pull-to-refresh on page 1 top
//                     e.preventDefault();
//                 }
//             } else if (isAtBottomCard && deltaY > 0) {
//                 if (currentPage < totalPages) {
//                     e.preventDefault();
//                     y.set(-deltaY); // Drive bottom arrow opacity
//                     if (deltaY > 70) {
//                         triggerPageChange("next");
//                     }
//                 }
//             } else {
//                 y.set(0);
//             }
//         };

//         el.addEventListener("touchmove", onTouchMove, { passive: false });
//         return () => {
//             el.removeEventListener("touchmove", onTouchMove);
//         };
//     }, [activeIndex, currentPage, totalPages, items.length, y, isInspecting]);

//     const handleTouchStart = (e: React.TouchEvent) => {
//         touchStartXRef.current = e.touches[0].clientX;
//         touchStartYRef.current = e.touches[0].clientY;
//     };

//     const handleTouchEnd = () => {
//         touchStartXRef.current = null;
//         touchStartYRef.current = null;
//         setIsInspecting(false); // 🌟 Re-enable swipe navigation & scrolling when touch ends
//         animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
//     };

//     const handleScroll = () => {
//         const container = containerRef.current;
//         if (!container) return;

//         const containerTop = container.scrollTop;
//         const cards = Array.from(container.querySelectorAll<HTMLElement>(".snap-card"));

//         let closestIndex = 0;
//         let minDistance = Infinity;

//         cards.forEach((card, index) => {
//             const cardTop = card.offsetTop;
//             const distance = Math.abs(containerTop - cardTop);
//             if (distance < minDistance) {
//                 minDistance = distance;
//                 closestIndex = index;
//             }
//         });

//         if (closestIndex !== activeIndex) {
//             setActiveIndex(closestIndex);
//         }
//     };

//     const getItemHref = (item: any) => {
//         switch (type) {
//             case "power": return `/powers/${item.id}`;
//             case "character": return `/characters/${item.id}`;
//             case "team": return `/teams/${item.id}`;
//             case "universe": return `/universes/${item.id}`;
//             default: return `/${item.id}`;
//         }
//     };

//     if (items.length === 0) {
//         return (
//             <div className="col-span-full text-center text-muted-foreground font-bold mt-5">
//                 <div className="flex flex-col items-center justify-center gap-2">
//                     <BrushCleaning />
//                     {emptyMessage}
//                 </div>
//             </div>
//         );
//     }

//     if (isMobile) {
//         return (
//             <div className="w-full h-[calc(100dvh-150px)] flex flex-col items-center relative select-none">

//                 {/* Top Edge Arrow Indicator */}
//                 <div className="absolute inset-x-0 top-1 flex justify-center items-center pointer-events-none z-30">
//                     {currentPage > 1 ? (
//                         <motion.span style={{ opacity: topArrowOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
//                             <ArrowBigLeftIcon className="w-6 h-6 rotate-90 mr-1" /> Prev Page
//                         </motion.span>
//                     ) : null}
//                 </div>

//                 {/* Bottom Edge Arrow Indicator */}
//                 <div className="absolute inset-x-0 bottom-1 flex justify-center items-center pointer-events-none z-30">
//                     {currentPage < totalPages ? (
//                         <motion.span style={{ opacity: bottomArrowOpacity }} className="font-black tracking-wider uppercase text-primary flex items-center bg-background/80 px-3 py-1 rounded-full shadow">
//                             Next Page <ArrowBigRightIcon className="w-6 h-6 rotate-90 ml-1" />
//                         </motion.span>
//                     ) : null}
//                 </div>

//                 {/* 🌟 3D Hologram Inspection State Status Badge */}
//                 {isInspecting && (
//                     <motion.div
//                         initial={{ opacity: 0, y: -8, scale: 0.95 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: -8, scale: 0.95 }}
//                         className="absolute top-10 z-40 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 pointer-events-none"
//                     >
//                         <span className="relative flex h-2 w-2">
//                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
//                             <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
//                         </span>
//                         3D Hologram Inspecting
//                     </motion.div>
//                 )}

//                 {totalPages > 1 && <div className="text-xs text-muted-foreground font-medium my-1 shrink-0">
//                     Page {currentPage} of {totalPages}
//                 </div>}

//                 {/* Main Vertical Feed Container */}
//                 <div
//                     ref={containerRef}
//                     onTouchStart={handleTouchStart}
//                     onTouchEnd={handleTouchEnd}
//                     onScroll={handleScroll}
//                     className={`w-full h-full flex flex-col gap-5 items-center ${isInspecting ? "overflow-hidden" : "overflow-x-hidden overflow-y-auto"
//                         } snap-y snap-mandatory scroll-smooth overscroll-behavior-y-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative px-2 py-2`}
//                 >
//                     {items.map((item) => (
//                         <div
//                             key={item.id}
//                             className="snap-card snap-center snap-always shrink-0 w-full h-full flex flex-col items-center justify-center relative py-1"
//                         >
//                             <div className="w-full h-full flex items-center justify-center max-w-md mx-auto">
//                                 <LoadingLink href={getItemHref(item)} className="w-full h-full flex items-center justify-center pointer-events-auto">
//                                     <EntityCard {...getCardProps(item, type)} />
//                                 </LoadingLink>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={`${desktopGridClassName} mb-4 `}>
//             {items.map((item) => (
//                 <LoadingLink key={item.id} href={getItemHref(item)}>
//                     <EntityCard {...getCardProps(item, type)} />
//                 </LoadingLink>
//             ))}
//         </div>
//     );
// }