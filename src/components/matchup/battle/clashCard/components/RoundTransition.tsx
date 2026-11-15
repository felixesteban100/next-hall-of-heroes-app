
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { EVENT_STYLES } from "../constants/eventStyles";

import type { ActionEvent } from "@/lib/matchup/combat/adapters";

type Props = {
    event: ActionEvent;
};

export default function RoundTransition({ event }: Props) {
    const isRound = event.log.type === "round_start";
    const style = EVENT_STYLES[event.log.type] ?? EVENT_STYLES.round_start;
    const Icon = style.Icon;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex w-full h-full min-h-0 flex-col items-center justify-center gap-3 overflow-hidden px-6 text-center"
        >
            <div
                className={cn(
                    "p-3.5 rounded-full border",
                    style.bg,
                    style.border
                )}
            >
                <Icon className={cn("size-7 animate-pulse", style.text)} />
            </div>

            <div className="flex flex-col gap-1.5">
                <span
                    className={cn(
                        "text-xs font-black uppercase tracking-widest",
                        style.text
                    )}
                >
                    {isRound ? "Round Transition" : "Turn Initiative"}
                </span>

                <h3 className="text-base font-bold tracking-wide text-foreground">
                    {event.log.text}
                </h3>

                <p className="text-[10px] text-muted-foreground">
                    {isRound
                        ? "Preparing the next round..."
                        : "Preparing next engagements..."}
                </p>
            </div>
        </motion.div>
    );
}
