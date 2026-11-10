"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
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
        <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 w-44 sm:w-52"
            style={{ perspective: "900px" }}
        >
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full cursor-pointer"
            >
                <Link href={`/characters/${char.id}`} className="block">
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/8  group">
                        {/* Image */}
                        <CharacterImage
                            src={char.image}
                            alt={char.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            // style={{ objectPosition: char.imageFocus || "center top" }}
                            // loading="lazy"
                            imageFocus={char.imageFocus}
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        {/* Shine overlay */}
                        {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
                                mixBlendMode: "screen",
                            }}
                        /> */}

                        {/* Neon border glow on hover */}
                        {/* <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ boxShadow: "inset 0 0 0 1px hsl(var(--primary)/0.5), 0 0 20px 2px hsl(var(--primary)/0.15)" }}
                        /> */}

                        {/* Bottom info */}
                        <div className="absolute bottom-0 inset-x-0 p-3 space-y-1.5">
                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${alignmentColor}`}>
                                {getCharacterAlignmentText(char.alignment)}
                            </div>
                            <div className="text-white font-bold text-sm leading-tight truncate">{char.name}</div>
                            <div className="text-white/50 text-[10px] truncate">{char.publisher}</div>
                            {/* {char.total > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${Math.min((char.total / 850) * 100, 100)}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-white/60 tabular-nums shrink-0">{char.total}</span>
                                </div>
                            )} */}
                        </div>
                    </div>
                </Link>
            </motion.div>
        </motion.div>
    );
}

export function FeaturedCharactersRow({ characters }: { characters: FeaturedChar[] }) {
    if (!characters.length) return null;

    return (
        <section className="py-10 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
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

            {/* Scrollable row */}
            <div className="relative">
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

                <div className="flex gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none" }}>
                    {/* Spacer */}
                    <div className="shrink-0 w-4 max-w-[calc((100vw-72rem)/2)] hidden lg:block pt-8" />
                    {characters.map((char, i) => (
                        <div key={char.slug} className="snap-start">
                            <TiltCard char={char} index={i} />
                        </div>
                    ))}
                    <div className="shrink-0 w-4 max-w-[calc((100vw-72rem)/2)] hidden lg:block" />
                </div>
            </div>
        </section>
    );
}