"use client"

import { useParamLoading } from "../layout/ParamLoadingContext";

export function StartPageFooterLinks() {
    const { navigateRoute } = useParamLoading();
    return (
        <div className="flex items-center gap-4 font-medium">
            {[
                { label: "All Characters", href: "/characters" },
                { label: "Teams", href: "/teams" },
                { label: "Power Matrix", href: "/powers" },
            ].map((link, i, arr) => (
                <div key={link.label} className="flex items-center gap-1">
                    <button

                        onClick={() => navigateRoute(link.href)}
                        className="hover:text-foreground transition-colors"
                    >
                        {link.label}
                    </button>
                    {i < arr.length - 1 && <span key={`sep-${i}`}>•</span>}
                </div>
            ))}
        </div>
    );
}