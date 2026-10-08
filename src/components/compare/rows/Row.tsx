
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
    /* hover:bg-muted-foreground/10 */
    return (
        <div className="grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] border-b border-muted-foreground/20 last:border-b-0  transition-colors">
            <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                {label}
            </div>
            {children}
        </div>
    );
}