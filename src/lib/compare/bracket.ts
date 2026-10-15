export type BracketFighter = {
    id: string | number;
    name: string;
    overall?: number;
    image: string;
    imageFocus?: string;
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

    const rounds: Bout[][] = [];
    const allBouts: Bout[] = [];

    const getRoundName = (roundIdx: number, totalRounds: number) => {
        const remaining = totalRounds - roundIdx;
        if (remaining === 1) return "Finals";
        if (remaining === 2) return "Semifinals";
        if (remaining === 3) return "Quarterfinals";
        if (remaining === 4) return "Round of 16";
        return `Round ${roundIdx + 1}`;
    };

    // --- Round 1 ---
    const round1Bouts: Bout[] = [];
    const n = fighters.length;
    const half = Math.ceil(n / 2);

    for (let i = 0; i < half; i++) {
        const fighterA = fighters[i * 2] || null;
        const fighterB = fighters[i * 2 + 1] || null;

        // If one side is null, they automatically win/advance
        const winner = !fighterB ? fighterA : (!fighterA ? fighterB : evaluateWinner(fighterA, fighterB).winner);
        const scoreA = fighterA && fighterB ? evaluateWinner(fighterA, fighterB).scoreA : (fighterA ? 100000 : null);
        const scoreB = fighterA && fighterB ? evaluateWinner(fighterA, fighterB).scoreB : (fighterB ? 100000 : null);

        const bout: Bout = {
            id: `r0-b${i}`,
            roundIndex: 0,
            roundName: "Round 1", // Will be normalized below based on total rounds
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
    let currentPrevRound = round1Bouts;
    let r = 1;

    while (currentPrevRound.length > 1) {
        const currentRoundBouts: Bout[] = [];
        for (let i = 0; i < currentPrevRound.length; i += 2) {
            const boutA = currentPrevRound[i];
            const boutB = currentPrevRound[i + 1];

            const fighterA = boutA ? boutA.winner : null;
            const fighterB = boutB ? boutB.winner : null;

            const winner = !fighterB ? fighterA : (!fighterA ? fighterB : evaluateWinner(fighterA, fighterB).winner);
            const scoreA = fighterA && fighterB ? evaluateWinner(fighterA, fighterB).scoreA : (fighterA ? 100000 : null);
            const scoreB = fighterA && fighterB ? evaluateWinner(fighterA, fighterB).scoreB : (fighterB ? 100000 : null);

            const bout: Bout = {
                id: `r${r}-b${Math.floor(i / 2)}`,
                roundIndex: r,
                roundName: "",
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
        currentPrevRound = currentRoundBouts;
        r++;
    }

    // Fix round names dynamically based on actual total rounds calculated
    const totalRounds = rounds.length;
    rounds.forEach((roundBouts, rIdx) => {
        const name = getRoundName(rIdx, totalRounds);
        roundBouts.forEach((b) => {
            b.roundName = name;
        });
    });

    return { rounds, allBouts };
}