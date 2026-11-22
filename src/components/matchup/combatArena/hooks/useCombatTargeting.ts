import { useCallback, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { CombatEngine } from "@/lib/matchup/combat/engine/CombatEngine";
import type { CombatState } from "@/lib/matchup/combat/types/types";
import type { TargetMode } from "../context/CombatContext";

type UseCombatTargetingOptions = {
    engineRef: RefObject<CombatEngine | null>;
    setState: Dispatch<SetStateAction<CombatState | null>>;
};

export function useCombatTargeting({
    engineRef,
    setState,
}: UseCombatTargetingOptions) {
    const [targetMode, setTargetMode] = useState<TargetMode | null>(null);
    const targetModeRef = useRef<TargetMode | null>(null);

    const handleTargetModeChange = useCallback(
        (next: TargetMode | null) => {
            const previous = targetModeRef.current;

            // Preserve selected targets when only the callbacks are refreshed.
            const shouldPreserveSelection =
                previous !== null &&
                next !== null &&
                previous.active === next.active &&
                previous.selectionMode === next.selectionMode &&
                previous.validIds.length === next.validIds.length &&
                previous.validIds.every(
                    (id, index) => id === next.validIds[index]
                );

            const normalizedNext =
                shouldPreserveSelection && next.selectedIds === undefined
                    ? {
                        ...next,
                        selectedIds: previous.selectedIds ?? [],
                    }
                    : next;

            // Always keep the latest callbacks.
            targetModeRef.current = normalizedNext;

            const unchanged =
                (previous === null && normalizedNext === null) ||
                (previous !== null &&
                    normalizedNext !== null &&
                    previous.active === normalizedNext.active &&
                    previous.selectionMode === normalizedNext.selectionMode &&
                    previous.validIds.length === normalizedNext.validIds.length &&
                    previous.validIds.every(
                        (id, index) => id === normalizedNext.validIds[index]
                    ) &&
                    (previous.selectedIds ?? []).length ===
                    (normalizedNext.selectedIds ?? []).length &&
                    (previous.selectedIds ?? []).every(
                        (id, index) =>
                            id === (normalizedNext.selectedIds ?? [])[index]
                    ));

            if (!unchanged) {
                setTargetMode(normalizedNext);
            }
        },
        []
    );

    const handleSelectActor = useCallback((id: number) => {
        const engine = engineRef.current;
        if (!engine) return;

        engine.selectActor(id);
        setState({ ...engine.getState() });
    }, [engineRef, setState]);

    const handleDeselectActor = useCallback(() => {
        targetModeRef.current = null;
        setTargetMode(null);

        engineRef.current?.deselectActor();

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
    }, [engineRef, setState]);

    const handleSelectTarget = useCallback((id: number) => {
        const currentTargetMode = targetModeRef.current;

        if (currentTargetMode?.active) {
            if (!currentTargetMode.validIds.includes(id)) return;

            // Multiple selection: toggle the selected target.
            if (currentTargetMode.selectionMode === "multiple") {
                const selectedIds = currentTargetMode.selectedIds ?? [];

                const nextSelectedIds = selectedIds.includes(id)
                    ? selectedIds.filter((selectedId) => selectedId !== id)
                    : [...selectedIds, id];

                const nextMode = {
                    ...currentTargetMode,
                    selectedIds: nextSelectedIds,
                };

                targetModeRef.current = nextMode;
                setTargetMode(nextMode);

                return;
            }

            // Single selection: preserve the existing behavior.
            currentTargetMode.onConfirm(id);

            targetModeRef.current = null;
            setTargetMode(null);

            return;
        }

        engineRef.current?.selectTarget(id);

        if (engineRef.current) {
            setState({ ...engineRef.current.getState() });
        }
    }, [engineRef, setState]);

    return {
        targetMode,
        handleTargetModeChange,
        handleSelectActor,
        handleDeselectActor,
        handleSelectTarget,
    };
}
