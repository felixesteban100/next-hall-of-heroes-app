export type BracketFighter = {
    id: string | number;
    name: string;
    overall?: number;
    image: string;
};

export type Bout = {
    id: string;
    roundIndex: number;
    roundName: string;
    a: BracketFighter | null;
    b: BracketFighter | null;
    winner: BracketFighter | null;
    scoreA: number | null;
    scoreB: number | null;
};

// Determines winner and mock score based on fighter stats/IDs
function evaluateWinner(
    a: BracketFighter | null,
    b: BracketFighter | null
): { winner: BracketFighter | null; scoreA: number | null; scoreB: number | null } {
    if (!a && !b) return { winner: null, scoreA: null, scoreB: null };
    if (!a) return { winner: b, scoreA: null, scoreB: 10 };
    if (!b) return { winner: a, scoreA: 10, scoreB: null };

    const scoreA = a.overall ?? 70 + (String(a.id).length % 25);
    const scoreB = b.overall ?? 70 + (String(b.id).length % 23);

    const winner = scoreA >= scoreB ? a : b;
    return { winner, scoreA, scoreB };
}

export function buildDynamicBracket(fighters: BracketFighter[]): {
    rounds: Bout[][];
    allBouts: Bout[];
} {
    if (fighters.length < 2) {
        return { rounds: [], allBouts: [] };
    }

    const n = fighters.length;
    // Find next power of 2 (e.g., 5 -> 8, 10 -> 16)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
    const totalRounds = Math.log2(bracketSize);

    // Pad fighters list with nulls for BYEs
    const paddedFighters: (BracketFighter | null)[] = [...fighters];
    while (paddedFighters.length < bracketSize) {
        paddedFighters.push(null);
    }

    const getRoundName = (roundIdx: number, total: number) => {
        const remaining = total - roundIdx;
        if (remaining === 1) return "Finals";
        if (remaining === 2) return "Semifinals";
        if (remaining === 3) return "Quarterfinals";
        if (remaining === 4) return "Round of 16";
        return `Round ${roundIdx + 1}`;
    };

    const rounds: Bout[][] = [];
    const allBouts: Bout[] = [];

    // --- Round 1 ---
    const round1Bouts: Bout[] = [];
    for (let i = 0; i < bracketSize / 2; i++) {
        const fighterA = paddedFighters[i * 2];
        const fighterB = paddedFighters[i * 2 + 1];
        const { winner, scoreA, scoreB } = evaluateWinner(fighterA, fighterB);

        const bout: Bout = {
            id: `r0-b${i}`,
            roundIndex: 0,
            roundName: getRoundName(0, totalRounds),
            a: fighterA,
            b: fighterB,
            winner,
            scoreA,
            scoreB,
        };
        round1Bouts.push(bout);
        allBouts.push(bout);
    }
    rounds.push(round1Bouts);

    // --- Subsequent Rounds ---
    for (let r = 1; r < totalRounds; r++) {
        const prevRound = rounds[r - 1];
        const currentRoundBouts: Bout[] = [];

        for (let i = 0; i < prevRound.length / 2; i++) {
            const boutA = prevRound[i * 2];
            const boutB = prevRound[i * 2 + 1];

            const fighterA = boutA.winner;
            const fighterB = boutB.winner;
            const { winner, scoreA, scoreB } = evaluateWinner(fighterA, fighterB);

            const bout: Bout = {
                id: `r${r}-b${i}`,
                roundIndex: r,
                roundName: getRoundName(r, totalRounds),
                a: fighterA,
                b: fighterB,
                winner,
                scoreA,
                scoreB,
            };
            currentRoundBouts.push(bout);
            allBouts.push(bout);
        }
        rounds.push(currentRoundBouts);
    }

    return { rounds, allBouts };
}