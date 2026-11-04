"use client";

import { ReactNode, useState, useRef } from "react";
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
    const cardRef = useRef<HTMLDivElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // 🌟 Instant synchronous animation trigger for the shine
    const triggerShine = () => {
        if (shineRef.current) {
            shineRef.current.style.animation = "none";
            void shineRef.current.offsetHeight;
            shineRef.current.style.animation = "glass-shimmer 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards";
        }
    };

    // 🌟 3D Tilt calculation based on cursor/finger position
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left; // X position inside card
        const y = clientY - rect.top;  // Y position inside card

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation angles (max ±12 degrees for a luxurious weight)
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        // card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        setIsPressed(false);
        // Smoothly spring back to flat
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <div style={{ perspective: "1000px" }} className="h-full w-full ">
            <Card
                ref={cardRef}
                /*   */
                className={`group ${!isMobile ? " h-full w-full" : "h-[90%] w-[90%] mx-auto mt-10"} flex flex-col justify-between transition-all duration-150 ease-out pt-0 overflow-hidden shadow-none hover:shadow-2xl select-none [-webkit-touch-callout:none]`}
                style={{ transformStyle: "preserve-3d" }}
                onContextMenu={(e) => e.preventDefault()}
                onMouseMove={handleMouseMove}
                onMouseEnter={triggerShine}
                onMouseLeave={handleMouseLeave}
                onMouseDown={() => {
                    setIsPressed(true);
                    triggerShine();
                }}
                onMouseUp={() => setIsPressed(false)}
                onTouchStart={(e) => {
                    setIsPressed(true);
                    triggerShine();
                    handleMouseMove(e);
                }}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseLeave}
                onTouchCancel={handleMouseLeave}
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
                                width={120}
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