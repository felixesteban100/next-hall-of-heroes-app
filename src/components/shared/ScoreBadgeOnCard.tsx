
import {
    getCharacterThematicMix,
    getPowerThematicMix,
} from "@/lib/character_utils";

import {
    CharacterWithJoinTeamUniversePowerEnemies,
    Power,
} from "@/types";

import { AnimatePresence, motion } from "framer-motion";

type ScoreBadgeOnCardProps = {
    entity: CharacterWithJoinTeamUniversePowerEnemies | Power;
    score: number | string;
    side: "front" | "back";
    conditionToRender?: boolean;
};

export default function ScoreBadgeOnCard({
    entity,
    score,
    side,
    conditionToRender = true,
}: ScoreBadgeOnCardProps) {
    const theme =
        "powerstats" in entity
            ? getCharacterThematicMix(entity)
            : getPowerThematicMix(entity);

    const isFront = side === "front";

    const textStr = String(score);
    const svgFontSize =
        textStr.length > 3 ? "38" :
            textStr.length > 2 ? "42" : "48";

    return (
        <AnimatePresence>
            {conditionToRender && (
                <motion.div
                    key={`score-badge-${entity.name}-${entity.id}`}
                    initial={{
                        opacity: 0,
                        scale: 0.15,
                        rotate: -35,
                        filter: "blur(8px)",
                    }}
                    animate={{
                        opacity: [0, 0.2, 0.05, 0.8, 1, 1],
                        scale: [0.15, 0.45, 0.65, 1.25, 0.9, 1],
                        rotate: [-35, -20, 10, -8, 4, 0],
                        filter: [
                            "blur(8px)",
                            "blur(5px)",
                            "blur(6px)",
                            "blur(2px)",
                            "blur(0px)",
                            "blur(0px)",
                        ],
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: 20,
                        filter: "blur(5px)",
                    }}
                    transition={{
                        duration: 0.8,
                        times: [0, 0.16, 0.32, 0.55, 0.78, 1],
                        ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                        top: "-0.5rem",
                        left: isFront ? "-0.5rem" : "auto",
                        right: isFront ? "auto" : "-0.5rem",
                        zIndex: isFront ? 30 : -1,
                        transformOrigin: "center",
                        width: "clamp(1.75rem, 18%, 4.2rem)",
                        aspectRatio: "1 / 1",
                        ...theme,
                    }}
                >
                    <div
                        title={`${entity.name} score`}
                        className="flex h-full w-full items-center justify-center rounded-full border-2 shadow-lg select-none md:border-[3px]"
                    >
                        <svg
                            viewBox="0 0 100 100"
                            className="h-full w-full overflow-visible"
                        >
                            <text
                                x="50"
                                y="52"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fill="white"
                                fontSize={svgFontSize}
                                className="font-bold tracking-tighter"
                            >
                                {score}
                            </text>
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}



// import { getCharacterThematicMix, getPowerThematicMix } from "@/lib/character_utils";
// import { CharacterWithJoinTeamUniversePowerEnemies, Power } from "@/types";
// import { AnimatePresence, motion } from "framer-motion";

// type ScoreBadgeOnCardProps = {
//     entity: CharacterWithJoinTeamUniversePowerEnemies | Power,
//     score: number | string,
//     side: "front" | "back",
//     conditionToRender?: boolean
// }

// export default function ScoreBadgeOnCard({ entity, score, side, conditionToRender = true }: ScoreBadgeOnCardProps) {
//     const style = "powerstats" in entity
//         ? getCharacterThematicMix(entity)
//         : getPowerThematicMix(entity);

//     const sideStyle = side == "front"
//         ? "-top-2 -left-2 z-30"
//         : "-top-2 -right-2 -z-1";

//     const textStr = String(score);
//     const svgFontSize = textStr.length > 3 ? "38" : textStr.length > 2 ? "42" : "48";

//     return (
//         <AnimatePresence>
//             {conditionToRender && (
//                 <motion.div
//                     key="score-badge"
//                     initial={{
//                         opacity: 0,
//                         scale: 0.15,
//                         rotate: -35,
//                         filter: "blur(8px)",
//                     }}
//                     animate={{
//                         opacity: [0, 0.2, 0.05, 0.8, 1, 1],
//                         scale: [0.15, 0.45, 0.65, 1.25, 0.9, 1],
//                         rotate: [-35, -20, 10, -8, 4, 0],
//                         filter: [
//                             "blur(8px)",
//                             "blur(5px)",
//                             "blur(6px)",
//                             "blur(2px)",
//                             "blur(0px)",
//                             "blur(0px)",
//                         ],
//                     }}
//                     exit={{
//                         opacity: 0,
//                         scale: 0.5,
//                         filter: "blur(5px)",
//                     }}
//                     transition={{
//                         duration: 0.8,
//                         times: [0, 0.16, 0.32, 0.55, 0.78, 1],
//                         ease: "easeInOut",
//                     }}
//                     style={{
//                         position: "absolute",
//                         // zIndex: side === "front" ? 30 : -30,
//                         transformOrigin: "center",
//                         pointerEvents: "none",
//                         ...style,
//                     }}
//                 >
//                     <div
//                         title={`${entity.name} score`}
//                         className={`absolute ${sideStyle} flex items-center justify-center border-2 md:border-[3px] rounded-full aspect-square shadow-lg select-none`}
//                         style={{
//                             ...style,
//                             width: "clamp(1.75rem, 18%, 4.2rem)",
//                         }}
//                     >
//                         <div className={`flex items-center justify-center overflow-hidden`}>
//                             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
//                                 <text
//                                     x="50"
//                                     y="52"
//                                     dominantBaseline="middle"
//                                     textAnchor="middle"
//                                     // fill="currentColor"
//                                     fill="white"
//                                     fontSize={svgFontSize}
//                                     className={`tracking-tighter font-bold`}
//                                 >
//                                     {score}
//                                 </text>
//                             </svg>
//                         </div>
//                     </div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// }