import { Progress } from "@/components/ui/progress";
import { Row } from "./Row";
import { Cell } from "./Cell";

export interface ScoreData {
    combat?: number;
    tier?: number;
    class?: number;
    powers?: number;
    threat?: number;
    weaknessPenalty?: number;
    overall?: number;
    [key: string]: number | undefined;
}

interface ScoreRowConfig {
    label: string;
    key: keyof ScoreData;
    isPenalty?: boolean;
    max?: number;
}

const DEFAULT_SCORE_ROWS: ScoreRowConfig[] = [
    { label: "Combat stats", key: "combat" },
    { label: "Tier", key: "tier" },
    { label: "Class", key: "class" },
    { label: "Powers", key: "powers" },
    { label: "Threat context", key: "threat" },
    { label: "Weakness penalty", key: "weaknessPenalty", isPenalty: true },
    { label: "Overall", key: "overall" },
];

interface RowScoreComparerProps {
    scoreA?: ScoreData | null;
    scoreB?: ScoreData | null;
    rows?: ScoreRowConfig[];
}

export function RowScoreComparer({
    scoreA,
    scoreB,
    rows = DEFAULT_SCORE_ROWS,
}: RowScoreComparerProps) {
    return (
        <>
            {rows.map(({ label, key, isPenalty, max = 100 }) => {
                const valA = scoreA?.[key];
                const valB = scoreB?.[key];

                const isAWinning = valA != null && valB != null && valA > valB;
                const isBWinning = valA != null && valB != null && valB > valA;

                // Format values (e.g. adding minus sign for penalties)
                const formatValue = (val?: number) => {
                    if (val == null) return "—";
                    return isPenalty || label.toLowerCase().includes("penalty") ? `−${val}` : val;
                };

                // Clamp progress value between 0 and max
                const getProgressValue = (val?: number) => {
                    if (val == null) return 0;
                    return Math.min(Math.max(val, 0), max);
                };

                return (
                    <Row key={label} label={label}>
                        {/* Side A */}
                        <Cell
                            className={`${isAWinning ? "text-primary font-bold" : "text-foreground"
                                } flex gap-2 items-center justify-end`}
                        >
                            {formatValue(valA)}
                            <Progress
                                value={getProgressValue(valA)}
                                indicatorClassName={`${isAWinning ? "bg-primary" : "bg-foreground/50"
                                    } rotate-180`}
                            />
                        </Cell>

                        {/* Side B */}
                        <Cell
                            className={`${isBWinning ? "text-secondary font-bold" : "text-foreground"
                                } flex gap-2 items-center justify-start`}
                        >
                            <Progress
                                value={getProgressValue(valB)}
                                indicatorClassName={
                                    isBWinning ? "bg-secondary" : "bg-foreground/50"
                                }
                            />
                            {formatValue(valB)}
                        </Cell>
                    </Row>
                );
            })}
        </>
    );
}