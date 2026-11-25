"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CommandPanel } from "./CommandPanel";


type Props = {
    actorId: number;
    position: {
        top: number;
        left: number;
    };
    onClose: () => void;
};

export default function CommandPanelPortal({
    actorId,
    position,
    onClose,
}: Props) {
    if (typeof document === "undefined") return null;

    const availableHeight = Math.max(
        100,
        window.innerHeight - position.top - 12
    );

    return createPortal(
        <AnimatePresence mode="popLayout">
            <motion.div
                key={`animate-dropdown-${actorId}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 22,
                }}
                className="fixed z-[30] w-[340px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl bg-background shadow-2xl ring-1 ring-border isolate"
                style={{
                    top: position.top,
                    left: position.left,
                    maxHeight: availableHeight,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <CommandPanel onClose={onClose} compact availableHeight={availableHeight} />
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}