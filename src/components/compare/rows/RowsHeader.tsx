export function RowsHeader({ text }: { text: string }) {
    return <div className="bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/20">
        {text}
    </div>
}