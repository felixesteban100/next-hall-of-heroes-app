import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { ScriptItem } from "../BattlePanel";

export default function ControlToolbar({
    onReset,
    handleNextStep,
    handlePrevStep,
    currentStepIndex,
    combatScript,
    togglePlayPause,
    isPlaying,
}: {
    onReset: () => void;
    handleNextStep: () => void;
    handlePrevStep: () => void;
    currentStepIndex: number;
    combatScript: ScriptItem[];
    togglePlayPause: () => void;
    isPlaying: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={togglePlayPause}
                className="inline-flex items-center gap-1.5 rounded-xl border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
            >
                {isPlaying
                    ? <Pause className="size-3.5 text-primary animate-pulse" />
                    : <Play className="size-3.5 text-primary" />}
                {isPlaying ? "Pause" : combatScript.length === 0 ? "Start" : "AutoPlay"}
            </button>
            <button
                type="button"
                onClick={() => onReset()}
                title="Reset & Restart"
                className="inline-flex items-center justify-center size-7 rounded-lg border border-muted-foreground/20 hover:bg-muted transition-colors"
            >
                <RotateCcw className="size-3.5" />
            </button>
            <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex <= 0}
                title="Previous Step"
                className="inline-flex items-center justify-center size-7 rounded-lg border border-muted-foreground/20 hover:bg-muted transition-colors disabled:opacity-40"
            >
                <SkipBack className="size-3.5" />
            </button>
            <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIndex >= combatScript.length - 1}
                title="Next Step"
                className="inline-flex items-center justify-center size-7 rounded-lg border border-muted-foreground/20 hover:bg-muted transition-colors disabled:opacity-40"
            >
                <SkipForward className="size-3.5" />
            </button>

        </div>
    );
}