
"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { CommandPanel } from "../../../../CommandPanel";

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
                className="absolute z-[100] w-[340px] max-w-[calc(100vw-24px)] max-h-[min(420px,calc(100vh-24px))] overflow-y-auto rounded-xl bg-background shadow-2xl ring-1 ring-border isolate"
                style={{
                    top: position.top,
                    left: position.left,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <CommandPanel onClose={onClose} compact />
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
