import { Crown, HeartPulse, RefreshCw, Shield, Skull, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Log } from "../useCombatScript";


export default function LogRow({ log }: { log: Log }) {
    const { Icon, leftBorder, labelColor, label } = (() => {
        switch (log.type) {
            case "heal": return { Icon: HeartPulse, leftBorder: "border-l-emerald-400", labelColor: "text-emerald-400", label: "HEAL" };
            case "defend": return { Icon: Shield, leftBorder: "border-l-cyan-400", labelColor: "text-cyan-400", label: "BLOCK" };
            case "revive": return { Icon: RefreshCw, leftBorder: "border-l-purple-400", labelColor: "text-purple-400", label: "REVIVE" };
            case "ko": return { Icon: Skull, leftBorder: "border-l-orange-500", labelColor: "text-orange-400", label: "K.O." };
            case "finish": return { Icon: Crown, leftBorder: "border-l-amber-400", labelColor: "text-amber-400", label: "FINISH" };
            case "rout": return { Icon: Skull, leftBorder: "border-l-red-500", labelColor: "text-red-400", label: "ROUT" };
            default:
                return {
                    Icon: log.icon ?? Swords,
                    leftBorder: log.variant === "primary" ? "border-l-primary" : "border-l-secondary",
                    labelColor: log.variant === "primary" ? "text-primary" : "text-secondary",
                    label: "HIT",
                };
        }
    })();

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-r-lg border-l-2 bg-muted/15 text-[10px] sm:text-[11px]",
                leftBorder
            )}
        >
            <Icon className={cn("size-3 sm:size-3.5 shrink-0", labelColor)} />
            <span className={cn("font-black text-[9px] sm:text-[10px] tracking-wide shrink-0", labelColor)}>{label}</span>
            {log.attackerName && (
                <span className="font-semibold text-foreground/90 truncate">
                    {log.attackerName}
                    {log.defenderName && log.defenderName !== log.attackerName && (
                        <span className="text-muted-foreground font-normal"> → {log.defenderName}</span>
                    )}
                </span>
            )}
            {!log.attackerName && log.defenderName && (
                <span className="text-foreground/80 truncate">{log.defenderName}</span>
            )}
            {log.powerName && (
                <span className="ml-auto text-muted-foreground/60 text-[8.5px] sm:text-[9.5px] shrink-0 hidden sm:block truncate max-w-[90px]">
                    {log.powerName}
                </span>
            )}
        </motion.div>
    );
}