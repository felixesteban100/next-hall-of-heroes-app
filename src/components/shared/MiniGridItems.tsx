import Image from "next/image";
import Link from "next/link";
import { Shield, ShieldAlert, ShieldCheck, Globe, User, Zap, LucideIcon } from "lucide-react";
import { ViewTransition } from "react";
import { LoadingLink } from "./LoadingLink";

export type MiniGridItem = {
    id: number | string;
    name: string;
    image?: string | null;
    logo?: string | null;
    href?: string;
    alignment?: "good" | "bad" | "neutral" | string;
    subtext?: string;
    // Character & Power specific optional fields
    fullName?: string;
    powerstatTotal?: number;
    category?: string;       // E.g., "Elemental", "Telepathy", "Physical"
    characterCount?: number; // Number of characters with this power
};

interface MiniEntityGridProps {
    items: MiniGridItem[];
    externalNames?: string[];
    entityType?: "team" | "universe" | "character" | "power" | "generic";
    variant?: "default" | "villain";
    showAlignment?: boolean; // Toggles Good / Neutral / Bad badges & colored borders
    emptyMessage?: string;
    fallbackIcon?: LucideIcon;
    avatarShape?: "circle" | "rounded" | "square";
    compareWithId?: number | string;          // ← new
}

// Helpers for Alignment Styles
function getAlignmentTheme(alignment?: string) {
    const norm = alignment?.toLowerCase();
    if (norm === "bad" || norm === "villain") {
        return {
            border: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/60",
            text: "group-hover:text-red-500",
            badge: "bg-red-500/10 text-red-500 border-red-500/20",
            icon: ShieldAlert,
            label: "Bad",
        };
    }
    if (norm === "neutral") {
        return {
            border: "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60",
            text: "group-hover:text-yellow-500",
            badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            icon: Shield,
            label: "Neutral",
        };
    }
    if (norm === "good" || norm === "hero") {
        return {
            border: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/60",
            text: "group-hover:text-green-500",
            badge: "bg-green-500/10 text-green-500 border-green-500/20",
            icon: ShieldCheck,
            label: "Good",
        };
    }
    // Default / Unknown Fallback
    return {
        border: "border-border bg-card hover:bg-accent/50 hover:border-primary/40",
        text: "group-hover:text-primary",
        badge: "bg-muted text-muted-foreground border-border",
        icon: Shield,
        label: null,
    };
}

export function MiniEntityGrid({
    items = [],
    externalNames = [],
    entityType = "generic",
    variant = "default",
    showAlignment = false,
    emptyMessage = "No items available.",
    fallbackIcon,
    avatarShape = "circle",
    compareWithId
}: MiniEntityGridProps) {
    const hasContent = items.length > 0 || externalNames.length > 0;

    // Resolve default fallback icon based on entityType
    const DefaultIcon =
        fallbackIcon ||
        (entityType === "universe"
            ? Globe
            : entityType === "character"
                ? User
                : entityType === "power"
                    ? Zap
                    : Shield);

    // Dynamic routing based on entityType
    const getHref = (item: MiniGridItem) => {
        if (item.href) return item.href;
        switch (entityType) {
            case "team":
                return `/teams/${item.id}`;
            case "universe":
                return `/universes/${item.id}`;
            case "character":
                return `/characters/${item.id}`;
            case "power":
                return `/powers/${item.id}`;
            default:
                return `#`;
        }
    };

    const getImageStyle = () => {
        if (entityType === "character") {
            if (avatarShape === "circle") return "rounded-full object-cover aspect-square";
            if (avatarShape === "rounded") return "rounded-lg object-cover aspect-square";
            return "rounded-none object-cover aspect-square";
        }
        if (entityType === "power") {
            return "object-contain rounded-md max-h-full w-auto";
        }
        return "object-contain max-h-full w-auto";
    };

    if (!hasContent) {
        return <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((item) => {
                const effectiveAlignment = variant === "villain" ? "bad" : item.alignment;
                const theme = getAlignmentTheme(effectiveAlignment);
                const imgSrc = item.image || item.logo;

                const displaySubtext =
                    item.subtext ||
                    item.category ||
                    (item.characterCount ? `${item.characterCount} Users` : null) ||
                    (item.powerstatTotal ? `PWR: ${item.powerstatTotal}` : null) ||
                    item.fullName ||
                    `#${item.id}`;

                return (
                    <ViewTransition key={item.id} name={`${entityType}-${item.id}`}>
                        <LoadingLink
                            href={getHref(item)}
                            className={`group relative flex flex-col items-center justify-between h-28 p-3 rounded-xl border transition-all duration-200 text-center ${entityType === "power" && !item.alignment
                                ? "border-gray-500/20 bg-gray-500/5 hover:bg-gray-500/10 hover:border-gray-500/40"
                                : theme.border
                                }`}
                        >
                            {/* Optional Alignment Badge */}
                            {showAlignment && theme.label && (
                                <span
                                    className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full border z-10 ${theme.badge}`}
                                >
                                    {theme.label}
                                </span>
                            )}

                            {/* Media Avatar / Logo / Power Icon */}
                            <div className="w-full h-10 relative flex items-center justify-center mt-1">
                                {imgSrc ? (
                                    <Image
                                        src={imgSrc}
                                        alt={item.name}
                                        className={`${getImageStyle()} transition-transform duration-300 group-hover:scale-105`}
                                        width={entityType === "character" ? 40 : 100}
                                        height={entityType === "character" ? 40 : 50}
                                    />
                                ) : (
                                    <DefaultIcon
                                        className={`w-5 h-5 ${entityType === "power"
                                            ? "text-primary/70 group-hover:text-primary"
                                            : "text-muted-foreground/50"
                                            } transition-colors`}
                                    />
                                )}
                            </div>

                            {/* Text Container */}
                            <div className="flex flex-col items-center justify-center w-full">
                                <span
                                    className={`text-xs font-bold line-clamp-1 transition-colors text-foreground ${entityType === "power" && !item.alignment
                                        ? "group-hover:text-primary"
                                        : theme.text
                                        }`}
                                    title={item.name}
                                >
                                    {item.name}
                                </span>

                                <span className="text-[10px] text-muted-foreground font-mono line-clamp-1">
                                    {displaySubtext}
                                </span>
                                {/* NEW: Compare link – only when we have a current character to compare against */}
                                {compareWithId && entityType === "character" && (
                                    <LoadingLink
                                        href={`/compare/${compareWithId}/${item.id}`}   // ← adjust path to whatever you use
                                        onClick={(e) => e.stopPropagation()}            // prevents the parent LoadingLink from firing
                                        className="mt-0.5 text-[9px] font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Compare
                                    </LoadingLink>
                                )}
                            </div>
                        </LoadingLink>
                    </ViewTransition>
                );
            })}

            {/* External / Unmapped Items */}
            {externalNames.map((name, idx) => (
                <div
                    key={`ext-${idx}`}
                    className="flex flex-col items-center justify-between h-28 p-3 rounded-xl border border-border bg-muted/40 text-center"
                >
                    <div className="w-full h-10 relative flex items-center justify-center mt-1">
                        <ShieldAlert className="w-5 h-5 text-muted-foreground/60" />
                    </div>

                    <div className="flex flex-col items-center justify-center w-full">
                        <span
                            className="text-xs font-semibold text-muted-foreground line-clamp-1"
                            title={name}
                        >
                            {name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 italic font-mono">
                            External
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}