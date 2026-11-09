import { getCharacterThematicMix, getPowerThematicMix } from "@/lib/character_utils";
import { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";

type ScoreBadgeOnCardProps = {
    entity: CharacterWithJoinTeamUniversePowerEnemies | Power,
    score: number | string,
    side: "front" | "back"
}

export default function ScoreBadgeOnCard({ entity, score, side }: ScoreBadgeOnCardProps) {
    const style = "powerstats" in entity
        ? getCharacterThematicMix(entity)
        : getPowerThematicMix(entity);

    const sideStyle = side == "front"
        ? "-top-2 -left-2 z-30"
        : "-top-2 -right-2 -z-1";

    const textStr = String(score);
    const svgFontSize = textStr.length > 3 ? "38" : textStr.length > 2 ? "42" : "48";

    return (
        <div
            title={`${entity.name} score`}
            className={`absolute ${sideStyle} flex items-center justify-center border-2 md:border-[3px] rounded-full aspect-square shadow-lg select-none`}
            style={{
                ...style,
                width: "clamp(1.75rem, 18%, 4.2rem)",
            }}
        >
            <div className={`flex items-center justify-center overflow-hidden`}>
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <text
                        x="50"
                        y="52"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize={svgFontSize}
                        className={`tracking-tighter font-bold`}
                    >
                        {score}
                    </text>
                </svg>
            </div>
        </div>
    );
}