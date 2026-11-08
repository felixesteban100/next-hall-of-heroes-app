import { getCharacterThematicMix, getPowerThematicMix } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";

type ScoreBadgeOnCardProps = {
    entity: CharacterWithJoinTeamUniversePowerEnemies | Power,
    score: number | string
    side: "front" | "back"
}

export default function ScoreBadgeOnCard({ entity, score, side }: ScoreBadgeOnCardProps) {
    const style = "powerstats" in entity
        ? getCharacterThematicMix(entity)   // narrowed to CharacterWithJoinTeamUniversePowerEnemies ✅
        : getPowerThematicMix(entity);

    const sideStyle = side == "front"
        ? "-top-2 -left-2 z-30"
        : "-top-2 -right-2 z-[-1]";

    const scoreStr = String(score);
    // Automatically give decimals and 4-character scores a slightly safer clamp range to prevent overflow
    const svgFontSize = scoreStr.length > 3 ? "38" : scoreStr.length > 2 ? "42" : "48";

    return (
        <div
            title={`${entity.name} score`}
            // text-[15px] leading-none
            className={`absolute ${sideStyle} flex items-center justify-center border-2 md:border-[3px] rounded-full aspect-square font-black text-white shadow-lg select-none`}
            // className={`absolute ${sideStyle} flex items-center justify-center border-3 rounded-full aspect-square w-[13%] min-w-[1.5rem] max-w-[3rem] p-[2%] font-extrabold text-white`}
            // className="absolute -top-2 -left-2 z-30 w-[60%] h-[60%] md:w-[40%] md:h-[40%] rounded-full border-2 flex items-center justify-center text-[50%] font-black"
            style={{
                ...style,
                width: "clamp(1.75rem, 18%, 4.2rem)",
            }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <text
                    x="50"
                    y="52"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="currentColor"
                    fontWeight="900"
                    fontSize={svgFontSize}
                    className="tracking-tighter"
                >
                    {score}
                </text>
            </svg>
        </div >
    )
}