import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function HPBar({ health, name, variant }: { health: number; name: string; variant: "primary" | "secondary" }) {
    const barColor = health > 60
        ? (variant === "primary" ? "bg-primary" : "bg-secondary")
        : health > 30 ? "bg-yellow-400" : "bg-red-500";

    return (
        <motion.div
            className="flex flex-col gap-1 flex-1 min-w-0"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.25 }}
            key={health} // Triggers a subtle pulse animation every time health updates
        >
            <div className="flex items-center justify-between gap-1.5 px-0.5">
                <span className={cn(
                    "text-[10px] sm:text-[11px] font-black uppercase tracking-wider truncate",
                    variant === "primary" ? "text-primary" : "text-secondary"
                )}>{name}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground/75 shrink-0">{Math.round(health)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden p-0.5 border border-muted-foreground/15">
                <motion.div
                    className={cn("h-full rounded-full", barColor)}
                    animate={{ width: `${Math.max(0, health)}%` }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    style={{ width: `${Math.max(0, health)}%` }}
                />
            </div>
        </motion.div>
    );
}