"use client";

import { useLayoutEffect, useRef, useState } from "react";

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
    keepOpenOnTeamScroll?: boolean;
};

export function useCommandDropdown({
    avatarRefsMap,
    scrollContainerRef,
    programmaticScrollRef,
    onDeselectActor,
    keepOpenOnTeamScroll = false,
}: UseCommandDropdownProps) {
    const [openCommandActorId, setOpenCommandActorId] =
        useState<number | null>(null);

    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    const [positionedActorId, setPositionedActorId] =
        useState<number | null>(null);

    const previousOpenActorIdRef = useRef<number | null>(null);

    useLayoutEffect(() => {
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
            if (!avatar) {
                setDropdownPosition(null);
                setPositionedActorId(null);
                return;
            }

            const rect = avatar.getBoundingClientRect();
            const width = Math.min(340, window.innerWidth - 24);

            const viewportLeft = Math.max(
                12,
                Math.min(
                    rect.left + rect.width / 2 - width / 2,
                    window.innerWidth - width - 12
                )
            );

            setPositionedActorId(openCommandActorId);
            setDropdownPosition({
                top: rect.bottom + 8,
                left: viewportLeft,
            });
        };

        const teamColumn = scrollContainerRef.current;

        const handleTeamColumnScroll = () => {
            if (programmaticScrollRef.current || keepOpenOnTeamScroll) {
                updatePosition();
                return;
            }

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
        keepOpenOnTeamScroll,
    ]);

    return {
        openCommandActorId,
        setOpenCommandActorId,
        dropdownPosition: positionedActorId === openCommandActorId ? dropdownPosition : null,
    };
}