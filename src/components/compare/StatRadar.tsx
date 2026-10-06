"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

type Point = { stat: string; A: number; B: number; full?: string };

const COLOR_A = "#3b82f6"; // Entity A / primary look
const COLOR_B = "#a855f7"; // Entity B / secondary look

export function StatsRadar({
    data,
    nameA = "A",
    nameB = "B",
    showA,
    showB,
}: {
    data: Point[];
    nameA?: string;
    nameB?: string;
    showA: boolean;
    showB: boolean;
}) {
    if (!showA && !showB) {
        return (
            <p className="text-center text-sm text-muted-foreground py-8">
                Select characters to see combat radar
            </p>
        );
    }

    return (
        <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid className="stroke-muted-foreground/20" />
                    <PolarAngleAxis
                        dataKey="stat"
                        tick={{ fill: "currentColor", fontSize: 11 }}
                        className="text-muted-foreground"
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    {showA && (
                        <Radar
                            // name={nameA}
                            // dataKey="A"
                            // stroke="hsl(var(--primary))"
                            // fill="hsl(var(--primary))"
                            // fillOpacity={0.3}
                            // strokeWidth={2}
                            name={nameA}
                            dataKey="A"
                            stroke={COLOR_A}
                            fill={COLOR_A}
                            fillOpacity={0.3}
                            strokeWidth={2}
                            dot={{ r: 3, fill: COLOR_A }}
                        />
                    )}
                    {showB && (
                        <Radar
                            // name={nameB}
                            // dataKey="B"
                            // stroke="hsl(var(--secondary))"
                            // fill="hsl(var(--secondary))"
                            // fillOpacity={0.3}
                            // strokeWidth={2}
                            name={nameB}
                            dataKey="B"
                            stroke={COLOR_B}
                            fill={COLOR_B}
                            fillOpacity={0.3}
                            strokeWidth={2}
                            dot={{ r: 3, fill: COLOR_B }}
                        />
                    )}
                    <Legend
                        formatter={(value) => (
                            <span className="text-muted-foreground text-xs">{value}</span>
                        )}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(148,163,184,0.2)",
                            borderRadius: 8,
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}