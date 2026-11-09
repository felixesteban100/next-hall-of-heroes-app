import React from "react";
import { Shuffle, Zap } from "lucide-react";

type ActionControlsProps = {
    onRandomize?: () => void;
    onAutofill?: () => void;
    randomizeLabel?: string;
    autofillLabel?: string;
    size?: "sm" | "md";
};

export function ActionControls({
    onRandomize,
    onAutofill,
    randomizeLabel = "Random",
    autofillLabel = "Autofill",
    size = "md",
}: ActionControlsProps) {
    const isSmall = size === "sm";

    const buttonClasses = `flex items-center gap-1.5 font-semibold transition-all rounded-lg border shadow-sm select-none ${isSmall ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"
        }`;

    return (
        <div className="flex items-center gap-2">
            {/* Randomize / Chaos Button */}
            {onRandomize && (
                <button
                    onClick={onRandomize}
                    title="Randomize slots"
                    className={`${buttonClasses} bg-secondary/50 hover:bg-secondary text-secondary-foreground border-border/60`}
                >
                    <Shuffle className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
                    <span>{randomizeLabel}</span>
                </button>
            )}

            {/* Autofill / Smart Fill Button */}
            {onAutofill && (
                <button
                    onClick={onAutofill}
                    title="Smart autofill slots"
                    className={`${buttonClasses} bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30`}
                >
                    <Zap className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
                    <span>{autofillLabel}</span>
                </button>
            )}
        </div>
    );
}