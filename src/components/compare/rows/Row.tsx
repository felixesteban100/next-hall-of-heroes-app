import { PillList } from "../PillList";
import { Cell, EmptyCell } from "./Cell";

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[88px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] border-b border-muted-foreground/20 last:border-b-0 hover:bg-muted-foreground/10 transition-colors">
            <div className="min-w-0 p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm font-semibold text-foreground uppercase tracking-wider border-r border-muted-foreground/20 flex items-center">
                {label}
            </div>
            {children}
        </div>
    );
}

type RowTextContentProps = {
    label: string
    entityAexist: boolean
    entityBexist: boolean
    entityAtext?: string | number
    entityBtext?: string | number
}

export function RowTextContent({ label, entityAexist, entityBexist, entityAtext, entityBtext }: RowTextContentProps) {
    return (
        <Row label={label}>
            {entityAexist ? (
                <Cell>{entityAtext || "N/A"}</Cell>
            ) : (
                <EmptyCell />
            )}
            {entityBexist ? (
                <Cell>{entityBtext || "N/A"}</Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    )
}

type RowPillContentProps = {
    label: string
    entityAexist: boolean
    entityBexist: boolean
    entityAPillList: string[]
    entityBPillList: string[]
}

export function RowPillContent({ entityAexist, entityBexist, label, entityAPillList, entityBPillList }: RowPillContentProps) {
    return (
        <Row label={label}>
            {entityAexist ? (
                <Cell>
                    <PillList items={entityAPillList} variant="primary" />
                </Cell>
            ) : (
                <EmptyCell />
            )}
            {entityBexist ? (
                <Cell>
                    <PillList items={entityBPillList} variant="secondary" />
                </Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    )
}