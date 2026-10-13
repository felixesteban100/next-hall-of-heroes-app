"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { BracketFighter, Bout, buildDynamicBracket } from "@/lib/compare/bracket";
import Image from "next/image";
import { shuffleArray } from "@/lib/utils";
import { CopySummaryButton } from "./CopySummaryButton";

function FighterLine({
    c,
    score,
    winnerId,
    userPrediction,
    accentColor,
    isVisible,
    showScores
}: {
    c: BracketFighter | null;
    score: number | null;
    winnerId?: number | string;
    userPrediction?: string | number | null;
    accentColor?: "primary" | "secondary";
    isVisible: boolean
    showScores: boolean
}) {
    const isWinner = Boolean(c && c.id && winnerId && c.id === winnerId && userPrediction != null);

    const winnerClasses = accentColor === "secondary"
        ? "border-secondary bg-secondary/20 font-bold text-secondary"
        : "border-primary bg-primary/20 font-bold text-primary";

    return (
        <div
            className={`flex justify-between items-center gap-2 text-xs sm:text-sm rounded-md px-2 py-1.5 border transition-all duration-300 ${isWinner
                ? winnerClasses
                : "border-transparent bg-muted/40 text-foreground"
                }`}
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-muted/60 overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                    {isVisible && c?.image &&
                        <Image
                            src={c.image}
                            alt={c?.name || "Fighter"}
                            fill
                            sizes="32px"
                            className="object-cover"
                            style={{
                                objectPosition: c.imageFocus ? `50% ${c.imageFocus.split(' ')[0]}` : "50% 18%"
                            }}
                        />}
                </div>

                <span className="truncate leading-tight font-medium">
                    {isVisible && c?.name && c.name !== "" ? c.name : "TBD"}
                </span>
            </div>

            <span className="tabular-nums text-muted-foreground text-xs shrink-0 font-mono">
                {showScores && score != null ? score.toFixed(1) : "—"}
            </span>
        </div>
    );
}

interface BoutCardProps {
    bout: Bout;
    isVisible: boolean;
    isCurrentStep: boolean;
    cardRef?: React.RefObject<HTMLDivElement | null>;
    isPendingVote?: boolean;
    userPrediction?: string | number | null;
    onVote?: (chosenFighterId: number) => void;
    isComplete: boolean;
}

