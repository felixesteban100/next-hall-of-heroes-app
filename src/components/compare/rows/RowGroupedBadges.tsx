// components/compare/rows/RowGroupedBadges.tsx
import Image from "next/image";
import { Row } from "./Row";
import { Cell, EmptyCell } from "./Cell";
import type { GroupedBadges, BadgeMeta, SharedBadge } from "@/lib/compare_utls";

function BadgeVisual({ item }: { item: BadgeMeta }) {
    const Icon = item.icon;
    return (
        <div className={`flex items-center gap-2 min-w-0 ${item.className ?? ""}`}>
            {item.imageSrc ? (
                <Image
                    src={item.imageSrc}
                    alt={item.imageAlt || item.value}
                    width={120}
                    height={48}
                    className="h-10 sm:h-12 w-auto object-contain"
                />
            ) : Icon ? (
                <>
                    <Icon className="size-3.5 sm:size-4 shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold break-words">
                        {item.value}
                    </span>
                </>
            ) : null}

        </div>
    );
}

function Side({ group, showNames }: { group: GroupedBadges, showNames: boolean }) {
    const empty =
        group.shared.length === 0 &&
        group.byCharacter.every((c) => c.items.length === 0);

    if (empty) {
        return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
        <div className="w-full space-y-3 text-left">
            {group.shared.length > 0 && (
                <div className="space-y-2">
                    {group.shared.map((s: SharedBadge) => (
                        <div key={s.key} className="flex flex-col gap-0.5">
                            <BadgeVisual item={s} />
                            {showNames && <span className="text-[9px] sm:text-[10px] text-muted-foreground pl-0.5">
                                {s.members.map((m) => m.name).join(" · ")}
                            </span>}
                        </div>
                    ))}
                </div>
            )}

            {group.byCharacter.map(
                (c) =>
                    c.items.length > 0 && (
                        <div key={c.id} className="space-y-1">
                            {/* <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                                {c.name}
                            </p> */}
                            {c.items.map((item) => (
                                <BadgeVisual key={item.key} item={item} />
                            ))}
                            {showNames && <p className="text-[10px] text-muted-foreground truncate ">
                                {c.name}
                            </p>}
                        </div>
                    )
            )}
        </div>
    );
}

export function RowGroupedBadges({
    label,
    hasA,
    hasB,
    groupA,
    groupB,
    showNames = false
}: {
    label: string;
    hasA: boolean;
    hasB: boolean;
    groupA: GroupedBadges;
    groupB: GroupedBadges;
    showNames?: boolean
}) {
    return (
        <Row label={label}>
            {hasA ? (
                <Cell className="!items-start !justify-start">
                    <Side group={groupA} showNames={showNames} />
                </Cell>
            ) : (
                <EmptyCell />
            )}
            {hasB ? (
                <Cell className="!items-start !justify-start">
                    <Side group={groupB} showNames={showNames} />
                </Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    );
}