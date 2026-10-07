import { Cell, EmptyCell } from "./Cell";
import { Row } from "./Row";
import { LucideIcon } from "lucide-react";

type RowBadgeProps = {
    label: string
    entityAAndLogoAExists: boolean
    entityBAndLogoBExists: boolean
    IconA: LucideIcon | null
    IconB: LucideIcon | null
    entityAClassName: string
    entityBClassName: string
    valueA: string
    valueB: string
}

export default function RowBadge({ label, entityAAndLogoAExists, entityBAndLogoBExists, IconA, IconB, entityAClassName, entityBClassName, valueB, valueA }: RowBadgeProps) {
    return (
        <Row label={label}>
            {entityAAndLogoAExists ? (
                <Cell
                    className={`${entityAClassName} font-bold`}
                >
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                        {IconA && <IconA className="size-3.5 sm:size-4 shrink-0" />}
                        <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center wrap-break max-w-full">
                            {valueA || "N/A"}
                        </span>
                    </div>
                </Cell>
            ) : (
                <EmptyCell />
            )}
            {entityBAndLogoBExists ? (
                <Cell
                    className={`${entityBClassName} font-bold`}
                >
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
                        {IconB && <IconB className="size-3.5 sm:size-4 shrink-0" />}
                        <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center wrap-break max-w-full">
                            {valueB || "N/A"}
                        </span>
                    </div>
                </Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    )
}
