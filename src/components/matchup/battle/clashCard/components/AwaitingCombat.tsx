
import { Swords } from "lucide-react";

export default function AwaitingCombat() {
    return (
        <div className="flex w-full h-full min-h-0 flex-col items-center justify-center gap-2 overflow-hidden text-muted-foreground/30">
            <Swords className="size-8 animate-pulse" />

            <span className="text-[10px] uppercase tracking-widest font-semibold">
                Awaiting Combat
            </span>
        </div>
    );
}
