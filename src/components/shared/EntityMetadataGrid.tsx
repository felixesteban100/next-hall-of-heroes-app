import { LucideIcon } from "lucide-react";

export interface MetadataItem {
    icon: LucideIcon;
    label: string;
    value: React.ReactNode;
    href?: string;
}

interface EntityMetadataGridProps {
    items: MetadataItem[];
}

export function EntityMetadataGrid({ items }: EntityMetadataGridProps) {
    const validItems = items.filter((item) => item.value && item.value !== "-");

    if (validItems.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full my-4">
            {validItems.map(({ icon: Icon, label, value, href }, idx) => {
                const Content = (
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 backdrop-blur-xs hover:border-primary/40 transition-colors h-full">
                        <div className="p-2 rounded-lg bg-background border border-border/80 text-primary shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                {label}
                            </p>
                            <div className="text-sm font-semibold text-foreground break-words leading-tight mt-0.5">
                                {value}
                            </div>
                        </div>
                    </div>
                );

                if (href) {
                    return (
                        <a key={label + idx} href={href} className="block group">
                            {Content}
                        </a>
                    );
                }

                return <div key={label + idx}>{Content}</div>;
            })}
        </div>
    );
}