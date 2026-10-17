"use client"
import { ROUNDS } from './BattlePanel';

export default function SparSimulation({ result, nameA, nameB }: {
    result: {
        aWins: number;
        bWins: number;
        draws: number;
        aWinPct: number;
        bWinPct: number;
        drawPct: number;
    }, nameA: string, nameB: string
}) {

    const aPct = result ? (result.aWins / ROUNDS) * 100 : 0;
    const drawPct = result ? (result.draws / ROUNDS) * 100 : 0;
    const bPct = result ? (result.bWins / ROUNDS) * 100 : 0;
    return (
        <div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-lg font-black text-primary">{result.aWins}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{nameA}</p>
                </div>
                <div>
                    <p className="text-lg font-black text-muted-foreground">{result.draws}</p>
                    <p className="text-[10px] text-muted-foreground">Draws / Toss-ups</p>
                </div>
                <div>
                    <p className="text-lg font-black text-secondary">{result.bWins}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{nameB}</p>
                </div>
            </div>

            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div className="h-full bg-primary transition-all" style={{ width: `${aPct}%` }} />
                <div className="h-full bg-muted-foreground/40 transition-all" style={{ width: `${drawPct}%` }} />
                <div className="h-full bg-secondary transition-all" style={{ width: `${bPct}%` }} />
            </div>

            <p className="text-[10px] text-center text-muted-foreground">
                Toy model from overall scores — not canon. {nameA} win rate ≈ {Math.round(aPct)}%
            </p>
        </div>
    )
}
