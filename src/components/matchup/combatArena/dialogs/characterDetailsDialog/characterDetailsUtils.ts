import type { CombatFighter } from "@/lib/matchup/combat/types/types";

export type FighterBadgeVariant = "default" | "secondary";

export type FighterAccentClasses = {
    icon: string;
    bar: string;
};

export function clampPercent(current: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (current / max) * 100));
}

export function getFighterTheme(fighter: CombatFighter): {
    isTeamA: boolean;
    badgeVariant: FighterBadgeVariant;
    accentClasses: FighterAccentClasses;
} {
    const isTeamA = fighter.side === "A";
    return {
        isTeamA,
        badgeVariant: isTeamA ? "default" : "secondary",
        accentClasses: isTeamA
            ? { icon: "text-primary", bar: "bg-primary" }
            : { icon: "text-secondary", bar: "bg-secondary" },
    };
}

export function formatDetailLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDetailValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "Not available";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}