export function ComparisonHeader({ title = "Character Comparator" }: { title?: string }) {
    return (
        <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="text-muted-foreground font-light flex gap-2 items-center justify-between">
                Select entities to analyze side-by-side stats, affiliations, and enemy listings.
            </div>
        </div>
    );
}