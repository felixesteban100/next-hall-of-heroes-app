export function RowsHeader({ text }: { text: string }) {
    /*bg-muted border-b border-muted-foreground/20 */
    return <div className="bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-1">
        {text}
    </div>
}