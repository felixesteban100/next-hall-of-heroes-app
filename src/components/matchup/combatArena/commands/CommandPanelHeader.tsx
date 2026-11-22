import type { CombatFighter } from "@/lib/matchup/combat/types/types";

type Props = {
    actor: CombatFighter;
    hpPercent: number;
    energyPercent: number;
};

export function CommandPanelHeader({ actor, hpPercent, energyPercent }: Props) {
    return (
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
            <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-muted">
                {actor.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={actor.image}
                        alt={actor.name}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: actor.imageFocus }}
                    />
                )}
                {!actor.isAlive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-[9px] font-black text-red-400">
                        K.O.
                    </div>
                )}
            </div>

            <div className="min-w-0 w-28 shrink-0">
                <p className="truncate text-xs font-bold">{actor.name}</p>
                <p className="text-[9px] text-muted-foreground">
                    {actor.isAlive ? "Ready to fight" : "Knocked Out"}
                </p>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between text-[9px]">
                        <span className="font-bold text-emerald-400">HP</span>
                        <span className="tabular-nums text-muted-foreground">
                            {actor.currentHp}/{actor.maxHp}
                        </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${hpPercent}%` }}
                        />
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between text-[9px]">
                        <span className="font-bold text-sky-400">EN</span>
                        <span className="tabular-nums text-muted-foreground">
                            {actor.energy}/{actor.maxEnergy}
                        </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-sky-500 transition-all"
                            style={{ width: `${energyPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
