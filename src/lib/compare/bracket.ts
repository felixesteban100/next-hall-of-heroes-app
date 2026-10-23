import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { computeMatchScore } from "./scoringUtils";

export type BracketFighter = {
    id: string | number;
    name: string;
    overall: number;
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

function getFighter(character: CharacterWithJoinTeamUniversePowerEnemies): BracketFighter {
    return {
        id: character.id,
        name: character.name,
        overall: computeMatchScore(character).overall,
        image: character.images.md,
        imageFocus: character.imageFocus,
    };
}

function evaluateWinner(
    a: BracketFighter | null,
    b: BracketFighter | null
): BracketFighter | null {
    if (!a && !b) return null
    if (!a) return b
    if (!b) return a

    const scoreA = a.overall;
    const scoreB = b.overall;

    const winner = scoreA >= scoreB ? a : b;
    return winner
}

export function buildDynamicBracket(characters: CharacterWithJoinTeamUniversePowerEnemies[]): {
    rounds: Bout[][];
    allBouts: Bout[];
} {
    if (characters.length < 2) {
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
    const n = characters.length;
    const half = Math.ceil(n / 2);

    for (let i = 0; i < half; i++) {
        const characterA = characters[i * 2] || null;
        const characterB = characters[i * 2 + 1] || null;
        const fighterA = characterA ? getFighter(characterA) : null
        const fighterB = characterB ? getFighter(characterB) : null

        const winner = evaluateWinner(fighterA, fighterB)

        const bout: Bout = {
            id: `r0-b${i}`,
            roundIndex: 0,
            roundName: "Round 1", // Will be normalized below based on total rounds
            a: fighterA,
            b: fighterB,
            winner,
            scoreA: fighterA?.overall ?? null,
            scoreB: fighterB?.overall ?? null,
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

            const winner = evaluateWinner(fighterA, fighterB)

            const bout: Bout = {
                id: `r${r}-b${Math.floor(i / 2)}`,
                roundIndex: r,
                roundName: "",
                a: fighterA,
                b: fighterB,
                winner,
                scoreA: fighterA?.overall ?? null,
                scoreB: fighterB?.overall ?? null,
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