"use client"

import { useParamLoading } from "@/components/layout/ParamLoadingContext";
import NextLink from "next/link";
import { ComponentProps } from "react";

type LoadingLinkProps = ComponentProps<typeof NextLink>;

export function LoadingLink({ href, children, onClick, ...props }: LoadingLinkProps) {
    const { navigateRoute } = useParamLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onClick?.(e as any);
        navigateRoute(href.toString());
    };

    return (
        <NextLink href={href} onClick={handleClick} {...props}>
            {children}
        </NextLink>
    );
}