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
    valueA: string | undefined
    valueB: string | undefined
}

export function RowBadge({ label, entityAAndLogoAExists, entityBAndLogoBExists, IconA, IconB, entityAClassName, entityBClassName, valueB, valueA }: RowBadgeProps) {
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

type AligmentIconProps = {
    name: string,
    icon: LucideIcon,
    className: string,
    value: string
}

type RowBadgesProps = {
    label: string
    entityAAndLogoAExists: boolean
    entityBAndLogoBExists: boolean
    aligmentsA: AligmentIconProps[]
    aligmentsB: AligmentIconProps[]
}

export function RowBadges({ label, entityAAndLogoAExists, entityBAndLogoBExists, aligmentsA, aligmentsB }: RowBadgesProps) {
    return (
        <Row label={label}>
            {entityAAndLogoAExists ? (
                <Cell className="flex flex-col gap-2">
                    {aligmentsA.map((c) => (
                        <div key={c.name} className={`${c.className} flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0`}>
                            {c.icon && <c.icon className="size-3.5 sm:size-4 shrink-0" />}
                            <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center wrap-break max-w-full">
                                {c.value || "N/A"}
                                {" "}
                                <span className="font-extralight text-sm text-foreground">
                                    ({c.name})
                                </span>
                            </span>

                        </div>
                    ))}
                </Cell>
            ) : (
                <EmptyCell />
            )}
            {entityBAndLogoBExists ? (
                <Cell className="flex flex-col gap-2">
                    {aligmentsB.map((c) => (
                        <div key={c.name} className={`${c.className} flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0`}>
                            {c.icon && <c.icon className="size-3.5 sm:size-4 shrink-0" />}
                            <span className="text-[10px] leading-tight sm:text-xs md:text-sm text-center wrap-break max-w-full font-bold">
                                {c.value || "N/A"}
                                {" "}
                                <span className="font-extralight text-sm text-foreground">
                                    ({c.name})
                                </span>
                            </span>

                        </div>
                    ))}
                </Cell>
            ) : (
                <EmptyCell />
            )}
        </Row>
    )
}
