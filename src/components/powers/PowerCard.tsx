import Image from "next/image";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Power } from "@/types";
import { ViewTransition } from "react";
import { POWER_TIER_ICON, POWER_TIER_COLOR, POWER_TIER, POWER_COMBAT_ROLE_ICON, POWER_COMBAT_ROLE_COLOR, POWER_ACTIVATION_TYPE_ICON, POWER_ACTIVATION_TYPE_COLOR } from "@/lib/constants";
import { Activity, Zap } from "lucide-react";

type PowerCardProps = {
    power: Power;
    size?: "default" | "sm" | "lg" | undefined;
}

export default function PowerCard({ power, size }: PowerCardProps) {
    const TierIcon = POWER_TIER_ICON[power.tier] ?? POWER_TIER_ICON[0];
    const tierColor = POWER_TIER_COLOR[power.tier as keyof typeof POWER_TIER_COLOR] ?? POWER_TIER_COLOR[0];
    const powerTierLabel = POWER_TIER[power.tier as keyof typeof POWER_TIER] ?? "Unrated";

    const RoleIcon = POWER_COMBAT_ROLE_ICON[power.combatRole] ?? Activity;
    const roleColor = POWER_COMBAT_ROLE_COLOR[power.combatRole]?.text ?? "text-muted-foreground";

    const ActivationIcon = POWER_ACTIVATION_TYPE_ICON[power.activationType] ?? Activity;
    const activationColor = POWER_ACTIVATION_TYPE_COLOR[power.activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR]?.text ?? "text-muted-foreground";

    return (
        <Card className="group w-full max-w-xs sm:max-w-sm flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 pt-0 overflow-hidden shadow-md hover:shadow-xl bg-card border border-border/60 rounded-2xl mx-auto">
            {/* Image Container */}
            <div className={`${size === "sm" ? "h-24" : "h-32"} relative bg-muted/20 overflow-hidden shrink-0`}>
                <ViewTransition name={`power-${power.id}`} share="morph">
                    <Image
                        src={`${power.img}`}
                        alt={`${power.name}'s image`}
                        className="w-full h-full object-cover duration-500 group-hover:scale-110"
                        width={800}
                        height={1200}
                        unoptimized
                    />
                </ViewTransition>
            </div>

            {/* Header */}
            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-4 py-2.5 shrink-0">
                <CardTitle className="text-base font-bold transition-all duration-500 truncate" title={power.name}>
                    {power.name}
                </CardTitle>
                <span className="text-[11px] h-5 self-center text-muted-foreground font-medium shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                    #{power.id}
                </span>
            </CardHeader>

            {/* Description */}
            <CardDescription className="px-4 pb-3 line-clamp-2 text-xs text-muted-foreground shrink-0 font-light">
                {power.description || "No description available."}
            </CardDescription>

            {/* Footer Stats */}
            <CardFooter className="border-t border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-0 bg-muted/10">
                <div className="grid grid-cols-4 w-full divide-x divide-foreground/20 text-center text-xs">
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Power Tier">
                        <TierIcon className={`w-3.5 h-3.5 ${tierColor.text}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">T{power.tier || 0}/{powerTierLabel.split("/")[0]}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Activation Type">
                        <ActivationIcon className={`w-3.5 h-3.5 ${activationColor}`} />
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[65px]">
                            {power.activationType || "Instant"}
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Combat Role">
                        <RoleIcon className={`w-3.5 h-3.5 ${roleColor}`} />
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[65px]">
                            {power.combatRole?.split("/")[0].trim() || "Utility"}
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2" title="Actions Count">
                        <Zap className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[65px]">Acts-{power.actions ? power.actions.length : 0}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}