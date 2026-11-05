"use client";

import { ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { ViewTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterImage } from "@/components/shared/CharacterImage";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { useIsMobile } from "./SwipeGrid";
import { LoadingLink } from "./LoadingLink";

export type StatColumn = {
    icon: React.ElementType;
    text: string;
    colorClass?: string;
    title?: string;
};

export type BackData = {
    kind: "character" | "team" | "power" | "universe";
    entityName: string;
    logo: string;
    cardBackgroundColor: string
    cardBorderColor: string,
    glowShadowColor: string,
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
    backData?: BackData;
    onTiltChange?: (tilting: boolean) => void;
    href: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const HOLD_MS = 500;
const STILL_PX = 10;
const MAX_TILT = 14;
// const DTAP_MS = 280;

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
    backData,
    onTiltChange,
    href
}: EntityCardProps) {
    const isMobile = useIsMobile();

    // ── Refs ──────────────────────────────────────────────────────────────────
    const tiltRef = useRef<HTMLDivElement>(null);  // the element that gets tilt transform
    const shineRef = useRef<HTMLDivElement>(null);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressInt = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    // ── State ─────────────────────────────────────────────────────────────────
    const [is3D, setIs3D] = useState(false);
    const [flipAngle, setFlipAngle] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMoving, setIsMoving] = useState(false);

    // If the angle is an odd multiple of 180 (180, -180, 540...), it's showing the back face.
    const isFlipped = Math.abs(Math.round(flipAngle / 180)) % 2 === 1;

    const flipAngleRef = useRef(0);
    useEffect(() => { flipAngleRef.current = flipAngle; }, [flipAngle]);

    const isFlippedRef = useRef(false);
    useEffect(() => { isFlippedRef.current = isFlipped; }, [isFlipped]);

    // ── Random Left/Right Flip Function ───────────────────────────────────────
    const toggleFlip = useCallback(() => {
        // if (is3D || isHolding) return;
        // 🌟 Randomly choose whether to spin left (-1) or right (+1)
        const el = tiltRef.current;
        if (el) el.style.transition = "transform 0.5s linear";

        const direction = Math.random() < 0.5 ? 1 : -1;
        setFlipAngle(prev => prev + (180 * direction));
    }, [is3D, isHolding]);

    // ── Tilt helpers — operate on tiltRef, NOT on the flip wrapper ────────────
    // The tilt element sits INSIDE the flip wrapper, so its own transform
    // only needs rotateX/rotateY for tilt (flip is handled by parent).
    const applyTilt = useCallback((clientX: number, clientY: number) => {
        const el = tiltRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const rx = ((clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -MAX_TILT;

        const isBack = Math.abs(Math.round(flipAngleRef.current / 180)) % 2 === 1;
        const ry = (((clientX - rect.left - rect.width / 2) / (rect.width / 2)) * MAX_TILT) * (isBack ? -1 : 1);

        el.style.transition = "transform 0.08s linear";
        el.style.transform = `perspective(1000px) rotateY(${flipAngleRef.current}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;

        // 🌟 Fixed coordinate math using untransformed element dimensions
        if (shineRef.current) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const offsetX = clientX - centerX;
            const offsetY = clientY - centerY;

            // Use offsetWidth/offsetHeight so 3D transforms don't distort the scale
            const xPercent = 50 + (offsetX / el.offsetWidth) * 100;
            const yPercent = 50 + (offsetY / el.offsetHeight) * 100;

            shineRef.current.style.setProperty('--x', `${xPercent}%`);
            shineRef.current.style.setProperty('--y', `${yPercent}%`);
            shineRef.current.style.opacity = "1";
        }
    }, []);

    const resetTilt = useCallback(() => {
        const el = tiltRef.current;
        if (!el) return;
        el.style.transition = "transform 1.0s cubic-bezier(0.4,0,0.2,1)";
        el.style.transform = `perspective(1000px) rotateY(${flipAngleRef.current}deg) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    }, []);

    const startShine = useCallback(() => {
        const el = shineRef.current;
        if (!el) return;
        el.style.animation = "none";
        void el.offsetHeight;
        // el.style.animation = "glass-shimmer 1.4s cubic-bezier(0.4,0,0.2,1) infinite";
    }, []);

    const stopShine = useCallback(() => {
        if (shineRef.current) {
            shineRef.current.style.opacity = "0";
        }
    }, []);

    const enter3D = useCallback((x: number, y: number) => {
        setIs3D(true);
        setIsHolding(false);
        setIsMoving(false);
        setProgress(0);
        onTiltChange?.(true);
        applyTilt(x, y);
        setTimeout(startShine, 700);
    }, [onTiltChange, applyTilt, startShine]);

    const exit3D = useCallback(() => {
        setIs3D(false);
        setIsHolding(false);
        setIsMoving(false);
        setProgress(0);
        stopShine();
        resetTilt();
        onTiltChange?.(false);
    }, [onTiltChange, resetTilt, stopShine]);

    const clearTimers = useCallback(() => {
        if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
        if (progressInt.current) { clearInterval(progressInt.current); progressInt.current = null; }
    }, []);

    const cancelHold = useCallback(() => {
        clearTimers();
        setIsHolding(false);
        setIsMoving(false);
        setProgress(0);
        touchStart.current = null;
        lastPos.current = null;
    }, [clearTimers]);

    useEffect(() => () => { clearTimers(); }, [clearTimers]);

    // ── Desktop mouse handlers ────────────────────────────────────────────────
    const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        setIs3D(true);
        onTiltChange?.(true);
        applyTilt(e.clientX, e.clientY);
        setTimeout(startShine, 700);
    };
    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // if (!isMobile) return;
        if (/* isMobile ||  */!is3D) return;
        applyTilt(e.clientX, e.clientY);
    };
    const onMouseLeave = () => {
        if (isMobile) return;
        exit3D();
    };

    // ── Mobile touch handlers ─────────────────────────────────────────────────
    const startCountdown = useCallback((x: number, y: number) => {
        clearTimers();
        touchStart.current = { x, y };
        lastPos.current = { x, y };
        setProgress(0);

        const startTime = Date.now();
        progressInt.current = setInterval(() => {
            setProgress(Math.min(((Date.now() - startTime) / HOLD_MS) * 100, 100));
        }, 16);

        holdTimer.current = setTimeout(() => {
            const start = touchStart.current;
            const last = lastPos.current;
            if (!start || !last) return;
            const dx = Math.abs(last.x - start.x);
            const dy = Math.abs(last.y - start.y);
            if (dx <= STILL_PX && dy <= STILL_PX) {
                enter3D(last.x, last.y);
            } else {
                cancelHold();
            }
        }, HOLD_MS);
    }, [clearTimers, enter3D, cancelHold]);

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile || is3D) return;
        const t = e.touches[0];
        setIsHolding(true);
        startCountdown(t.clientX, t.clientY);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;
        const t = e.touches[0];
        if (is3D) { applyTilt(t.clientX, t.clientY); return; }
        if (!touchStart.current) return;
        lastPos.current = { x: t.clientX, y: t.clientY };
        const dx = Math.abs(t.clientX - touchStart.current.x);
        const dy = Math.abs(t.clientY - touchStart.current.y);
        if (dx > STILL_PX || dy > STILL_PX) {
            setIsMoving(true);
            startCountdown(t.clientX, t.clientY);
        } else {
            setIsMoving(false);
        }
    };

    const onTouchEnd = () => {
        if (!isMobile) return;
        if (is3D) { exit3D(); } else { cancelHold(); }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const typePage = transitionKey.split("-")[0];

    const cardSize = isMobile ? "w-[90%] h-[90%]" : "h-full w-full"

    return (
        /*
         * Outer shell — provides the perspective + stable height.
         * Does NOT receive any transform itself.
         */
        <div className="h-full w-full relative flex justify-center items-center">
            {/* ── Mobile status badge ── */}
            {isMobile && (isHolding || is3D) && (
                <div className="absolute inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
                    <div className={`
                        bg-background/90 border px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md
                        flex items-center gap-2 text-xs font-bold
                        animate-in fade-in slide-in-from-top-2 duration-200 transition-colors
                        ${isMoving ? "border-orange-400/60 text-orange-400"
                            : is3D ? "border-primary/60 text-primary"
                                : "border-border text-foreground"}
                    `}>
                        {is3D ? (
                            <>
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                                </span>
                                <span className="font-black uppercase tracking-wider text-[11px]">3D — drag to tilt</span>
                            </>
                        ) : isMoving ? (
                            <>
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <span className="text-[11px]">Keep still to activate 3D</span>
                                <svg className="w-4 h-4 -rotate-90 shrink-0 opacity-60" viewBox="0 0 36 36">
                                    <circle className="stroke-current opacity-20" strokeWidth="4" fill="none" cx="18" cy="18" r="15.9" />
                                    <circle className="stroke-current transition-all duration-75" strokeDasharray={`${progress}, 100`} strokeWidth="4" strokeLinecap="round" fill="none" cx="18" cy="18" r="15.9" />
                                </svg>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 36 36">
                                    <circle className="text-muted stroke-current" strokeWidth="4" fill="none" cx="18" cy="18" r="15.9" />
                                    <circle className="text-primary stroke-current transition-all duration-75" strokeDasharray={`${progress}, 100`} strokeWidth="4" strokeLinecap="round" fill="none" cx="18" cy="18" r="15.9" />
                                </svg>
                                <span className="text-muted-foreground text-[11px]">Hold still for 3D…</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/*
             * Flip wrapper — this is the element that rotates 180° for the flip.
             * It fills the outer shell entirely.
             * tiltRef points here too, so tilt transform is applied to this same element
             * (which already has the flip baked in via CSS transition).
             *
             * IMPORTANT: when is3D is active we take over the transform fully via
             * applyTilt(), so we set style.transform directly on this element and
             * the CSS transition class is removed while tilting.
             */}
            <div
                ref={tiltRef}
                className={`relative ${cardSize}`}
                style={{
                    transformStyle: "preserve-3d",
                    transition: is3D ? "none" : "transform 1.0s cubic-bezier(0.4,0,0.2,1)",
                    // 🌟 Use dynamic flipAngle rotation
                    transform: `perspective(1000px) rotateY(${flipAngle}deg)`,
                }}
                onContextMenu={e => e.preventDefault()}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >

                {/* ════════ FRONT FACE ════════ */}
                <div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                    <Card className="overflow-hidden group w-full h-full flex flex-col items-stretch gap-0 justify-between pt-0 transition-all duration-500 hover:shadow-2xl select-none [-webkit-touch-callout:none]">

                        {/* 🌟 Image area (flex-1 lets it take all remaining vertical space gracefully) */}
                        {imageFocus !== undefined ? (
                            <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center min-h-0">
                                <ViewTransition name={transitionKey} share="morph">
                                    <CharacterImage
                                        src={image} alt={title}
                                        imageFocus={imageFocus ?? null}
                                        width={400} height={500}
                                        className={`overflow-hidden relative z-10 object-contain h-full w-full duration-700 transition-transform pointer-events-none ${is3D ? "scale-110" : "group-hover:scale-110"}`}
                                    />
                                </ViewTransition>
                                {is3D && <ShineEffect shineRef={shineRef} />}
                            </div>
                        ) : (
                            <div className="relative flex-1 w-full bg-transparent flex items-center justify-center overflow-hidden min-h-0">
                                <ViewTransition name={transitionKey} share="morph">
                                    <Image
                                        src={background ? background : image}
                                        alt="background blur"
                                        /* ${typePage === "team" ? "object-contain" : `object-cover ${typePage !== "power" ? "group-hover:blur-none" : ""}`} */
                                        className={`absolute inset-0 m-auto ${typePage === "team" ? "object-contain" : `object-cover`} blur-xs w-full h-full pointer-events-none transition-all duration-500`}
                                        width={200} height={200} unoptimized
                                    />
                                    <Image
                                        src={image} alt={title}
                                        /* animate-bright-gold */
                                        /* ${background && is3D ? "opacity-0" : background ? "opacity-100 group-hover:opacity-0" : ""} */
                                        className={`overflow-visible absolute z-10 object-contain ${typePage === "universe" ? "max-h-[85%] w-[85%] " : "h-full w-full"} duration-1000 transition-all pointer-events-none ${typePage !== "team" && (is3D ? "scale-110" : "group-hover:scale-110")} `}
                                        width={800} height={1200} unoptimized
                                    />
                                </ViewTransition>
                                {is3D && <ShineEffect shineRef={shineRef} />}
                            </div>
                        )}

                        {/* Info (shrink-0 prevents it from shrinking or disappearing) */}
                        <CardContent className="bg-card py-3 flex flex-col items-center justify-center shrink-0">
                            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-4 shrink-0">
                                <LoadingLink href={href}>
                                    <CardTitle className="text-base font-bold truncate" title={title}>{title}</CardTitle>
                                </LoadingLink>
                                <div className="flex items-center gap-2 shrink-0">
                                    {badge}
                                    <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">#{id}</span>
                                    {backData && (
                                        <button
                                            onClick={toggleFlip}
                                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                            title="Flip card"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardDescription className="flex flex-row justify-between items-center gap-2 w-full px-5 py-1 shrink-0">
                                <p className={`${!universeLogo && "min-h-12.5"} line-clamp-3 text-xs text-muted-foreground font-light max-w-[70%]`}>
                                    {description || "No description available."}
                                </p>
                                {universeLogo && (
                                    <div className="h-6 w-14 shrink-0">
                                        <Image src={universeLogo} alt={`${title} publisher logo`}
                                            width={125} height={60} unoptimized
                                            className="h-full w-full object-contain pointer-events-none" />
                                    </div>
                                )}
                            </CardDescription>
                        </CardContent>

                        {/* Footer stats (shrink-0 ensures it stays locked at the bottom) */}
                        <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-2 bg-muted">
                            <div className={`grid grid-cols-${stats.length} w-full divide-x divide-foreground/50 text-center text-xs`}>
                                {stats.map((stat, idx) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={idx} className="flex flex-col items-center justify-center gap-0.5 py-1" title={stat.title}>
                                            <Icon className={`w-3.5 h-3.5 ${stat.colorClass || "text-muted-foreground"}`} />
                                            <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[70px] capitalize">{stat.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* ════════ BACK FACE ════════ */}
                {backData && (
                    <div
                        className="absolute inset-0"
                        style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <Card className={`w-full h-full overflow-hidden select-none [-webkit-touch-callout:none]`}
                            style={{
                                // transformStyle: "preserve-3d",
                                backgroundColor: backData.cardBackgroundColor
                            }}
                        >
                            <CardBackFace
                                backData={backData}
                                onFlip={() => toggleFlip()}
                            />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Back face router ──────────────────────────────────────────────────────────

function CardBackFace({
    backData, onFlip,
}: {
    backData: BackData;
    onFlip: (e?: React.MouseEvent) => void;
}) {
    return (
        <div className="relative flex flex-col h-full w-full">
            <button
                onClick={onFlip}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Flip back"
            >
                <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <CardBack backData={backData} />
        </div>
    );
}
function CardBack({ backData }: { backData: BackData; }) {
    return (
        <div className="h-full flex flex-col gap-8 items-center justify-center">
            {/* <div className="flex items-center justify-center border rounded-full aspect-square w-48 p-4 shadow-lg"
                style={{
                    background: backData.glowShadowColor,
                    borderColor: backData.cardBorderColor
                }}
            >
                <p className="text-7xl font-bold text-white">{backData.total}</p>
            </div> */}
            {backData.logo != "" ?
                < Image className="max-h-[60%] w-auto max-w-[80%]" src={backData.logo} width={800} height={800} unoptimized alt={backData.entityName} />
                : <p className="text-white font-semibold">{backData.entityName}</p>
            }

        </div>
    )
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function ShineEffect({ shineRef }: { shineRef: React.RefObject<HTMLDivElement | null> }) {
    return (
        <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none rounded-inherit">
            <div
                ref={shineRef}
                className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(
                            circle 350px at var(--x, 50%) var(--y, 50%),
                            rgba(255, 255, 255, 0.85) 0%,
                            rgba(255, 255, 255, 0.3) 35%,
                            rgba(120, 200, 255, 0.15) 60%,
                            transparent 85%
                        )
                    `,
                    mixBlendMode: "overlay",
                    willChange: "transform, opacity",
                }}
            />
        </div>
    );
}