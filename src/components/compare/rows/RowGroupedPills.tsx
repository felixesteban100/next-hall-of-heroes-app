// components/compare/rows/RowGroupedPills.tsx
import { Row } from "./Row";
import { Cell, EmptyCell } from "./Cell";
import type { GroupedItems } from "@/lib/compare_utls";

function GroupBlock({
    group,
    variant,
    sharedLabel = "Shared",
    pillClass = "",
    showNames
}: {
    group: GroupedItems;
    variant: "primary" | "secondary";
    sharedLabel?: string;
    pillClass?: string;
    showNames: boolean;
}) {
    const pill =
        variant === "primary"
            ? "bg-primary/15 text-primary border-primary/30"
            : "bg-secondary/15 text-secondary border-secondary/30";

    const Pill = ({ children }: { children: React.ReactNode }) => (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium ${pill}`}
        >
            {children}
        </span>
    );

    const empty =
        group.shared.length === 0 &&
        group.byCharacter.every((c) => c.items.length === 0);

    if (empty) {
        return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
        <div className="w-full space-y-3 text-left">
            {group.shared.map((s) => (
                <div key={s.name} className="group flex flex-col gap-0.5 items-start">
                    <span className={`${pillClass} group-hover:flex  `}>{s.name}</span>
                    <span className="text-[9px] text-muted-foreground pl-0.5">
                        {s.members.map((m) => m.name).join(" · ")}
                    </span>
                    {/* <span
                        className={pillClass}
                        title={s.members.map((m) => m.name).join(", ")}
                    >
                        {s.name}
                        <span className="opacity-60 ml-1">({s.members.length})</span>
                    </span> */}
                </div>
            ))}

            {group.byCharacter.map(
                (c) =>
                    c.items.length > 0 && (
                        <div key={c.id}>
                            {/* <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 truncate">
                                {c.name}
                            </p> */}
                            <div className="flex flex-wrap gap-1.5">
                                {c.items.map((t) => (
                                    <Pill key={`${c.id}-${t}`}>{t}</Pill>
                                ))}
                            </div>
                            {showNames && <p className="text-[10px] text-muted-foreground my-1 truncate">
                                {c.name}
                            </p>}
                        </div>
                    )
            )}
        </div>
    );
}

export function RowGroupedPills({
    label,
    groupA,
    groupB,
    hasA,
    hasB,
    showNames = false
}: {
    label: string;
    groupA: GroupedItems;
    groupB: GroupedItems;
    hasA: boolean;
    hasB: boolean;
    showNames?: boolean
}) {
    return (
        <Row label={label}>
            {hasA ? (
                <Cell className="items-start! justify-start!">
                    <GroupBlock group={groupA} variant="primary" showNames={showNames} />
                </Cell>
            ) : (
                <EmptyCell />
            )}
            {hasB ? (
                <Cell className="items-start! justify-start!">
                    <GroupBlock group={groupB} variant="secondary" showNames={showNames} />
                </Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    );
}