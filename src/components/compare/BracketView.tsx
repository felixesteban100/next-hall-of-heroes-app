"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, User } from "lucide-react";
import { BracketFighter, Bout, buildDynamicBracket } from "@/lib/compare/bracket";
import Image from "next/image";

function FighterLine({
    c,
    score,
    winnerId,
    isActiveWinner,
}: {
    c: BracketFighter | null;
    score: number | null;
    winnerId?: number | string;
    isActiveWinner?: boolean;
}) {
    const isWinner = Boolean(c && c.id && c.id === winnerId);
    const hasImage = Boolean(c?.image);

    return (
        <div
            className={`flex justify-between items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] rounded-md px-1.5 py-1 border transition-all duration-300 ${isWinner && isActiveWinner
                ? "border-primary bg-primary/20 font-bold text-primary scale-[1.01]"
                : isWinner
                    ? "border-primary/50 bg-primary/10 font-semibold text-primary"
                    : "border-transparent bg-muted/40 text-foreground"
                }`}
        >
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                <div className="relative h-4 w-4 sm:h-5 sm:w-5 rounded-md bg-muted/60 overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                    {hasImage ? (
                        <Image
                            src={c!.image}
                            alt={c?.name || "Fighter"}
                            fill
                            sizes="20px"
                            className="object-cover"
                        />
                    ) : (
                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground/60" />
                    )}
                </div>

                <span className="truncate leading-none">{c?.name && c.name !== "" ? c.name : "TBD"}</span>
            </div>

            <span className="tabular-nums text-muted-foreground text-[9px] sm:text-[10px] shrink-0 font-mono">
                {score != null ? score.toFixed(1) : "—"}
            </span>
        </div>
    );
}

function BoutCard({
    bout,
    isVisible,
    isCurrentStep,
    cardRef,
}: {
    bout: Bout;
    isVisible: boolean;
    isCurrentStep: boolean;
    cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{
                opacity: isVisible ? 1 : 0.2,
                scale: isVisible ? 1 : 0.96,
                y: isVisible ? 0 : 4,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            /* Responsive Width: w-32 on small screens, w-36 on sm, w-40 on md */
            className={`rounded-lg border bg-card p-1 sm:p-1.5 w-32 sm:w-36 md:w-40 space-y-1 shadow-xs transition-colors duration-300 shrink-0 snap-center ${isCurrentStep
                ? "border-primary ring-2 ring-primary/20 shadow-sm"
                : "border-border/60"
                }`}
        >
            {isVisible && bout.a && bout.b ? (
                <>
                    <FighterLine
                        c={bout.a}
                        score={bout.scoreA}
                        winnerId={bout.winner?.id}
                        isActiveWinner={isCurrentStep}
                    />
                    <FighterLine
                        c={bout.b}
                        score={bout.scoreB}
                        winnerId={bout.winner?.id}
                        isActiveWinner={isCurrentStep}
                    />
                </>
            ) : (
                <>
                    <FighterLine c={null} score={null} />
                    <FighterLine c={null} score={null} />
                </>
            )}

            {bout.winner && isVisible && (
                <motion.p
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[8px] sm:text-[9px] text-primary font-semibold truncate px-0.5 pt-0.5"
                >
                    → {bout.winner.name}
                </motion.p>
            )}
        </motion.div>
    );
}

export function DynamicBracketView({ fighters }: { fighters: BracketFighter[] }) {
    const { rounds, allBouts } = useMemo(
        () => buildDynamicBracket(fighters),
        [fighters]
    );

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const activeCardRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const maxSteps = allBouts.length;

    useEffect(() => {
        if (!isPlaying) return;

        if (currentStep >= maxSteps) {
            setIsPlaying(false);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, 900);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, maxSteps]);

    // Smooth Auto-Centering on Mobile and Desktop
    useEffect(() => {
        if (currentStep > 0 && activeCardRef.current && containerRef.current) {
            const card = activeCardRef.current;
            const container = containerRef.current;

            // Compute center scroll offset for horizontal scroll view
            const scrollLeft =
                card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;

            container.scrollTo({
                left: scrollLeft,
                behavior: "smooth",
            });
        }
    }, [currentStep]);

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        if (currentStep < maxSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const isComplete = currentStep >= maxSteps;
    const finalBout = allBouts[allBouts.length - 1];
    const champion = isComplete ? finalBout?.winner : null;

    if (fighters.length < 2) {
        return (
            <p className="text-center text-sm text-muted-foreground py-8">
                Select at least 2 characters to start a bracket comparison.
            </p>
        );
    }

    return (
        <div className="flex flex-col items-center py-3 sm:py-4 gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
            {/* Playback Controls Bar */}
            <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-full border border-border/80 shadow-2xs">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={isComplete && !isPlaying}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? "Pause" : isComplete ? "Finished" : "Play"}
                </button>

                <button
                    onClick={handleStepForward}
                    disabled={isComplete || isPlaying}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                    title="Step Next"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <button
                    onClick={handleReset}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Reset Bracket"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Responsive Touch-Pan Scroll Container */}
            <div
                ref={containerRef}
                className="w-full max-w-full overflow-x-auto overflow-y-hidden touch-pan-x snap-x scroll-smooth pb-4 pt-1 px-2"
            >
                <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 justify-center items-center min-w-max px-2">
                    {rounds.map((roundBouts, rIdx) => {
                        const roundName = roundBouts[0]?.roundName ?? `Round ${rIdx + 1}`;
                        return (
                            <div key={rIdx} className="flex flex-col gap-2.5 sm:gap-3 justify-center">
                                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground text-center">
                                    {roundName}
                                </span>
                                {roundBouts.map((bout) => {
                                    const boutIndex = allBouts.findIndex((x) => x.id === bout.id);
                                    const isCurrentStep = boutIndex === currentStep - 1;

                                    return (
                                        <BoutCard
                                            key={bout.id}
                                            bout={bout}
                                            isVisible={boutIndex <= currentStep}
                                            isCurrentStep={isCurrentStep}
                                            cardRef={isCurrentStep ? activeCardRef : undefined}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Responsive Champion Badge */}
                    <div className="flex flex-col justify-center items-center gap-2">
                        <AnimatePresence>
                            {champion && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="p-2.5 sm:p-3 rounded-xl border border-primary/40 bg-gradient-to-b from-primary/15 to-primary/5 text-center w-32 sm:w-36 shadow-sm flex flex-col items-center gap-1 shrink-0 snap-center"
                                >
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold text-primary">
                                        🏆 Champion
                                    </span>

                                    {champion.image && (
                                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary shadow-xs my-0.5">
                                            <Image
                                                src={champion.image}
                                                alt={champion.name}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <p className="text-[11px] sm:text-xs font-bold text-foreground truncate w-full">
                                        {champion.name}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}