function BoutCard({
    bout,
    isVisible,
    isCurrentStep,
    cardRef,
    isPendingVote = false,
    userPrediction = null,
    onVote,
    isComplete
}: BoutCardProps) {
    const isPredictionCorrect =
        userPrediction && bout.winner?.id ? userPrediction === bout.winner.id : null;

    const showScores = isComplete && isVisible && userPrediction != null;

    return (
        <motion.div
            ref={cardRef}
            animate={{
                opacity: isVisible || isPendingVote ? 1 : 0.35,
                scale: isCurrentStep || isPendingVote ? 1.03 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            /* 🚀 Increased width: w-48 sm:w-56 md:w-64 */
            className={`relative rounded-xl border bg-card p-2 sm:p-3 w-48 sm:w-56 md:w-64 space-y-2 shadow-sm transition-all duration-300 shrink-0 snap-center ${isPendingVote
                ? "border-amber-200/80 ring-2 ring-amber-200/30 shadow-md"
                : isCurrentStep
                    ? `border-foreground ring-2 ring-foreground/20`
                    : "border-border/60"
                }`}
        >
            <FighterLine
                c={bout.a}
                score={bout.scoreA}
                winnerId={bout.winner?.id}
                userPrediction={userPrediction}
                accentColor="primary"
                showScores={showScores}
                isVisible={isVisible}
            />
            <FighterLine
                c={bout.b}
                score={bout.scoreB}
                winnerId={bout.winner?.id}
                userPrediction={userPrediction}
                accentColor="secondary"
                showScores={showScores}
                isVisible={isVisible}
            />

            {isPendingVote ? (
                <div className="pt-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider animate-pulse">
                        Predict Winner
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 w-full">
                        <button
                            disabled={!bout.a}
                            onClick={() => bout.a && onVote?.(Number(bout.a.id))}
                            className="text-xs font-bold truncate p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {bout.a?.name ? bout.a.name/* .split(" ")[0] */ : "Fighter A"}
                        </button>
                        <button
                            disabled={!bout.b}
                            onClick={() => bout.b && onVote?.(Number(bout.b.id))}
                            className="text-xs font-bold truncate p-1.5 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {bout.b?.name ? bout.b.name/* .split(" ")[0] */ : "Fighter B"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between px-1 pt-0.5 min-h-4">
                    <p className="text-xs font-semibold truncate text-muted-foreground">
                        {isVisible && bout?.winner?.name ? `→ ${bout.winner.name}` : "\u00A0"}
                    </p>

                    {isVisible && isPredictionCorrect !== null && (
                        <span
                            className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${isPredictionCorrect
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                                }`}
                        >
                            {isPredictionCorrect ? "✓" : "✕"}
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export function DynamicBracketView({ fighters }: { fighters: BracketFighter[] }) {
    const { rounds, allBouts } = useMemo(
        () => buildDynamicBracket(shuffleArray(fighters)),
        [fighters]
    );

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [userPredictions, setUserPredictions] = useState<Record<string, number>>({});
    const [predictionResults, setPredictionResults] = useState<Record<string, boolean>>({});
    const [pendingVoteBoutId, setPendingVoteBoutId] = useState<string | null>(null);

    const fighterIdsKey = useMemo(() => fighters.map((f) => f.id).join(","), [fighters]);
    const activeCardRef = useRef<HTMLDivElement | null>(null);
    const maxSteps = allBouts.length;

    useEffect(() => {
        if (!isPlaying) return;

        if (currentStep > maxSteps) {
            setIsPlaying(false);
            return;
        }

        const currentBout = allBouts[currentStep - 1];

        if (currentBout && !userPredictions[currentBout.id]) {
            setIsPlaying(false);
            setPendingVoteBoutId(currentBout.id);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, 900);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, maxSteps, allBouts, userPredictions]);

    useEffect(() => {
        handleReset();
    }, [fighterIdsKey]);

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
        setUserPredictions({});
        setPredictionResults({});
        setPendingVoteBoutId(null);
    };

    const handleBracketVote = (boutId: string, chosenFighterId: number, actualWinnerId?: string | number) => {
        const isCorrect = chosenFighterId === actualWinnerId;

        setUserPredictions((prev) => ({ ...prev, [boutId]: chosenFighterId }));
        setPredictionResults((prev) => ({ ...prev, [boutId]: isCorrect }));
        setPendingVoteBoutId(null);

        setTimeout(() => {
            setIsPlaying(true);
            setCurrentStep((prev) => prev + 1);
        }, 800);
    };

    const isComplete = currentStep > maxSteps;
    const finalBout = allBouts[allBouts.length - 1];
    const champion = isComplete ? finalBout?.winner : null;

    const totalCorrectPredictions = Object.values(predictionResults).filter(Boolean).length;
    const totalPredictionsMade = Object.keys(predictionResults).length;

    if (fighters.length < 2) {
        return (
            <p className="text-center text-sm text-muted-foreground py-8">
                Select at least 2 characters to start a bracket comparison.
            </p>
        );
    }

    return (
        <div className="flex flex-col items-center py-3 sm:py-4 gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl shadow-sm w-full ">
                <div>
                    <h2 className="text-base font-bold">Tournament Bracket Simulation</h2>
                    <p className="text-xs text-muted-foreground">
                        Predict winners match-by-match as the tournament unfolds!
                    </p>
                </div>

                {totalPredictionsMade > 0 && (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold text-primary animate-in fade-in">
                        <span>🎯 Accuracy: {totalCorrectPredictions} / {totalPredictionsMade}</span>
                        {isComplete && <span className="ml-1">🏆 Tournament Complete!</span>}
                    </div>
                )}

                <CopySummaryButton
                    mode="bracket"
                    champion={champion}
                    totalCorrect={totalCorrectPredictions}
                    totalVoted={totalPredictionsMade}
                    fighterCount={fighters.length}
                    allBouts={allBouts}
                    userPredictions={userPredictions}
                />
            </div>

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
                    onClick={handleReset}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Reset Bracket"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Horizontal scroll container with larger cards */}
            <div className="w-full max-w-full overflow-x-auto pb-6 pt-2 px-2">
                <div className="flex flex-row gap-3 sm:gap-6 justify-start lg:justify-center items-center min-w-max px-4">
                    {rounds.map((roundBouts, rIdx) => {
                        const roundName = roundBouts[0]?.roundName ?? `Round ${rIdx + 1}`;
                        return (
                            <div key={rIdx} className="flex flex-col gap-3 justify-center">
                                <span className="text-xs font-bold text-muted-foreground text-center">
                                    {roundName}
                                </span>
                                {roundBouts.map((bout) => {
                                    const boutIndex = allBouts.findIndex((x) => x.id === bout.id);
                                    const isCurrentStep = boutIndex === currentStep - 1;
                                    const isPendingVote = pendingVoteBoutId === bout.id;

                                    return (
                                        <BoutCard
                                            key={bout.id}
                                            bout={bout}
                                            isVisible={boutIndex < currentStep}
                                            isCurrentStep={isCurrentStep}
                                            cardRef={isCurrentStep ? activeCardRef : undefined}
                                            isPendingVote={isPendingVote}
                                            userPrediction={userPredictions[bout.id]}
                                            onVote={(chosenId) => {
                                                if (bout.a && bout.b) {
                                                    handleBracketVote(bout.id, chosenId, bout.winner?.id);
                                                }
                                            }}
                                            isComplete={isComplete}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Champion Column */}
                    <div className="flex flex-col justify-center items-center gap-3">
                        <span className="text-xs font-bold text-transparent select-none">
                            Champion
                        </span>
                        <div
                            className={`p-4 rounded-xl border border-primary/40 bg-gradient-to-b from-primary/15 to-primary/5 text-center w-52 sm:w-60 shadow-md flex flex-col items-center gap-2 shrink-0 snap-center transition-opacity duration-300 ${champion ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        >
                            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-primary">
                                🏆 Tournament Champion
                            </span>

                            {champion?.image ? (
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary shadow-sm my-1">
                                    <Image
                                        src={champion.image}
                                        alt={champion.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                        style={{
                                            objectPosition: champion.imageFocus ? `50% ${champion.imageFocus.split(' ')[0]}` : "50% 18%"
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted my-1" />
                            )}

                            <p className="text-sm sm:text-base font-bold text-foreground truncate w-full">
                                {champion?.name || "Placeholder"}
                            </p>
                        </div>
                        {isComplete && (
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-xl text-xs font-bold text-primary">
                                Accuracy: {totalCorrectPredictions} / {totalPredictionsMade} Correct
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}