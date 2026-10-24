import { Log } from "@/components/compare/battle/BattlePanel";
import { EnrichedFighter } from "@/components/compare/battle/battlePanel/CinematicCombatView";
import { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import { Atom, Lock, Shield, Sparkles, Swords } from "lucide-react";


export const ROLE_STYLE: Record<PowerRole, {
    Icon: React.ElementType;
    text: string;
    glow: string;
    bg: string;
    border: string;
    label: string;
}> = {
    "Offensive": { Icon: Swords, text: "text-red-400", glow: "shadow-red-500/50", bg: "bg-red-500/15", border: "border-red-500/40", label: "Offensive" },
    "Defensive": { Icon: Shield, text: "text-cyan-400", glow: "shadow-cyan-500/40", bg: "bg-cyan-500/15", border: "border-cyan-500/40", label: "Defensive" },
    "Control": { Icon: Lock, text: "text-violet-400", glow: "shadow-violet-500/40", bg: "bg-violet-500/15", border: "border-violet-500/40", label: "Control" },
    "Utility": { Icon: Sparkles, text: "text-emerald-400", glow: "shadow-emerald-500/40", bg: "bg-emerald-500/15", border: "border-emerald-500/40", label: "Utility" },
    "Hybrid / Versatile": { Icon: Atom, text: "text-amber-400", glow: "shadow-amber-500/40", bg: "bg-amber-500/15", border: "border-amber-500/40", label: "Hybrid" },
};

export const ACTIVATION_VERB: Record<string, string> = {
    Instant: "Unleashes",
    Action: "Channels",
    Passive: "Triggers",
    Channeled: "Sustains",
};

export const RANGE_SUFFIX: Record<string, string> = {
    Self: "on self",
    Touch: "up close",
    Melee: "in melee",
    Ranged: "from a distance",
    "Melee / Ranged": "across the field",
    Global: "across dimensions",
};


export type ElementType = "fire" | "ice" | "lightning" | "water" | "shadow" | "cosmic" | "psychic" | "nature" | "tech" | "none";

export const ELEMENT_KEYWORDS: Record<ElementType, string[]> = {
    fire: ["fire", "flame", "burn", "heat", "inferno", "pyro", "solar", "magma", "lava", "phoenix"],
    ice: ["ice", "frost", "freeze", "cryo", "blizzard", "glacial", "cold", "arctic", "snow"],
    lightning: ["lightning", "thunder", "electric", "shock", "volt", "storm", "zap", "plasma"],
    water: ["water", "aqua", "tidal", "ocean", "wave", "flood", "sea", "hydro"],
    shadow: ["shadow", "dark", "void", "night", "shade", "stealth", "phantom", "death", "necrotic", "blood"],
    cosmic: ["cosmic", "space", "star", "galaxy", "energy", "reality", "dimensional", "infinity", "quantum"],
    psychic: ["psychic", "mind", "mental", "psi", "telepat", "telekin", "brain", "thought", "illusion"],
    nature: ["nature", "plant", "earth", "bio", "beast", "animal", "grow", "wood", "vine", "stone", "rock"],
    tech: ["tech", "mech", "nano", "cyber", "machine", "robot", "armor", "suit", "weapon", "laser"],
    none: [],
};

// Role → fallback element when no keyword matches
export const ROLE_FALLBACK_ELEMENT: Partial<Record<PowerRole, ElementType>> = {
    "Offensive": "fire",
    "Defensive": "tech",
    "Control": "psychic",
    "Utility": "cosmic",
    "Hybrid / Versatile": "shadow",
};

export function detectElement(power?: Power): ElementType {
    if (!power) return "none";
    const haystack = [
        power.name ?? "",
        ...((power as any).actions ?? []).map((a: any) => a.description ?? ""),
    ].join(" ").toLowerCase();

    for (const [element, keywords] of Object.entries(ELEMENT_KEYWORDS) as [ElementType, string[]][]) {
        if (element === "none") continue;
        if (keywords.some((kw) => haystack.includes(kw))) return element;
    }

    // Fall back to role-based element so there's always a visual effect
    return ROLE_FALLBACK_ELEMENT[power.combatRole] ?? "cosmic";
}

export function getRealPowers(char: CharacterWithJoinTeamUniversePowerEnemies): Power[] {
    return (char.powers ?? []).filter(
        (p): p is Power =>
            p !== null && typeof p === "object" && !("isFallback" in p) && "combatRole" in p
    );
}

export function resolveActivePower(
    log: Log,
    attacker?: EnrichedFighter,
    chars?: CharacterWithJoinTeamUniversePowerEnemies[]
): Power | undefined {
    if (!attacker) return undefined;

    // 1. Try to find the full character in chars to get scored/real powers
    if (chars) {
        const char = chars.find((c) => c.name === attacker.name);
        if (char) {
            const powers = getRealPowers(char);
            if (log.powerName) {
                const exact = powers.find((p) => p.name === log.powerName);
                if (exact) return exact;
            }
            return powers.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
        }
    }

    // 2. Fallback: use the attacker's own powers array from FighterState
    if (Array.isArray(attacker.powers) && attacker.powers.length > 0) {
        if (log.powerName) {
            const exact = attacker.powers.find((p: any) => p?.name === log.powerName);
            if (exact) return exact;
        }
        const validPowers = attacker.powers.filter((p: any) => p && !p.isFallback && p.combatRole);
        return validPowers.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? attacker.powers[0];
    }

    return undefined;
}