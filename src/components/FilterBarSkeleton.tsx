export function FilterBarSkeleton() {
    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Top row: Search input + submit button */}
            <div className="flex gap-2">
                <div className="h-8 flex-1 animate-pulse rounded-md bg-muted/50" />
                <div className="h-8 w-10 animate-pulse rounded-md bg-muted/50 shrink-0" />
            </div>

            {/* Bottom row: Filter chips / Dropdowns + Sort group */}
            <div className="flex items-center justify-end gap-2">
                {/* <div className="flex-1 items-center gap-1.5 overflow-hidden">
                    <div className="h-8 w-20 animate-pulse rounded-md bg-muted/50 shrink-0" />
                    <div className="h-8 w-24 animate-pulse rounded-md bg-muted/50 shrink-0" />
                    <div className="h-8 w-24 animate-pulse rounded-md bg-muted/50 shrink-0 hidden sm:block" />
                </div> */}
                <div className="h-6 w-15 animate-pulse rounded-md bg-muted/50 shrink-0" />
                <div className="h-6 w-18 animate-pulse rounded-md bg-muted/50 shrink-0" />
            </div>
        </div>
    );
}