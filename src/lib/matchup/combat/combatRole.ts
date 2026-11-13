import {
    HeartPulse,
    Key,
    Lock,
    Shield,
    Zap,
} from "lucide-react";

import type { PowerRole } from "@/types";

export const combatRoleConfig = {
    Offensive: {
        className:
            "border-red-500/20 bg-red-500/10 text-red-400",
        Icon: Zap,
    },
    Defensive: {
        className:
            "border-blue-500/20 bg-blue-500/10 text-blue-400",
        Icon: Shield,
    },
    Control: {
        className:
            "border-violet-500/20 bg-violet-500/10 text-violet-400",
        Icon: Lock,
    },
    Utility: {
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Icon: Key,
    },
    "Hybrid / Versatile": {
        className:
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        Icon: Zap,
    },
} satisfies Record<
    PowerRole,
    {
        className: string;
        Icon: React.ElementType;
    }
>;