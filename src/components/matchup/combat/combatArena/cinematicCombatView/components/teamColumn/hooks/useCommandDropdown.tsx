"use client";

import { useEffect, useRef, useState } from "react";

type ElementRefs = {
    current: Map<number, HTMLDivElement>;
};

type ContainerRef = {
    current: HTMLDivElement | null;
};

type BooleanRef = {
    current: boolean;
};

type UseCommandDropdownProps = {
    avatarRefsMap: ElementRefs;
    scrollContainerRef: ContainerRef;
    programmaticScrollRef: BooleanRef;
    onDeselectActor: () => void;
};

export function useCommandDropdown({
    avatarRefsMap,
    scrollContainerRef,
    programmaticScrollRef,
    onDeselectActor,
}: UseCommandDropdownProps) {
    const [openCommandActorId, setOpenCommandActorId] =
        useState<number | null>(null);

    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    const previousOpenActorIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (openCommandActorId === null) {
            setDropdownPosition(null);

            // Only deselect when a previously open panel actually closes.
            if (previousOpenActorIdRef.current !== null) {
                previousOpenActorIdRef.current = null;
                onDeselectActor();
            }

            return;
        }

        previousOpenActorIdRef.current = openCommandActorId;

        const updatePosition = () => {
            const avatar = avatarRefsMap.current.get(openCommandActorId);
            if (!avatar) return;

            const rect = avatar.getBoundingClientRect();
            const width = Math.min(340, window.innerWidth - 24);

            const viewportLeft = Math.max(
                12,
                Math.min(
                    rect.left + rect.width / 2 - width / 2,
                    window.innerWidth - width - 12
                )
            );

            setDropdownPosition({
                top: rect.bottom + 8,
                left: viewportLeft,
            });
        };

        const teamColumn = scrollContainerRef.current;

        const handleTeamColumnScroll = () => {
            if (programmaticScrollRef.current) {
                updatePosition();
                return;
            }

            // Closing the panel triggers the deselection effect above.
            setOpenCommandActorId(null);
            setDropdownPosition(null);
        };

        updatePosition();

        teamColumn?.addEventListener("scroll", handleTeamColumnScroll);
        window.addEventListener("resize", updatePosition);

        return () => {
            teamColumn?.removeEventListener(
                "scroll",
                handleTeamColumnScroll
            );
            window.removeEventListener("resize", updatePosition);
        };
    }, [
        openCommandActorId,
        avatarRefsMap,
        scrollContainerRef,
        programmaticScrollRef,
        onDeselectActor,
    ]);

    return {
        openCommandActorId,
        setOpenCommandActorId,
        dropdownPosition,
    };
}