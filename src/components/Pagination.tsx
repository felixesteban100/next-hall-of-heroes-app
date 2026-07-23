"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function PaginationPages({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    // change the search parameter using the nextjs hooks when a page is clicked
    const pathname = usePathname();
    const { push } = useRouter();
    const searchParams = useSearchParams();

    const updatePageSearchParam = useCallback(
        (page: string, value: string) => {
            const params = new URLSearchParams(searchParams)
            params.set(page, value)
            push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, pathname, push]
    )

    return (
        <Pagination>
            <PaginationContent>
                {/* previous page */}
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={() => updatePageSearchParam('page', (currentPage - 1).toString())}
                        >
                            <ChevronLeft />
                        </PaginationLink>
                    </PaginationItem>
                )}
                {/* Render pagination links based on currentPage and totalPages use ellipsis for large numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2) ? (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={() => updatePageSearchParam('page', page.toString())}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ) : page === currentPage - 3 || page === currentPage + 3 ? (
                        <PaginationItem key={page}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : null
                ))}
                {/* next page */}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={() => updatePageSearchParam('page', (currentPage + 1).toString())}
                        >
                            <ChevronLeft className="rotate-180" />
                        </PaginationLink>
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
}
