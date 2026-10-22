import { CharacterWithJoinTeamUniversePowerEnemies } from "@/types";
import { FighterState, Log } from "../BattlePanel";
import LiveTeamHealthBars from "./combatView/LiveTeamHealthBars";
import LiveRosterStatus from "./combatView/LiveRosterStatus";
import BattleTimelineLogs from "./combatView/BattleTimelineLogs";
import TacticalSummary from "./combatView/TacticalSummary";

type CombatViewProps = {
    result: {
        aWins: number;
        bWins: number;
        draws: number;
        aWinPct: number;
        bWinPct: number;
        drawPct: number;
    } | null;
    nameA: string;
    nameB: string;
    healthA: number;
    healthB: number;
    rosterA: FighterState[];
    rosterB: FighterState[];
    visibleLogs: Log[];
    isMounted: boolean;
    powerEstimateA: number;
    powerEstimateB: number;
    seed: number;
    isDialog: boolean;
    teamAChars: CharacterWithJoinTeamUniversePowerEnemies[];
    teamBChars: CharacterWithJoinTeamUniversePowerEnemies[];
};

export default function CombatView({
    isDialog,
    nameA,
    nameB,
    healthA,
    healthB,
    rosterA,
    rosterB,
    visibleLogs,
    isMounted,
    powerEstimateA,
    powerEstimateB,
    seed,
    teamAChars,
    teamBChars,
}: CombatViewProps) {

    if (isDialog) {
        return (
            <div className="flex flex-col gap-5 overflow-y-auto pr-2 p-5">
                <LiveTeamHealthBars healthA={healthA} healthB={healthB} nameA={nameA} nameB={nameB} />
                <LiveRosterStatus
                    rosterA={rosterA}
                    rosterB={rosterB}
                    teamAChars={teamAChars}
                    teamBChars={teamBChars}
                    nameA={nameA}
                    nameB={nameB}
                    latestLog={visibleLogs[visibleLogs.length - 1]}
                    isDialog={true}
                />
                <BattleTimelineLogs logs={visibleLogs} maxHeight="h-[220px]" />
            </div>
        );
    }

    // ── Inline (non-dialog) ──────────────────────────────────────────────────
    // const total = result.aWins + result.bWins + result.draws || 1;

    return (
        <div className="flex flex-col gap-4">
            {/* HP bars */}
            <LiveTeamHealthBars healthA={healthA} healthB={healthB} nameA={nameA} nameB={nameB} />

            {/* Roster */}
            <LiveRosterStatus
                rosterA={rosterA}
                rosterB={rosterB}
                teamAChars={teamAChars}
                teamBChars={teamBChars}
                nameA={nameA}
                nameB={nameB}
                latestLog={visibleLogs[visibleLogs.length - 1]}
                isDialog={false}
            />

            {/* Engagement log */}
            <BattleTimelineLogs logs={visibleLogs} maxHeight="h-[180px]" />

            {/* Tactical insight */}
            <TacticalSummary
                isMounted={isMounted}
                nameA={nameA}
                nameB={nameB}
                powerEstimateA={powerEstimateA}
                powerEstimateB={powerEstimateB}
                seed={seed}
            />
        </div>
    );
}
