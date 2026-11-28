"use client";

import type { CombatFighter } from "@/lib/matchup/combat/types/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FighterProfileSidebar from "./characterDetailsDialog/FighterProfileSidebar";
import FighterPowersGrid from "./characterDetailsDialog/FighterPowersGrid";

type CharacterDetailsDialogProps = {
    fighter: CombatFighter | null;
    onClose: () => void;
};

export default function CharacterDetailsDialog({
    fighter,
    onClose,
}: CharacterDetailsDialogProps) {
    return (
        <Dialog
            open={!!fighter}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="!w-[90vw] !max-w-[90vw] lg:!max-w-[90rem] h-[70dvh] max-h-[70dvh] flex flex-col overflow-hidden gap-0 p-0 rounded-xl border border-foreground/30">
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-3 sm:p-6 lg:p-7">
                    {fighter && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                            <FighterProfileSidebar fighter={fighter} />
                            <FighterPowersGrid fighter={fighter} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}