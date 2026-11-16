
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
            log.side === "A"
                ? "border-l-primary"
                : "border-l-secondary",
        labelColor:
            log.colorClass ||
            (log.variant === "primary"
                ? "text-primary"
                : "text-secondary"),
        label: "EVENT",
    }

    const { Icon, leftBorder, labelColor, label } = style;

    const hasDamage = typeof log.damage === "number" && log.damage > 0;
    const hasHealing = typeof log.healing === "number" && log.healing > 0;


    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
                "min-w-0 rounded-r-lg border-l-[3px] bg-muted/15 px-2.5 py-2 sm:px-3 sm:py-2.5 shrink-0",
                leftBorder
            )}
        >
            {/* Event header */}
            <div className="flex min-w-0 items-center gap-2">
                {/* Event icon */}
                <Icon
                    className={cn(
                        "size-3 shrink-0 sm:size-3.5",
                        labelColor
                    )}
                />

                {/* Event type */}
                <span
                    className={cn(
                        "shrink-0 text-[9px] font-black tracking-wide sm:text-[10px]",
                        labelColor
                    )}
                >
                    {label}
                </span>

                {/* Power / action name */}
                {(log.powerName || log.actionName) && (
                    <span className="min-w-0 truncate text-[8.5px] text-muted-foreground/60 sm:text-[9.5px]">
                        {log.powerName || log.actionName}
                    </span>
                )}

                <div className="flex-1" />

                {/* Damage */}
                {hasDamage && (
                    <span className="shrink-0 text-[10px] font-bold text-rose-400 sm:text-[11px]">
                        -{log.damage} HP
                    </span>
                )}

                {/* Healing */}
                {hasHealing && (
                    <span className="shrink-0 text-[10px] font-bold text-emerald-400 sm:text-[11px]">
                        +{log.healing} HP
                    </span>
                )}
            </div>

            {/* Event description */}
            <p className="mt-1.5 min-w-0 whitespace-normal break-words text-[10px] leading-relaxed text-foreground/85 sm:text-[11px]">
                {log.text}
            </p>
        </motion.div>
    );


    // return (
    //     <motion.div
    //         initial={{ opacity: 0, x: -8 }}
    //         animate={{ opacity: 1, x: 0 }}
    //         transition={{ duration: 0.18 }}
    //         className={cn(
    //             "flex min-w-0 items-center gap-2 rounded-r-lg border-l-[3px] bg-muted/15 px-2.5 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-[11px]",
    //             leftBorder
    //         )}
    //     // className="flex items-center gap-2 test-border bg-muted/15 px-3 py-2"
    //     // style={{ borderLeft: "5px solid #ff0000" }}
    //     >
    //         {/* Event icon */}
    //         <Icon
    //             className={cn(
    //                 "size-3 sm:size-3.5 shrink-0",
    //                 labelColor
    //             )}
    //         />

    //         {/* Event type */}
    //         <span
    //             className={cn(
    //                 "font-black text-[9px] sm:text-[10px]",
    //                 "tracking-wide shrink-0",
    //                 labelColor
    //             )}
    //         >
    //             {label}
    //         </span>

    //         {/* Event description */}
    //         {/* truncate */}
    //         <span className="text-foreground/85 text-wrap min-w-0 flex-1">
    //             {log.text}
    //         </span>

    //         {/* Damage */}
    //         {hasDamage && (
    //             <span className="text-rose-400 font-bold shrink-0">
    //                 -{log.damage} HP
    //             </span>
    //         )}

    //         {/* Healing */}
    //         {hasHealing && (
    //             <span className="text-emerald-400 font-bold shrink-0">
    //                 +{log.healing} HP
    //             </span>
    //         )}

    //         {/* Power / action name */}
    //         {(log.powerName || log.actionName) && (
    //             <span
    //                 className={cn(
    //                     "text-muted-foreground/60 text-[8.5px] sm:text-[9.5px]",
    //                     "shrink-0 hidden sm:block truncate max-w-[110px]"
    //                 )}
    //             >
    //                 {log.powerName || log.actionName}
    //             </span>
    //         )}
    //     </motion.div>
    // );
}
