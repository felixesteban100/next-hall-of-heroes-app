"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, Handshake } from "lucide-react";
import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { CharacterImage } from "../shared/CharacterImage";

interface MatchPredictionOverlayProps {
    entityAName: string;
    entityBName: string;
    entitiesA: CharacterWithJoinTeamUniversePowerEnemies[];
    entitiesB: CharacterWithJoinTeamUniversePowerEnemies[];
    actualWinner: "A" | "B" | "Draw";
    onReveal: () => void;
}

export function MatchPredictionOverlay({
    entityAName,
    entityBName,
    entitiesA,
    entitiesB,
    actualWinner,
    onReveal,
}: MatchPredictionOverlayProps) {
    const [userPick, setUserPick] = useState<"A" | "B" | "Draw" | null>(null);
    const [isResolved, setIsResolved] = useState<boolean>(false);

    const handleVote = (choice: "A" | "B" | "Draw") => {
        setUserPick(choice);
        setIsResolved(true);
        setTimeout(() => {
            onReveal();
        }, 1200);
    };

    const isCorrect = userPick === actualWinner;

    // Helper to extract a display label for the team or individual
    const getSideLabel = (entities: CharacterWithJoinTeamUniversePowerEnemies[], defaultLabel: string) => {
        if (entities.length === 0) return defaultLabel;
        if (entities.length === 1) return entities[0].name;
        return `${entities[0].name} +${entities.length - 1} more`;
    };

    const labelA = getSideLabel(entitiesA, "Team A");
    const labelB = getSideLabel(entitiesB, "Team B");

    return (
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-8 sm:pt-12 bg-background/80 backdrop-blur-md rounded-2xl p-4 transition-all">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="sticky top-12 flex flex-col items-center gap-4 bg-card border border-border/80 p-6 rounded-2xl shadow-xl max-w-md w-full text-center"
            >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    {entitiesA.length > 1 || entitiesB.length > 1
                        ? "Which Team Takes The Win?"
                        : "Who Wins This Match?"}
                </div>

                {!isResolved ? (
                    <div className="flex flex-col gap-2.5 w-full mt-2">
                        <div className="grid grid-cols-2 gap-3 w-full">
                            {/* Side A Vote Button */}
                            <button
                                onClick={() => handleVote("A")}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/40 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group"
                            >
                                <div className="flex -space-x-2 overflow-hidden justify-center my-1">
                                    {entitiesA.slice(0, 3).map((ent, idx) => (
                                        <div
                                            key={ent.id || idx}
                                            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-background shrink-0 bg-muted"
                                        >
                                            <CharacterImage
                                                src={ent.images.md}
                                                alt={ent.name}
                                                imageFocus={ent.imageFocus}
                                                fill
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-bold truncate w-full text-primary/50 group-hover:text-primary">
                                    {entityAName}
                                </span>
                                <span className="text-xs font-semibold truncate w-full group-hover:text-primary ">
                                    {labelA}
                                </span>
                            </button>

                            {/* Side B Vote Button */}
                            <button
                                onClick={() => handleVote("B")}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/40 hover:bg-secondary/10 hover:border-secondary transition-all cursor-pointer group"
                            >
                                <div className="flex -space-x-2 overflow-hidden justify-center my-1">
                                    {entitiesB.slice(0, 3).map((ent, idx) => (
                                        <div
                                            key={ent.id || idx}
                                            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-background shrink-0 bg-muted"
                                        >
                                            <CharacterImage
                                                src={ent.images.md}
                                                alt={ent.name}
                                                imageFocus={ent.imageFocus}
                                                fill
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-bold truncate w-full text-secondary/50 group-hover:text-secondary">
                                    {entityBName}
                                </span>
                                <span className="text-xs font-semibold truncate w-full group-hover:text-secondary">
                                    {labelB}
                                </span>
                            </button>
                        </div>

                        {/* 👉 Toss-up / Draw Button Added Here */}
                        <button
                            onClick={() => handleVote("Draw")}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted font-semibold text-xs transition-all cursor-pointer text-muted-foreground hover:text-foreground w-full"
                        >
                            <Handshake className="w-4 h-4 text-muted-foreground" />
                            Too Close / Toss-up (Draw)
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 py-4 w-full"
                    >
                        {isCorrect ? (
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl w-full justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                                Spot on! Revealing stats...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-xl w-full justify-center">
                                <XCircle className="w-5 h-5" />
                                Not quite! Revealing stats...
                            </div>
                        )}
                    </motion.div>
                )}

                <button
                    onClick={onReveal}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer mt-1"
                >
                    Skip prediction & reveal stats
                </button>
            </motion.div>
        </div>
    );
}