"use client";

import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users, Globe, Shield, Zap, UsersCollaboration } from "lucide-react";

type Stats = {
    characters: number;
    universes: number;
    teams: number;
    powers: number;
};

function AnimatedCount({ target, duration = 1.6 }: { target: number; duration?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

    useEffect(() => {
        if (isInView) motionVal.set(target);
    }, [isInView, target, motionVal]);

    useEffect(() => {
        return spring.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Math.round(latest).toLocaleString();
            }
        });
    }, [spring]);

    return <span ref={ref}>0</span>;
}

const statItems = [
    {
        key: "characters" as keyof Stats,
        label: "Characters",
        icon: Users,
        color: "text-blue-500",
        glow: "shadow-blue-500/20",
        border: "border-blue-500/20",
        bg: "bg-blue-500/5",
    },
    {
        key: "teams" as keyof Stats,
        label: "Teams",
        icon: UsersCollaboration,
        color: "text-green-400",
        glow: "shadow-green-400/20",
        border: "border-green-400/20",
        bg: "bg-green-400/5",
    },
    {
        key: "universes" as keyof Stats,
        label: "Universes",
        icon: Globe,
        color: "text-purple-500",
        glow: "shadow-purple-500/20",
        border: "border-purple-500/20",
        bg: "bg-purple-500/5",
    },
    {
        key: "powers" as keyof Stats,
        label: "Powers",
        icon: Zap,
        color: "text-yellow-400",
        glow: "shadow-yellow-400/20",
        border: "border-yellow-400/20",
        bg: "bg-yellow-400/5",
    },
];

export function StatsBar({ stats }: { stats: Stats }) {
    return (
        <section className="relative py-12 px-4 overflow-hidden">
            {/* Subtle separator glow line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

            <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 32, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{
                                delay: i * 0.1,
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border ${item.border} ${item.bg} shadow-lg ${item.glow} backdrop-blur-sm overflow-hidden group`}
                        >
                            {/* Background shimmer on hover */}
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: `radial-gradient(ellipse 60% 60% at 50% 100%, var(--tw-shadow-color, rgba(255,255,255,0.03)) 0%, transparent 70%)`,
                                }}
                            />

                            <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className={`text-3xl sm:text-4xl font-black tabular-nums ${item.color}`}>
                                <AnimatedCount target={stats[item.key]} />
                            </div>

                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {item.label}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}