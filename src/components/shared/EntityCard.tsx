"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { ViewTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterImage } from "@/components/shared/CharacterImage";
import Image from "next/image";
import { useIsMobile } from "./SwipeGrid";

export type StatColumn = {
    icon: React.ElementType;
    text: string;
    colorClass?: string;
    title?: string;
};

type EntityCardProps = {
    title: string;
    id: number | string;
    image: string;
    universeLogo?: string;
    background?: string;
    imageFocus?: string;
    description?: string;
    transitionKey: string;
    badge?: ReactNode;
    stats: StatColumn[];
};

export function EntityCard({
    title,
    id,
    image,
    universeLogo,
    background,
    imageFocus,
    description,
    transitionKey,
    badge,
    stats,
}: EntityCardProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [is3DActive, setIs3DActive] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const shineDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastCoordsRef = useRef<{ clientX: number; clientY: number } | null>(null);
    const isMobile = useIsMobile();

    const HOLD_DURATION = 3000; // 3 Seconds for mobile hold

    // 🌟 Infinite Glass Shimmer Animation Trigger
    const triggerShine = () => {
        if (shineRef.current) {
            shineRef.current.style.animation = "none";
            void shineRef.current.offsetHeight;
            shineRef.current.style.animation = "glass-shimmer 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite";
        }
    };

    const stopShine = () => {
        if (shineRef.current) {
            shineRef.current.style.animation = "none";
        }
    };

    // Trigger shine with a delay AFTER 3D effect becomes active, running infinitely
    useEffect(() => {
        if (is3DActive) {
            if (shineDelayTimerRef.current) clearTimeout(shineDelayTimerRef.current);
            shineDelayTimerRef.current = setTimeout(() => {
                triggerShine();
            }, 1000); // 1 second delay after 3D activation
        } else {
            if (shineDelayTimerRef.current) clearTimeout(shineDelayTimerRef.current);
            stopShine();
        }
        return () => {
            if (shineDelayTimerRef.current) clearTimeout(shineDelayTimerRef.current);
        };
    }, [is3DActive]);

    const applyTilt = (clientX: number, clientY: number) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    // Desktop Mouse Handlers (Instant 3D activation)
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        setIsPressed(true);
        setIs3DActive(true);
        applyTilt(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        lastCoordsRef.current = { clientX, clientY };

        if (!isMobile || is3DActive) {
            applyTilt(clientX, clientY);
        }
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        handleEnd();
    };

    // Mobile Touch Handlers (3-second countdown hold)
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;
        setIsPressed(true);

        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        lastCoordsRef.current = { clientX, clientY };

        clearHoldTimers();
        setIsHolding(true);
        setHoldProgress(0);

        const startTime = Date.now();

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);
        }, 30);

        timerRef.current = setTimeout(() => {
            setIs3DActive(true);
            setIsHolding(false);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (lastCoordsRef.current) {
                applyTilt(lastCoordsRef.current.clientX, lastCoordsRef.current.clientY);
            }
        }, HOLD_DURATION);
    };

    const handleTouchEnd = () => {
        if (!isMobile) return;
        handleEnd();
    };

    const clearHoldTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (shineDelayTimerRef.current) clearTimeout(shineDelayTimerRef.current);
        timerRef.current = null;
        progressIntervalRef.current = null;
        shineDelayTimerRef.current = null;
    };

    const handleEnd = () => {
        clearHoldTimers();
        stopShine();
        setIsPressed(false);
        setIs3DActive(false);
        setIsHolding(false);
        setHoldProgress(0);
        lastCoordsRef.current = null;

        const card = cardRef.current;
        if (card) {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };

    const secondsRemaining = Math.max(1, Math.ceil(3 - (holdProgress / 100) * 3));

    return (
        <div style={{ perspective: "1000px" }} className="h-full w-full relative">

            {/* Mobile-Only Holding Countdown / Unlocked Status Badge */}
            {isMobile && (isHolding || is3DActive) && (
                <div className="absolute  inset-x-0 z-40 flex justify-center pointer-events-none">
                    <div className="bg-background/90 text-foreground border border-border px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {isHolding ? (
                            <>
                                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-muted stroke-current"
                                        strokeWidth="4"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-primary stroke-current transition-all duration-75"
                                        strokeDasharray={`${holdProgress}, 100`}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span>Hold for 3D ({secondsRemaining}s)</span>
                            </>
                        ) : (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-primary font-black uppercase tracking-wider text-[11px]">3D Hologram Unlocked</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Card
                ref={cardRef}
                className={`group ${!isMobile ? " h-full w-full" : "h-[90%] w-[90%] mx-auto mt-10"} flex flex-col justify-between transition-transform duration-150 ease-out pt-0 overflow-hidden shadow-none hover:shadow-2xl select-none [-webkit-touch-callout:none]`}
                style={{ transformStyle: "preserve-3d" }}
                onContextMenu={(e) => e.preventDefault()}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {imageFocus !== undefined ? (
                    <div className={`relative aspect-4/4 bg-muted/20 overflow-hidden flex items-center justify-center h-full`} style={{ transform: "translateZ(30px)" }}>
                        <ViewTransition name={transitionKey} share="morph">
                            <CharacterImage
                                src={image}
                                alt={title}
                                imageFocus={imageFocus ?? null}
                                width={400}
                                height={500}
                                className={`relative z-10 object-contain h-full w-full duration-1000 transition-all pointer-events-none ${isPressed ? "scale-110" : "group-hover:scale-110"}`}
                            />
                        </ViewTransition>
                        <ShineEffect shineRef={shineRef} />
                    </div>
                ) : (
                    <div className={`relative aspect-8/16 lg:aspect-square bg-transparent overflow-hidden flex items-center justify-center`} style={{ transform: "translateZ(30px)" }}>
                        <ViewTransition name={transitionKey} share="morph">
                            {background && (
                                <Image
                                    src={background}
                                    alt="background"
                                    className={`absolute opacity-0 group-hover:opacity-100 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${background && isPressed ? "opacity-100" : background && ""}`}
                                    width={800}
                                    height={1200}
                                    unoptimized
                                />
                            )}

                            <Image
                                src={background ? background : image}
                                alt="background blur"
                                className={`absolute inset-0 m-auto blur-sm w-full h-full object-cover pointer-events-none transition-all ${background && isPressed ? "opacity-0" : background && "group-hover:opacity-0"}`}
                                width={200}
                                height={200}
                                unoptimized
                            />

                            {/* Foreground main image */}
                            <Image
                                src={image}
                                alt={title}
                                className={`relative z-10 object-contain h-full w-full duration-1000 transition-all pointer-events-none ${isPressed ? "scale-110" : "group-hover:scale-110"
                                    } ${background && isPressed ? "opacity-0" : background && "group-hover:opacity-0"}`}
                                width={800}
                                height={1200}
                                unoptimized
                            />
                        </ViewTransition>
                        <ShineEffect shineRef={shineRef} />
                    </div>
                )}

                <CardContent className="bg-card py-5" style={{ transform: "translateZ(20px)" }}>
                    {/* Header: Title & ID / Badge */}
                    <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-4 shrink-0">
                        <CardTitle className="text-base font-bold truncate" title={title}>
                            {title}
                        </CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                            {badge}
                            <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                                #{id}
                            </span>
                        </div>
                    </CardHeader>

                    {/* Description */}
                    <CardDescription className="flex flex-row justify-between items-center gap-2 w-full px-5 py-1 shrink-0">
                        <p className={`${!universeLogo && "min-h-12.5"} line-clamp-3 text-xs text-muted-foreground font-light max-w-[70%]`} role="region">{description || "No description available."}</p>
                        {universeLogo && <div className="h-6 w-14">
                            <Image
                                src={universeLogo}
                                alt={`${title} publisher logo`}
                                width={125}
                                height={60}
                                unoptimized
                                className="h-full w-full object-contain pointer-events-none"
                            />
                        </div>}
                    </CardDescription>
                </CardContent>

                {/* Footer Stats Grid */}
                <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-2" style={{ transform: "translateZ(10px)" }}>
                    <div className={`grid grid-cols-${stats.length} w-full divide-x divide-foreground/50 text-center text-xs`}>
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="flex flex-col items-center justify-center gap-0.5 py-1" title={stat.title}>
                                    <Icon className={`w-3.5 h-3.5 ${stat.colorClass || "text-muted-foreground"}`} />
                                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[70px] capitalize">
                                        {stat.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

function ShineEffect({ shineRef }: { shineRef: React.RefObject<HTMLDivElement | null> }) {
    return (
        <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none">
            <div
                ref={shineRef}
                className="absolute -top-10 -bottom-10 w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0"
                style={{ willChange: "transform, opacity" }}
            />
        </div>
    );
}