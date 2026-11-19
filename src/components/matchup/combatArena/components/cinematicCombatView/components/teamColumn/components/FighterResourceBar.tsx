"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
    size: number;
    current: number;
    previous?: number;
    max: number;
    label: "HP" | "EN" | "FAT";
    variant: "primary" | "secondary";
    colorMode?: "health" | "energy" | "fatigue";
    hold?: boolean;
    ready?: boolean;
    colorValue?: string;
};

export default function FighterResourceBar({
    size,
    current,
    previous,
    max,
    label,
    variant,
    colorMode = "energy",
    hold = false,
    ready = true,
    colorValue,
}: Props) {
    const safeMax = max > 0 ? max : 100;

    const shouldHold = hold && !ready;

    const [displayValue, setDisplayValue] = useState(
        shouldHold && previous !== undefined ? previous : current
    );

    useEffect(() => {
        if (shouldHold && previous !== undefined) {
            setDisplayValue(previous);
        } else {
            setDisplayValue(current);
        }
    }, [current, previous, shouldHold]);

    const percent = Math.max(
        0,
        Math.min(100, (displayValue / safeMax) * 100)
    );

    const barColor =
        colorMode === "health"
            ? percent > 50
                ? variant === "primary"
                    ? "bg-primary"
                    : "bg-secondary"
                : percent > 20
                    ? "bg-yellow-400"
                    : "bg-red-500"
            : colorMode === "fatigue"
                ? percent < 30
                    ? "bg-emerald-400"
                    : percent < 60
                        ? "bg-yellow-400"
                        : percent < 80
                            ? "bg-orange-500"
                            : "bg-red-500"
                : variant === "primary"
                    ? "bg-primary"
                    : "bg-secondary";

    return (
        <div style={{ width: size }} className="flex flex-col gap-0.5">
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden p-[0.5px] border border-muted-foreground/15">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700",
                        colorValue ? "" : barColor
                    )}
                    style={{
                        width: `${percent}%`,
                        background: colorValue
                    }}
                />
            </div>

            <span className="text-[7.5px] font-mono text-center text-muted-foreground/80 leading-none transition-all duration-700">
                {displayValue}/{safeMax} {label}
            </span>
        </div>
    );
}