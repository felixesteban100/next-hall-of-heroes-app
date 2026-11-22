
import {
    Atom,
    Lock,
    Shield,
    Sparkles,
    Swords,
} from "lucide-react";

import type { PowerRole } from "@/types";
import type { RoleStyle } from "../types";

export const ROLE_STYLES: Record<PowerRole, RoleStyle> = {
    Offensive: {
        Icon: Swords,
        text: "text-red-400",
        glow: "shadow-red-500/50",
        bg: "bg-red-500/15",
        border: "border-red-500/40",
        label: "Offensive",
    },
    Defensive: {
        Icon: Shield,
        text: "text-cyan-400",
        glow: "shadow-cyan-500/40",
        bg: "bg-cyan-500/15",
        border: "border-cyan-500/40",
        label: "Defensive",
    },
    Control: {
        Icon: Lock,
        text: "text-violet-400",
        glow: "shadow-violet-500/40",
        bg: "bg-violet-500/15",
        border: "border-violet-500/40",
        label: "Control",
    },
    Utility: {
        Icon: Sparkles,
        text: "text-emerald-400",
        glow: "shadow-emerald-500/40",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/40",
        label: "Utility",
    },
    "Hybrid / Versatile": {
        Icon: Atom,
        text: "text-amber-400",
        glow: "shadow-amber-500/40",
        bg: "bg-amber-500/15",
        border: "border-amber-500/40",
        label: "Hybrid",
    },
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
