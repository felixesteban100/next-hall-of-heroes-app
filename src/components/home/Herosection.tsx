"use client";

import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import { StartPageSearchLink } from "@/components/startPage/StartPageSearchLink";
import { Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

type FloatingChar = {
    name: string;
    image: string;
    imageFocus: string;
};

const wordVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

const floatVariants = (i: number) => ({
    animate: {
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        rotate: [0, 1.5, -1, 0.8, 0],
        transition: {
            duration: 7 + i * 1.4,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: i * 0.9,
        },
    },
});

export function HeroSection({ characters }: { characters: FloatingChar[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

    const parallaxX = useTransform(springX, [0, 1], [-24, 24]);
    const parallaxY = useTransform(springY, [0, 1], [-12, 12]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    }

    const titleWords = ["Explore", "the", "Ultimate"];
    const titleWords2 = ["Hall", "of", "Heroes", "&", "Villains"];

    // Positions for floating character images
    const positions = [
        { top: "8%", left: "2%", zIndex: 1, scale: 0.85, opacity: 0.55 },
        { top: "5%", right: "3%", zIndex: 1, scale: 0.9, opacity: 0.6 },
        { top: "45%", left: "0%", zIndex: 1, scale: 0.75, opacity: 0.4 },
        { top: "40%", right: "1%", zIndex: 1, scale: 0.8, opacity: 0.5 },
        { top: "70%", left: "5%", zIndex: 1, scale: 0.65, opacity: 0.35 },
    ];

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-20"
        >
            {/* Deep space background */}
            <div className="absolute inset-0 bg-background" />

            {/* Radial glow behind title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background:
                            "radial-gradient(circle, hsl(var(--primary)/0.8) 0%, hsl(var(--secondary)/0.4) 40%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                />
            </div>

            {/* Floating particle dots */}
            <Particles />

            {/* Floating character images with parallax */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ x: parallaxX, y: parallaxY }}
            >
                {characters.slice(0, 5).map((char, i) => (
                    <motion.div
                        key={char.name + i}
                        className="absolute w-32 sm:w-40 md:w-52 lg:w-60 aspect-[2/3] rounded-2xl overflow-hidden border border-white/5"
                        style={{
                            ...positions[i],
                            boxShadow: "0 0 40px 4px hsl(var(--primary)/0.12)",
                        }}
                        variants={floatVariants(i)}
                        animate="animate"
                        initial={{ opacity: 0, scale: 0.85 }}
                        transition={{ opacity: { delay: 0.5 + i * 0.2, duration: 1 } }}
                        whileInView={{ opacity: positions[i].opacity }}
                        viewport={{ once: true }}
                    >
                        <img
                            src={char.image}
                            alt={char.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: char.imageFocus || "center top" }}
                            loading="eager"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    </motion.div>
                ))}
            </motion.div>

            {/* Main content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase shadow-lg shadow-primary/10 backdrop-blur-md"
                >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Ultimate Multiverse Database & Combat Engine
                </motion.div>

                {/* Title line 1 */}
                <div className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-tight">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                        {titleWords.map((word, i) => (
                            <motion.span
                                key={word}
                                custom={i}
                                variants={wordVariants}
                                initial="hidden"
                                animate="visible"
                                className="inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>

                    {/* Title line 2 — gradient */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                        {titleWords2.map((word, i) => (
                            <motion.span
                                key={word}
                                custom={titleWords.length + i}
                                variants={wordVariants}
                                initial="hidden"
                                animate="visible"
                                className="inline-block bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                    className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
                >
                    Dive into relational intelligence across universes. Match up team leaders,
                    simulate cinematic tactical battles, track power tiers, and trace faction
                    connections.
                </motion.p>

                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="pt-2 max-w-xl mx-auto"
                >
                    <StartPageSearchLink />
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="pt-2"
                >
                    <Link
                        href="/characters"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm tracking-wide shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
                    >
                        Enter the Vault
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </Link>
                </motion.div>
            </div>

            {/* Scroll hint */}
            <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 6, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[10px] uppercase tracking-widest">Scroll</span>
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </section>
    );
}

// Floating particle dots
function Particles() {
    const dots = Array.from({ length: 28 }, (_, i) => i);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {dots.map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-primary/30"
                    style={{
                        width: Math.random() * 3 + 1,
                        height: Math.random() * 3 + 1,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.4, 1],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 6,
                        repeat: Infinity,
                        delay: Math.random() * 4,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}