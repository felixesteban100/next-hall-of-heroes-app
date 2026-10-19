"use client"

export default function LiveTeamHealthBars({ healthA, nameA, healthB, nameB }: { healthA: number, nameA: string, healthB: number, nameB: string }) {
    return (
        <div className="grid grid-cols-2 gap-3 bg-muted/20 ">
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-primary truncate">{nameA} HP</span>
                    <span>{healthA}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden border border-foreground/20">
                    <div className="h-full bg-primary transition-all duration-500 " style={{ width: `${healthA}%` }} />
                </div>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-secondary truncate">{nameB} HP</span>
                    <span>{healthB}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden border border-foreground/20">
                    <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${healthB}%` }} />
                </div>
            </div>
        </div>
    )
}
