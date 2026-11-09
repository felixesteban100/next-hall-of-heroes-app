export function Cell({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`min-w-0 p-2 sm:p-3 md:p-4 text-center border-r border-muted-foreground/20 last:border-r-0 flex items-center justify-center text-xs sm:text-sm md:text-base ${className}`}
        >
            {children}
        </div>
    );
}

export function EmptyCell({ className = "" }: { className?: string }) {
    return (
        <Cell className={`text-muted-foreground/50 ${className}`}>
            —
        </Cell>
    );
}