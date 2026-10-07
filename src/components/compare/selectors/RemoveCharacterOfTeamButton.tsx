"use client"

import { useSearchParams } from "next/navigation";
import { useParamLoading } from "@/components/layout/ParamLoadingContext";

export default function RemoveCharacterOfTeamButton({ paramKey, selectedIds, selectedId }: { paramKey: string, selectedIds: number[], selectedId: number }) {
    const { pushParams } = useParamLoading()
    const searchParams = useSearchParams();

    const write = (ids: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "team");
        params.delete("id1");
        params.delete("id2");
        if (ids.length) params.set(paramKey, ids.join(","));
        else params.delete(paramKey);
        pushParams(params);
    };

    return (
        <button
            type="button"
            className="cursor-pointer p-2"
            onClick={() => write(selectedIds.filter((id) => id !== selectedId))}
        >
            ×
        </button>
    )
}
