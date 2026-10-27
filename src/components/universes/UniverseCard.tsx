import Image from "next/image";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Universe } from "@/types";
import { ViewTransition } from "react";
import { Globe, BookOpen, Layers, Hash, ImageIcon } from "lucide-react";
import { CHARACTER_TYPE_COLOR, CHARACTER_TYPE_ICON, CHARACTER_TYPE_LABEL } from "@/lib/constants";

type UniverseCardProps = {
    universe: Universe;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function UniverseCard({ universe, size }: UniverseCardProps) {
    const universeColor = CHARACTER_TYPE_COLOR[universe.type as keyof typeof CHARACTER_TYPE_COLOR]
    const UniverseIcon = CHARACTER_TYPE_ICON[universe.type as keyof typeof CHARACTER_TYPE_COLOR]

    return (
        <Card className="group h-full w-full flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 pt-0 overflow-hidden shadow-none hover:shadow-xl">
            <div className={`${size === "sm" ? "h-30" : "h-full md:max-h-50"} relative bg-muted/20 overflow-hidden flex items-center justify-center p-4`}>
                <ViewTransition name={`universe-${universe.id}`} share="morph">
                    {universe.background !== "" && (
                        <Image
                            src={universe.background}
                            alt={`${universe.name}'s background`}
                            className="absolute opacity-0 group-hover:opacity-100 w-full h-full object-cover transition-opacity duration-300"
                            width={800}
                            height={1200}
                        />
                    )}
                    <Image
                        src={`${universe.logo}`}
                        alt={`${universe.name}'s logo`}
                        className={`${universe.background !== "" && "group-hover:opacity-0"} max-h-full max-w-full object-contain transition-opacity duration-500`}
                        width={800}
                        height={1200}
                    />
                </ViewTransition>
            </div>

            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-5 shrink-0">
                <CardTitle className="text-lg font-bold transition-all duration-500 truncate" title={universe.name}>
                    {universe.name}
                </CardTitle>
                <span className="text-xs h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                    #{universe.id}
                </span>
            </CardHeader>

            <CardDescription className="px-5 pb-3 line-clamp-2 text-xs text-muted-foreground shrink-0">
                {universe.description || "No description available."}
            </CardDescription>

            <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-0">
                <div className="grid grid-cols-3 w-full divide-x divide-foreground/50 text-center text-xs">
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Type">
                        <UniverseIcon className={`w-3.5 h-3.5 ${universeColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{universe.type}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Comics">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-medium text-muted-foreground">{universe.comics?.length ?? 0} Gallery</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Canon Status">
                        <Hash className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-[10px] font-medium text-muted-foreground">{universe.id}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}


// import Image from "next/image";
// import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
// import { Universe } from "@/types";
// import { ViewTransition } from "react";

// type UniverseCardProps = {
//     universe: Universe;
//     size?: "default" | "sm" | "lg" | undefined;
// }

// export default function UniverseCard({ universe, size }: UniverseCardProps) {
//     return (
//         <Card /* size={size} */ className="group h-full justify-between hover:scale-102 transition-all duration-300 hover:shadow-xl pt-0">
//             {/* <div className="absolute inset-0 z-30 aspect-video dark:brightness-40" /> */}
//             <ViewTransition name={`universe-${universe.id}`} share="morph">
//                 <div className={`${size === "sm" ? "h-30" : size === "lg" ? "h-40" : "h-40"} relative rounded-t-xl `}>
//                     {/* <Image src={character.biography.publisher.logo} alt={`${character.name}'s image`} className="translate-y-5 group-hover:-translate-y-10 w-auto h-8 object-cover transition-all duration-500 animate-spin" width={800} height={1200} /> */}
//                     {universe.background !== "" &&
//                         <Image
//                             src={universe.background}
//                             alt={`${universe.name}'s background`}
//                             className={`absolute opacity-0 group-hover:opacity-100 w-full h-full object-cover transition-opacity duration-300`}
//                             width={800}
//                             height={1200}
//                             style={{ contain: "layout" }}
//                         />
//                     }
//                     <Image
//                         src={`${universe.logo}`}
//                         alt={`${universe.name}'s image`}
//                         // className={`w-full object-cover ${size === "sm" ? "h-30" : "h-40"} w-auto rounded-t-xl`}
//                         className={`${universe.background !== "" && "group-hover:opacity-0"} absolute inset-0 w-full h-full object-contain transition-opacity duration-800`}
//                         width={800}
//                         height={1200}
//                     />
//                 </div>
//             </ViewTransition>
//             <CardHeader>

//                 <CardTitle className="text-lg font-bold flex items-center justify-between gap-2 min-w-0">
//                     <span className="truncate" title={universe.name}>
//                         {universe.name}
//                     </span>
//                     <span className="text-xs text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
//                         #{universe.id}
//                     </span>
//                 </CardTitle>
//                 <CardDescription className="line-clamp-2 text-xs">
//                     {universe.description || "No description available."}
//                 </CardDescription>
//             </CardHeader>
//         </Card>
//     )
// }