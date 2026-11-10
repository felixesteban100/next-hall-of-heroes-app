"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Swords, Users, Shield, ArrowRight, Cpu } from "lucide-react";
import Link from "next/link";

type FeatureCard = {
    title: string;
    description: string;
    href: string | null;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    iconBorder: string;
    glowColor: string;
    cta: string;
    badge?: { label: string; color: string }[];
    isComingSoon?: boolean;
};

const cards: FeatureCard[] = [
    {
        title: "Cinematic Combat Simulator",
        description:
            "Experience turn-based tactical battles complete with dynamic K.O. slams, health bars, revives, action overlays, and sound integration.",
        href: "/matchup",
        icon: Swords,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/30",
        glowColor: "hsl(var(--primary)/0.25)",
        cta: "Launch Simulation",
    },
    {
        title: "Character & Faction Index",
        description:
            "Explore comprehensive profiles featuring powerstats, smart image cropping, custom focus alignment, and universe cross-references.",
        href: "/characters",
        icon: Users,
        iconColor: "text-secondary",
        iconBg: "bg-secondary/10",
        iconBorder: "border-secondary/30",
        glowColor: "hsl(var(--secondary)/0.25)",
        cta: "Browse Database",
        badge: [{ label: "Database Active", color: "bg-secondary/10 text-secondary border-secondary/20" }],
    },
    {
        title: "Tactical Power System",
        description:
            "Categorized power roles across Offensive, Defensive, Control, Utility, and Hybrid tiers with smart activation checks.",
        href: "/powers",
        icon: Shield,
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10",
        iconBorder: "border-amber-500/30",
        glowColor: "rgba(251,191,36,0.2)",
        cta: "Explore Powers",
        badge: [
            { label: "Offensive", color: "bg-red-500/10 text-red-400 border-red-500/20" },
            { label: "Defensive", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
            { label: "Utility", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        ],
    },
];

function GlowCard({ card, index }: { card: FeatureCard; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    const Icon = card.icon;

    const inner = (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative group flex flex-col justify-between p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden h-full transition-colors duration-300 hover:border-transparent"
        >
            {/* Spotlight glow on hover — follows cursor */}
            {hovered && (
                <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        background: `radial-gradient(300px circle at ${mouseX.get()}px ${mouseY.get()}px, ${card.glowColor}, transparent 70%)`,
                    }}
                />
            )}

            {/* Animated border on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px ${card.glowColor}, 0 0 30px 2px ${card.glowColor}` }}
            />

            <div className="relative space-y-4">
                {/* Animated icon */}
                <motion.div
                    className={`w-11 h-11 rounded-xl ${card.iconBg} border ${card.iconBorder} flex items-center justify-center ${card.iconColor}`}
                    whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                >
                    <Icon className="w-5 h-5" />
                </motion.div>

                <h3 className={`text-lg font-bold text-foreground transition-colors duration-200 group-hover:${card.iconColor}`}>
                    {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
            </div>

            <div className="relative pt-5">
                {card.badge ? (
                    <div className="flex flex-wrap gap-1.5">
                        {card.badge.map((b) => (
                            <span
                                key={b.label}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${b.color}`}
                            >
                                {b.label}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${card.iconColor}`}>
                        <span>{card.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
            </div>
        </motion.div>
    );

    if (card.href) {
        return (
            <Link href={card.href} className="block h-full">
                {inner}
            </Link>
        );
    }

    return inner;
}

export function FeatureCards() {
    return (
        <section className="px-4 py-10 max-w-6xl mx-auto w-full">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between border-b border-border/40 pb-4 mb-6"
            >
                <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    Core System Capabilities
                </h2>
                <span className="text-xs text-muted-foreground/60 hidden sm:inline">
                    Select a module to dive in
                </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map((card, i) => (
                    <div key={card.title} className={i === 2 ? "md:col-span-2 lg:col-span-1" : ""}>
                        <GlowCard card={card} index={i} />
                    </div>
                ))}
            </div>
        </section>
    );
}