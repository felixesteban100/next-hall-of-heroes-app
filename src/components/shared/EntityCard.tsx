"use client";

import { ReactNode, useState, useRef, useEffect, useCallback } from "react";
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
    /** Called when the card enters/exits tilt mode so the parent scroll container can pause. */
    onTiltChange?: (tilting: boolean) => void;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const HOLD_MS = 400;   // ms of motionless hold to unlock 3D on mobile
const MOTION_CANCEL = 14;    // px of movement in first 120ms cancels the hold (user is scrolling)
const MAX_TILT = 14;    // degrees

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
    onTiltChange,
}: EntityCardProps) {
    const isMobile = useIsMobile();

    // ── Refs ──────────────────────────────────────────────────────────────────
    const cardRef = useRef<HTMLDivElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdProgress = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
    const movedEarly = useRef(false); // did finger move too much before hold fired?

    // ── State ─────────────────────────────────────────────────────────────────
    const [is3D, setIs3D] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100

    // ── Helpers ───────────────────────────────────────────────────────────────
    const applyTilt = useCallback((clientX: number, clientY: number) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const rx = ((clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -MAX_TILT;
        const ry = ((clientX - rect.left - rect.width / 2) / (rect.width / 2)) * MAX_TILT;
        card.style.transition = "transform 0.08s linear";
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
    }, []);

    const resetTilt = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transition = "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)";
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    }, []);

    const startShine = useCallback(() => {
        const el = shineRef.current;
        if (!el) return;
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "glass-shimmer 1.4s cubic-bezier(0.4,0,0.2,1) infinite";
    }, []);

    const stopShine = useCallback(() => {
        if (shineRef.current) shineRef.current.style.animation = "none";
    }, []);

    const enter3D = useCallback(() => {
        setIs3D(true);
        onTiltChange?.(true);
        setTimeout(startShine, 800);
    }, [onTiltChange, startShine]);

    const exit3D = useCallback(() => {
        setIs3D(false);
        setIsHolding(false);
        setProgress(0);
        stopShine();
        resetTilt();
        onTiltChange?.(false);
    }, [onTiltChange, resetTilt, stopShine]);

    const clearTimers = useCallback(() => {
        if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
        if (holdProgress.current) { clearInterval(holdProgress.current); holdProgress.current = null; }
    }, []);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => () => { clearTimers(); }, [clearTimers]);

    // ── Desktop handlers (instant, mouse-driven) ──────────────────────────────
    const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        enter3D();
        applyTilt(e.clientX, e.clientY);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile || !is3D) return;
        applyTilt(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
        if (isMobile) return;
        exit3D();
    };

    // ── Mobile handlers ───────────────────────────────────────────────────────
    // Strategy:
    //   • Record touch start position + time.
    //   • After HOLD_MS with < MOTION_CANCEL px movement → unlock 3D.
    //   • If the finger moves beyond threshold in the first 120ms → it's a scroll; cancel.
    //   • Once 3D is active, all touchmove events drive the tilt (parent scroll is paused).

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
        movedEarly.current = false;

        setIsHolding(true);
        setProgress(0);

        const startTime = Date.now();
        holdProgress.current = setInterval(() => {
            setProgress(Math.min(((Date.now() - startTime) / HOLD_MS) * 100, 100));
        }, 20);

        holdTimer.current = setTimeout(() => {
            if (!movedEarly.current) {
                clearTimers();
                setIsHolding(false);
                enter3D();
                if (touchStart.current) applyTilt(touchStart.current.x, touchStart.current.y);
            }
        }, HOLD_MS);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;
        const t = e.touches[0];

        if (is3D) {
            // 3D active — drive the tilt directly (SwipeGrid pauses scroll via onTiltChange)
            applyTilt(t.clientX, t.clientY);
            return;
        }

        // Not yet in 3D — check if early movement should cancel the hold
        if (touchStart.current) {
            const dx = Math.abs(t.clientX - touchStart.current.x);
            const dy = Math.abs(t.clientY - touchStart.current.y);
            const elapsed = Date.now() - touchStart.current.t;
            if ((dx > MOTION_CANCEL || dy > MOTION_CANCEL) && elapsed < 180) {
                // Finger moved early → this is a scroll gesture, abort hold
                movedEarly.current = true;
                clearTimers();
                setIsHolding(false);
                setProgress(0);
            }
        }
    };

    const onTouchEnd = () => {
        if (!isMobile) return;
        clearTimers();
        touchStart.current = null;
        if (is3D) {
            exit3D();
        } else {
            setIsHolding(false);
            setProgress(0);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const cardSizeClass = isMobile ? "h-[90%] w-[90%] mx-auto mt-10" : "h-full w-full";

    const typePage = transitionKey.split("-")[0]

    console.log(typePage)

    return (
        <div style={{ perspective: "1000px" }} className="h-full w-full relative">

            {/* Mobile status badge — holding countdown or 3D unlocked */}
            {isMobile && (isHolding || is3D) && (
                <div className="absolute inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
                    <div className="bg-background/90 text-foreground border border-border px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
                        {isHolding ? (
                            <>
                                {/* Arc progress ring */}
                                <svg className="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 36 36">
                                    <circle className="text-muted stroke-current" strokeWidth="4" fill="none"
                                        cx="18" cy="18" r="15.9" />
                                    <circle className="text-primary stroke-current transition-all duration-75"
                                        strokeDasharray={`${progress}, 100`}
                                        strokeWidth="4" strokeLinecap="round" fill="none"
                                        cx="18" cy="18" r="15.9" />
                                </svg>
                                <span className="text-muted-foreground">Hold for 3D…</span>
                            </>
                        ) : (
                            <>
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                                <span className="text-primary font-black uppercase tracking-wider text-[11px]">3D — drag to tilt</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Card
                ref={cardRef}
                className={`group ${cardSizeClass} flex flex-col justify-between pt-0  shadow-none hover:shadow-2xl select-none [-webkit-touch-callout:none]`}
                style={{ transformStyle: "preserve-3d" }}
                onContextMenu={e => e.preventDefault()}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {imageFocus !== undefined ? (
                    <div className="relative aspect-4/4 bg-muted/20 overflow-hidden flex items-center justify-center h-full"
                        style={{ transform: "translateZ(30px)" }}>
                        <ViewTransition name={transitionKey} share="morph">
                            <CharacterImage
                                src={image} alt={title}
                                imageFocus={imageFocus ?? null}
                                width={400} height={500}
                                className={`relative z-10 object-contain h-full w-full duration-700 transition-transform pointer-events-none ${is3D ? "scale-110" : "group-hover:scale-110"}`}
                            />
                        </ViewTransition>
                        {is3D && <ShineEffect shineRef={shineRef} />}
                    </div>
                ) : (
                    <div className="relative aspect-square bg-transparent  flex items-center justify-center"
                        style={{ transform: "translateZ(30px)" }}>
                        <ViewTransition name={transitionKey} share="morph">
                            <Image
                                src={background ? background : image}
                                alt="background blur"
                                /* ${is3D || !background ? "" : "group-hover:opacity-0"} */
                                // ${typePage == "team" ? "object-contain" : "object-cover group-hover:opacity-0"}
                                className={`absolute inset-0 m-auto ${typePage == "team" /* || !background */ ? "object-contain" : `object-cover ${typePage != "power" ? "group-hover:blur-none" : ""} `} blur-sm w-full h-full pointer-events-none transition-all duration-500 opacity-100 `}
                                width={200} height={200} unoptimized
                            />
                            <Image
                                src={image} alt={title}
                                className={`overflow-visible absolute z-10 object-contain ${typePage == "universe" ? "max-h-[70%] w-[80%] animate-bright-gold" : "h-full w-full"} duration-1000 transition-all pointer-events-none ${typePage != "team" && (is3D ? "scale-110" : "group-hover:scale-110")} ${background && is3D ? "opacity-0" : background ? "opacity-100 group-hover:opacity-0" : ""}`}
                                width={800} height={1200} unoptimized />
                        </ViewTransition>
                        {is3D && <ShineEffect shineRef={shineRef} />}
                    </div>
                )}

                <CardContent className="bg-card py-5" style={{ transform: "translateZ(20px)" }}>
                    <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-4 shrink-0">
                        <CardTitle className="text-base font-bold truncate" title={title}>{title}</CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                            {badge}
                            <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">#{id}</span>
                        </div>
                    </CardHeader>
                    <CardDescription className="flex flex-row justify-between items-center gap-2 w-full px-5 py-1 shrink-0">
                        <p className={`${!universeLogo && "min-h-12.5"} line-clamp-3 text-xs text-muted-foreground font-light max-w-[70%]`}>
                            {description || "No description available."}
                        </p>
                        {universeLogo && (
                            <div className="h-6 w-14">
                                <Image src={universeLogo} alt={`${title} publisher logo`}
                                    width={125} height={60} unoptimized
                                    className="h-full w-full object-contain pointer-events-none" />
                            </div>
                        )}
                    </CardDescription>
                </CardContent>

                <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-2"
                    style={{ transform: "translateZ(10px)" }}>
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