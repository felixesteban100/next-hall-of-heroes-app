"use client";

type Props = {
    healthA: number;
    healthB: number;
    nameA: string;
    nameB: string;
};

export default function LiveTeamHealthBars({ healthA, healthB, nameA, nameB }: Props) {
    const getBarColor = (hp: number, isA: boolean) => {
        if (hp <= 25) return "bg-red-500";
        if (hp <= 50) return "bg-amber-500";
        return isA ? "bg-primary" : "bg-secondary";
    };

    return (
        // <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
            {/* Team A */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                    {/* <span className="text-primary truncate max-w-[60%]">{nameA}</span> */}
                    <span className="text-primary tabular-nums">HP {healthA}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(healthA, true)}`}
                        style={{ width: `${healthA}%` }}
                    />
                </div>
            </div>

            {/* Team B */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                    {/* <span className="text-secondary truncate max-w-[60%]">{nameB}</span> */}
                    <span className="text-secondary tabular-nums">HP {healthB}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(healthB, false)}`}
                        style={{ width: `${healthB}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// return (
//     <div className="grid grid-cols-2 gap-3 bg-muted/20 ">
//         <div className="space-y-1">
//             <div className="flex justify-between text-[10px] font-bold">
//                 <span className="text-primary truncate">{nameA} </span>
//                 <span>HP {healthA}%</span>
//             </div>
//             <div className="h-2 rounded-full bg-muted overflow-hidden border border-foreground/20">
//                 <div className="h-full bg-primary transition-all duration-500 " style={{ width: `${healthA}%` }} />
//             </div>
//         </div>
//         <div className="space-y-1">
//             <div className="flex justify-between text-[10px] font-bold">
//                 <span className="text-secondary truncate">{nameB} </span>
//                 <span>HP {healthB}%</span>
//             </div>
//             <div className="h-2 rounded-full bg-muted overflow-hidden border border-foreground/20">
//                 <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${healthB}%` }} />
//             </div>
//         </div>
//     </div>
// )
