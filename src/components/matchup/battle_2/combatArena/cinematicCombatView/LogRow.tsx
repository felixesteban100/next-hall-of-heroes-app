
import {
    Activity,
    ArrowLeftRight,
    ArrowUpDown,
    Crown,
    HeartPulse,
    RefreshCw,
    RotateCcw,
    Shield,
    Skull,
    Sparkles,
    Swords,
    Users,
    Zap,
    type LucideIcon,
} from "lucide-react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Log } from "@/lib/matchup/combat/adapters";

type LogStyle = {
    Icon: LucideIcon;
    leftBorder: string;
    labelColor: string;
    label: string;
};

const LOG_STYLES: Record<string, LogStyle> = {
    attack: {
        Icon: Swords,
        leftBorder: "border-l-orange-400",
        labelColor: "text-orange-400",
        label: "ATTACK",
    },
    power: {
        Icon: Zap,
        leftBorder: "border-l-violet-400",
        labelColor: "text-violet-400",
        label: "POWER",
    },
    defend: {
        Icon: Shield,
        leftBorder: "border-l-cyan-400",
        labelColor: "text-cyan-400",
        label: "BLOCK",
    },
    heal: {
        Icon: HeartPulse,
        leftBorder: "border-l-emerald-400",
        labelColor: "text-emerald-400",
        label: "HEAL",
    },
    revive: {
        Icon: RefreshCw,
        leftBorder: "border-l-purple-400",
        labelColor: "text-purple-400",
        label: "REVIVE",
    },
    status_applied: {
        Icon: Sparkles,
        leftBorder: "border-l-fuchsia-400",
        labelColor: "text-fuchsia-400",
        label: "STATUS",
    },
    status_tick: {
        Icon: Activity,
        leftBorder: "border-l-sky-400",
        labelColor: "text-sky-400",
        label: "EFFECT",
    },
    ko: {
        Icon: Skull,
        leftBorder: "border-l-orange-500",
        labelColor: "text-orange-400",
        label: "K.O.",
    },
    finish: {
        Icon: Swords,
        leftBorder: "border-l-red-500",
        labelColor: "text-red-400",
        label: "FINISHER",
    },
    rout: {
        Icon: Skull,
        leftBorder: "border-l-red-500",
        labelColor: "text-red-400",
        label: "ROUT",
    },
    battle_end: {
        Icon: Crown,
        leftBorder: "border-l-amber-400",
        labelColor: "text-amber-400",
        label: "BATTLE END",
    },
    turn_start: {
        Icon: RotateCcw,
        leftBorder: "border-l-blue-400",
        labelColor: "text-blue-400",
        label: "TURN",
    },
    round_start: {
        Icon: ArrowUpDown,
        leftBorder: "border-l-indigo-400",
        labelColor: "text-indigo-400",
        label: "ROUND",
    },
    swap_row: {
        Icon: ArrowLeftRight,
        leftBorder: "border-l-teal-400",
        labelColor: "text-teal-400",
        label: "POSITION",
    },
    team_order: {
        Icon: Users,
        leftBorder: "border-l-pink-400",
        labelColor: "text-pink-400",
        label: "TEAM ORDER",
    },
};

export default function LogRow({ log }: { log: Log }) {
    const style = LOG_STYLES[log.type] ?? {
        Icon: log.icon ?? Swords,
        leftBorder:
            log.variant === "primary"
                ? "border-l-primary"
                : "border-l-secondary",
        labelColor:
            log.colorClass ||
            (log.variant === "primary"
                ? "text-primary"
                : "text-secondary"),
        label: "EVENT",
    };

    const { Icon, leftBorder, labelColor, label } = style;

    const hasDamage = typeof log.damage === "number" && log.damage > 0;
    const hasHealing = typeof log.healing === "number" && log.healing > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2",
                "rounded-r-lg border-l-2 bg-muted/15",
                "text-[10px] sm:text-[11px]",
                leftBorder
            )}
        >
            {/* Event icon */}
            <Icon
                className={cn(
                    "size-3 sm:size-3.5 shrink-0",
                    labelColor
                )}
            />

            {/* Event type */}
            <span
                className={cn(
                    "font-black text-[9px] sm:text-[10px]",
                    "tracking-wide shrink-0",
                    labelColor
                )}
            >
                {label}
            </span>

            {/* Event description */}
            <span className="text-foreground/85 truncate min-w-0 flex-1">
                {log.text}
            </span>

            {/* Damage */}
            {hasDamage && (
                <span className="text-rose-400 font-bold shrink-0">
                    -{log.damage} HP
                </span>
            )}

            {/* Healing */}
            {hasHealing && (
                <span className="text-emerald-400 font-bold shrink-0">
                    +{log.healing} HP
                </span>
            )}

            {/* Power / action name */}
            {(log.powerName || log.actionName) && (
                <span
                    className={cn(
                        "text-muted-foreground/60 text-[8.5px] sm:text-[9.5px]",
                        "shrink-0 hidden sm:block truncate max-w-[110px]"
                    )}
                >
                    {log.powerName || log.actionName}
                </span>
            )}
        </motion.div>
    );
}
