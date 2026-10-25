import { EnrichedFighter } from "../CinematicCombatView";
import Avatar from "./Avatar";

export default function TeamColumn({
    fighters, variant, mvp,
    activeAttacker, activeDefender, latestKO, latestHeal, latestRevive, latestDefend,
    isDialog,
}: {
    fighters: EnrichedFighter[];
    variant: "primary" | "secondary";
    mvp?: string;
    activeAttacker?: string;
    activeDefender?: string;
    latestKO?: string;
    latestHeal?: string;
    latestRevive?: string;
    latestDefend?: string;
    isDialog?: boolean;
}) {
    const count = fighters.length;
    const avatarPx = isDialog
        ? count <= 4 ? 48 : count <= 8 ? 40 : count <= 12 ? 34 : 28
        : count <= 4 ? 44 : count <= 8 ? 38 : count <= 12 ? 32 : 28;

    return (
        <div className="flex flex-col items-center gap-2 w-full md:w-auto md:flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 justify-center max-h-[170px] md:max-h-none overflow-y-auto no-scrollbar w-full p-1 pt-3">
                {fighters.map((f) => (
                    <Avatar
                        key={f.id}
                        fighter={f}
                        size={avatarPx}
                        variant={variant}
                        isMvp={f.name === mvp}
                        isAttacking={activeAttacker === f.name}
                        isBeingHit={activeDefender === f.name}
                        isKO={latestKO === f.name}
                        isHealing={latestHeal === f.name}
                        isReviving={latestRevive === f.name}
                        isDefending={latestDefend === f.name}
                    />
                ))}
            </div>
        </div>
    );
}