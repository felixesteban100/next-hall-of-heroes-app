
"use client";

import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

import type {
    CombatState,
    CombatAction,
} from "@/lib/matchup/combat/types/types";

export type TargetMode = {
    active: boolean;
    validIds: number[];
    selectionMode?: "single" | "multiple";
    selectedIds?: number[];
    onConfirm: (targetId: number) => void;
    onConfirmMultiple?: (targetIds: number[]) => void;
};

export type CombatContextValue = {
    state: CombatState | null;
    targetMode: TargetMode | null;

    onAction: (action: CombatAction) => void;
    onSelectActor: (id: number) => void;
    onSelectTarget: (id: number) => void;
    onDeselectActor: () => void;
    onTargetModeChange: (mode: TargetMode | null) => void;
};

const CombatContext = createContext<CombatContextValue | null>(null);

type CombatProviderProps = {
    value: CombatContextValue;
    children: ReactNode;
};

export function CombatProvider({
    value,
    children,
}: CombatProviderProps) {
    return (
        <CombatContext.Provider value={value}>
            {children}
        </CombatContext.Provider>
    );
}

export function useCombatContext() {
    const context = useContext(CombatContext);

    if (!context) {
        throw new Error(
            "useCombatContext must be used within a CombatProvider"
        );
    }

    return context;
}
