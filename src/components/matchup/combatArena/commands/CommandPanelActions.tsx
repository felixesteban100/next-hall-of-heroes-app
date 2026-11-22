import type { ReactNode } from "react";
import { Shield, Swords, Zap } from "lucide-react";
import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import type { Power } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
    actor: CombatFighter;
    availablePowers: Power[];
    hasMaxShields: boolean;
    protectTargetCount: number;
    onBasicAttack: () => void;
    onUsePower: () => void;
    onDefend: () => void;
    onProtect: () => void;
};

export function CommandPanelActions({
    actor,
    availablePowers,
    hasMaxShields,
    protectTargetCount,
    onBasicAttack,
    onUsePower,
    onDefend,
    onProtect,
}: Props) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {actor.name}
                </span>
                <span className="text-[9px] font-bold text-primary">YOUR TURN</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
                <ActionButton
                    icon={<Swords className="size-4" />}
                    label="Attack"
                    onClick={onBasicAttack}
                    disabled={!actor.isAlive}
                    variant="attack"
                />
                <ActionButton
                    icon={<Zap className="size-4" />}
                    label="Power"
                    onClick={onUsePower}
                    disabled={availablePowers.length === 0}
                    variant="power"
                />
                <ActionButton
                    icon={<Shield className="size-4" />}
                    label="Defend"
                    onClick={onDefend}
                    disabled={!actor.isAlive || hasMaxShields}
                    variant="defend"
                />
                <ActionButton
                    icon={<Shield className="size-4" />}
                    label="Protect"
                    onClick={onProtect}
                    disabled={!actor.isAlive || protectTargetCount === 0}
                    variant="protect"
                />
            </div>
        </div>
    );
}

type ActionButtonProps = {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant: "attack" | "power" | "defend" | "protect";
};

function ActionButton({
    icon,
    label,
    onClick,
    disabled,
    variant,
}: ActionButtonProps) {
    const styles = {
        attack: "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10",
        power: "border-violet-500/20 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10",
        defend: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10",
        protect: "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex h-5 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-1.5",
                "text-[11px] font-bold transition-all active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-30",
                styles[variant]
            )}
        >
            {icon}
            <span className="truncate">{label}</span>
        </button>
    );
}
