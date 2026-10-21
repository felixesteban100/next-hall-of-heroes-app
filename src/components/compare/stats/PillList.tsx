interface PillListProps {
    items: string[];
    variant: "primary" | "secondary";
}

export function PillList({ items, variant }: PillListProps) {
    const pillStyle =
        variant === "primary"
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-secondary/10 text-secondary border-secondary/20";

    if (!items || items.length === 0) {
        return <span className="text-muted-foreground text-xs italic">None listed</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5 justify-center">
            {items.map((item, idx) => (
                <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${pillStyle}`}
                >
                    {item}
                </span>
            ))}
        </div>
    );
}