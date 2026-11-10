"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCharacterAlignmentText } from "@/lib/character_utils";
import { CharacterImage } from "../shared/CharacterImage";

type FeaturedChar = {
    id: number;
    name: string;
    slug: string;
    image: string;
    imageFocus: string;
    total: number;
    alignment: string;
    publisher: string;
};

function TiltCard({ char, index }: { char: FeaturedChar; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
    const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
    const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    const alignmentColor =
        char.alignment === "good"
            ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10"
            : char.alignment === "bad"
                ? "text-rose-400 border-rose-400/30 bg-rose-400/10"
                : "text-amber-400 border-amber-400/30 bg-amber-400/10";

    return (
        <div className="shrink-0 w-44 sm:w-52" style={{ perspective: "900px" }}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full cursor-pointer"
            >
                <Link href={`/characters/${char.id}`} className="block">
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/8 group">
                        {/* Image */}
                        <CharacterImage
                            src={char.image}
                            alt={char.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            imageFocus={char.imageFocus}
                        />

                        {/* Gradient overlay — thicker for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,0.2) 65%, transparent 100%)" }} />

                        {/* Shine overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
                                mixBlendMode: "screen",
                            }}
                        />

                        {/* Neon border glow on hover */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ boxShadow: "inset 0 0 0 1px hsl(var(--primary)/0.5), 0 0 20px 2px hsl(var(--primary)/0.15)" }}
                        />

                        {/* Bottom info */}
                        <div className="absolute bottom-0 inset-x-0 p-3 space-y-1.5">
                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${alignmentColor}`}>
                                {getCharacterAlignmentText(char.alignment)}
                            </div>
                            <div className="text-white font-bold text-sm leading-tight truncate drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">{char.name}</div>
                            <div className="text-white/70 text-[10px] truncate drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">{char.publisher}</div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}

export function FeaturedCharactersRow({ characters }: { characters: FeaturedChar[] }) {
    if (!characters.length) return null;

    // Duplicate for seamless infinite loop
    const doubled = [...characters, ...characters];
    const trackRef = useRef<HTMLDivElement>(null);
    const posRef = useRef(0);
    const rafRef = useRef<number>(0);
    const isPaused = useRef(false);   // hover pause
    const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const halfWidthRef = useRef(0);
    const SPEED = 0.45;

    // Drag state
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartPos = useRef(0);

    const pauseAndScheduleResume = () => {
        isPaused.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(() => { isPaused.current = false; }, 1200);
    };

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const start = () => {
            halfWidthRef.current = track.scrollWidth / 2;

            const tick = () => {
                if (!isPaused.current) {
                    posRef.current += SPEED;
                    if (posRef.current >= halfWidthRef.current) posRef.current -= halfWidthRef.current;
                    track.style.transform = `translateX(-${posRef.current}px)`;
                }
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        };

        const id = setTimeout(start, 50);
        return () => { clearTimeout(id); cancelAnimationFrame(rafRef.current); };
    }, []);

    // Wheel handler — shift horizontal scroll into pos
    const onWheel = (e: React.WheelEvent) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 2) return;
        e.preventDefault();
        posRef.current = (posRef.current + delta + halfWidthRef.current * 2) % halfWidthRef.current;
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
        pauseAndScheduleResume();
    };

    // Mouse drag handlers
    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragStartPos.current = posRef.current;
        isPaused.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const delta = dragStartX.current - e.clientX;
        posRef.current = (dragStartPos.current + delta + halfWidthRef.current * 2) % halfWidthRef.current;
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
    };
    const onMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        pauseAndScheduleResume();
    };

    // Touch drag handlers
    const onTouchStart = (e: React.TouchEvent) => {
        dragStartX.current = e.touches[0].clientX;
        dragStartPos.current = posRef.current;
        isPaused.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        const delta = dragStartX.current - e.touches[0].clientX;
        posRef.current = (dragStartPos.current + delta + halfWidthRef.current * 2) % halfWidthRef.current;
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
    };
    const onTouchEnd = () => { pauseAndScheduleResume(); };

    return (
        <section className="py-10 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground">
                            Featured <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Champions</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Top-tier entities from across the multiverse</p>
                    </div>
                    <Link
                        href="/characters"
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group"
                    >
                        View all
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* Infinite scroll track */}
            <div
                className="relative cursor-grab active:cursor-grabbing"
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

                <div className="overflow-hidden pb-4">
                    <div
                        ref={trackRef}
                        className="flex gap-4 will-change-transform"
                        style={{ width: "max-content" }}
                    >
                        {doubled.map((char, i) => (
                            <TiltCard key={`${char.slug}-${i}`} char={char} index={i % characters.length} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}