"use client"

import {
    Users,
    Shield,
    Globe2,
    Zap,
    Search,
    ArrowRight,
    Sparkles,
    Flame
} from "lucide-react";
import { useParamLoading } from "../layout/ParamLoadingContext";

export function StartPageCategoryLinks() {
    const { navigateRoute } = useParamLoading();

    const entityCategories = [
        {
            title: "Characters",
            description: "Explore heroes, anti-heroes, and villains with full powerstats and bios.",
            href: "/characters",
            icon: Users,
            badge: "Primary Roster",
            color: "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30 hover:border-blue-500/60 text-blue-500",
        },
        {
            title: "Teams & Factions",
            description: "Discover alliances, leader rosters, and multi-universe squads.",
            href: "/teams",
            icon: Shield,
            badge: "Alliances",
            color: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 hover:border-emerald-500/60 text-emerald-500",
        },
        {
            title: "Universes",
            description: "Browse multiverse dimensions from comics, cartoons, and anime.",
            href: "/universes",
            icon: Globe2,
            badge: "Multiverse",
            color: "from-purple-500/20 via-indigo-500/10 to-transparent border-purple-500/30 hover:border-purple-500/60 text-purple-500",
        },
        {
            title: "Powers & Abilities",
            description: "Filter characters by meta-abilities, elements, and power levels.",
            href: "/powers",
            icon: Zap,
            badge: "Abilities",
            color: "from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30 hover:border-amber-500/60 text-amber-500",
        },
    ];

    return (
        <>
            {entityCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <button
                        key={cat.title}
                        onClick={() => navigateRoute(cat.href)}
                        className={`group relative flex flex-col justify-between p-5 rounded-2xl border bg-linear-to-b ${cat.color} transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md text-left w-full`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl bg-background/80 border border-border shadow-xs">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                                    {cat.badge}
                                </span>
                            </div>

                            {/* group-hover:text-primary */}
                            <h2 className="text-lg font-bold text-foreground  transition-colors mb-1">
                                {cat.title}
                            </h2>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {cat.description}
                            </p>
                        </div>
                        <div className="mt-6 flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                            <span>Browse Database</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </button>
                )
            })}
        </>
    );
}