"use client"

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import { Button } from "@/components/ui/button";

export default function RemoveCharacterOfTeamButton({ variant = "default", paramKey, selectedIds, idsToRemove }: { variant?: "default" | "secondary", paramKey: string, selectedIds: number[], idsToRemove: number[] }) {
    const { pushParams } = useParamLoading()
    const searchParams = useSearchParams();

    const write = (ids: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "team");
        params.delete("id1");
        params.delete("id2");
        params.delete(variant === "default" ? "a_name" : "b_name");
        if (ids.length) params.set(paramKey, ids.join(","));
        else params.delete(paramKey);
        pushParams(params);
    }

    if (idsToRemove.length > 1) {
        return (
            <Button
                variant={variant}
                onClick={() => write(selectedIds.filter((id) => !idsToRemove.includes(id)))}
            >
                Clear all
            </Button>
        )
    }
    return (
        <button
            type="button"
            className="cursor-pointer p-2"
            onClick={() => write(selectedIds.filter((id) => !idsToRemove.includes(id)))}
        >
            ×
        </button>
    )
}
