import Image from "next/image";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Team } from "@/types";
import { ViewTransition } from "react";
import { Users, Crown } from "lucide-react";
import { getAligmentIcon } from "@/lib/characters_utils";
import { getCharacterAlignmentText, getCharacterAlignmentTextColor } from "@/lib/character_utils";

type TeamCardProps = {
    team: Team | Omit<Team, "universe">;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function TeamCard({ team, size }: TeamCardProps) {
    /* const alignmentColor =
        team.alignment === "good" ? "text-emerald-500" :
            team.alignment === "bad" ? "text-rose-500" : "text-amber-500"; */

    const alignmentColor = getCharacterAlignmentTextColor(team.alignment)
    const IconAligment = getAligmentIcon(team.alignment)

    return (
        <Card className="group h-full w-full flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 pt-0 overflow-hidden shadow-none hover:shadow-xl">
            <div className={`${size === "sm" ? "h-30" : "h-40"} relative bg-muted/20 overflow-hidden flex items-center justify-center p-4`}>
                <ViewTransition name={`team-${team.id}`} share="morph">
                    <Image
                        src={`${team.logo}`}
                        alt={`${team.name}'s logo`}
                        className="max-h-full max-w-full object-contain duration-500 group-hover:scale-110"
                        width={800}
                        height={1200}
                    />
                </ViewTransition>
            </div>

            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-5 shrink-0">
                <CardTitle className="text-lg font-bold transition-all duration-500 truncate" title={team.name}>
                    {team.name}
                </CardTitle>
                <span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                    #{team.id}
                </span>
            </CardHeader>

            <CardDescription className="px-5 pb-3 line-clamp-2 text-xs text-muted-foreground shrink-0">
                {team.description || "No description available."}
            </CardDescription>

            <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-0">
                <div className="grid grid-cols-3 w-full divide-x divide-foreground/50 text-center text-xs">
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Alignment">
                        <IconAligment className={`w-3.5 h-3.5 ${alignmentColor}`} />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{getCharacterAlignmentText(team.alignment)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Status">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{team.status || "Active"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Leaders">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-medium text-muted-foreground">{team.leaders?.length ?? 0} Leaders</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

// import Image from "next/image";
// import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
// import { Team } from "@/types";
// import { ViewTransition } from "react";

// type TeamCardProps = {
//     team: Team | Omit<Team, "universe">;
//     size?: "default" | "sm" | "lg" | undefined;
// }

// export default function TeamCard({ team, size }: TeamCardProps) {
//     return (
//         <Card /* size={size} */ className="h-full justify-between hover:scale-102 transition-all duration-300 hover:shadow-xl">
//             {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
//             <ViewTransition name={`team-${team.id}`} share="morph">
//                 <Image
//                     src={`${team.logo}`}
//                     alt={`${team.name}'s image`}
//                     className={`w-full object-contain ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-xl`}
//                     width={800}
//                     height={1200}
//                 />
//             </ViewTransition>
//             <CardHeader>
//                 <CardTitle className="text-lg font-bold flex items-center justify-between gap-2 min-w-0">
//                     <span className="truncate" title={team.name}>
//                         {team.name}
//                     </span>
//                     <span className="text-xs text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
//                         #{team.id}
//                     </span>
//                 </CardTitle>
//                 <CardDescription className="line-clamp-2 text-xs">
//                     {team.description || "No description available."}
//                 </CardDescription>
//             </CardHeader>
//         </Card>
//     )
// }