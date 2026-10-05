interface StatBarProps {
    value: number;
    colorClass: string;
}

export function StatBar({ value, colorClass }: StatBarProps) {
    return (
        <div className="w-full flex items-center gap-3">
            <span className="w-8 text-right font-mono text-xs sm:text-sm font-bold text-foreground">
                {value}
            </span>
            <div className="flex-1 h-2 bg-card rounded-full overflow-hidden border border-muted-foreground/20">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}