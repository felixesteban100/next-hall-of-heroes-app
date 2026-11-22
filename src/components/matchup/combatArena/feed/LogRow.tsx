// import {
//     Activity,
//     ArrowLeftRight,
//     ArrowUpDown,
//     Crown,
//     HeartPulse,
//     RefreshCw,
//     RotateCcw,
//     Shield,
//     Skull,
//     Sparkles,
//     Swords,
//     Users,
//     Zap,
//     type LucideIcon,
// } from "lucide-react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CombatEvent } from "@/lib/matchup/combat/types/types";
import { EVENT_STYLES } from "../clash/constants/eventStyles";

// type LogStyle = {
//     Icon: LucideIcon;
//     leftBorder: string;
//     labelColor: string;
//     label: string;
// };

// const LOG_STYLES: Record<string, LogStyle> = {
//     attack: { Icon: Swords, leftBorder: "border-l-orange-400", labelColor: "text-orange-400", label: "ATTACK" },
//     power: { Icon: Zap, leftBorder: "border-l-violet-400", labelColor: "text-violet-400", label: "POWER" },
//     defend: { Icon: Shield, leftBorder: "border-l-cyan-400", labelColor: "text-cyan-400", label: "BLOCK" },
//     heal: { Icon: HeartPulse, leftBorder: "border-l-emerald-400", labelColor: "text-emerald-400", label: "HEAL" },
//     revive: { Icon: RefreshCw, leftBorder: "border-l-purple-400", labelColor: "text-purple-400", label: "REVIVE" },
//     status_applied: { Icon: Sparkles, leftBorder: "border-l-fuchsia-400", labelColor: "text-fuchsia-400", label: "STATUS" },
//     status_tick: { Icon: Activity, leftBorder: "border-l-sky-400", labelColor: "text-sky-400", label: "EFFECT" },
//     ko: { Icon: Skull, leftBorder: "border-l-orange-500", labelColor: "text-orange-400", label: "K.O." },
//     battle_end: { Icon: Crown, leftBorder: "border-l-amber-400", labelColor: "text-amber-400", label: "BATTLE END" },
//     "turn_start-A": { Icon: RotateCcw, leftBorder: "border-l-blue-400", labelColor: "text-blue-400", label: "TURN" },
//     "turn_start-B": { Icon: RotateCcw, leftBorder: "border-l-blue-400", labelColor: "text-blue-400", label: "TURN" },
//     round_start: { Icon: ArrowUpDown, leftBorder: "border-l-indigo-400", labelColor: "text-indigo-400", label: "ROUND" },
//     swap_row: { Icon: ArrowLeftRight, leftBorder: "border-l-teal-400", labelColor: "text-teal-400", label: "POSITION" },
//     team_order: { Icon: Users, leftBorder: "border-l-pink-400", labelColor: "text-pink-400", label: "TEAM ORDER" },
// };

export default function LogRow({ event }: { event: CombatEvent }) {
    /* const style = LOG_STYLES[event.type] ?? {
        Icon: Swords,
        leftBorder: event.side === "A" ? "border-l-primary" : "border-l-secondary",
        labelColor: event.side === "A" ? "text-primary" : "text-secondary",
        label: "EVENT",
    }; */

    const style = EVENT_STYLES[event.type]
    const { Icon, border: leftBorder, text: labelColor, label } = style;
    const hasDamage = typeof event.damage === "number" && event.damage > 0;
    const hasHealing = typeof event.healing === "number" && event.healing > 0;

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
            <div className="flex min-w-0 items-center gap-2">
                <Icon className={cn("size-3 shrink-0 sm:size-3.5", labelColor)} />
                <span className={cn("shrink-0 text-[9px] font-black tracking-wide sm:text-[10px]", labelColor)}>
                    {label}
                </span>
                {event.powerName && (
                    <span className="min-w-0 truncate text-[8.5px] text-muted-foreground/60 sm:text-[9.5px]">
                        {event.powerName}
                    </span>
                )}
                <div className="flex-1" />
                {hasDamage && (
                    <span className="shrink-0 text-[10px] font-bold text-rose-400 sm:text-[11px]">
                        -{event.damage} HP
                    </span>
                )}
                {hasHealing && (
                    <span className="shrink-0 text-[10px] font-bold text-emerald-400 sm:text-[11px]">
                        +{event.healing} HP
                    </span>
                )}
            </div>

            <p className="mt-1.5 min-w-0 whitespace-normal break-words text-[10px] leading-relaxed text-foreground/85 sm:text-[11px]">
                {event.text}
            </p>
        </motion.div>
    );
}
