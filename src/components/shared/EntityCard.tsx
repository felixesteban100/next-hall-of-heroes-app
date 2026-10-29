"use client";

import { ReactNode } from "react";
import { ViewTransition } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterImage } from "@/components/shared/CharacterImage";
import Image from "next/image";

export type StatColumn = {
    icon: React.ElementType;
    text: string;
    colorClass?: string;
    title?: string;
};

type EntityCardProps = {
    title: string;
    id: number | string;
    image: string;
    universeLogo?: string;
    background?: string; // For universes
    imageFocus?: string; // For characters
    description?: string;
    transitionKey: string;
    badge?: ReactNode; // Optional alignment or status badge
    stats: StatColumn[]; // 3 or 4 uniform footer stats
};

export function EntityCard({
    title,
    id,
    image,
    universeLogo,
    background,
    imageFocus,
    description,
    transitionKey,
    badge,
    stats,
}: EntityCardProps) {

    return (
        <Card className="group h-full w-full flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 pt-0 overflow-hidden shadow-none hover:shadow-xl">
            {/* Image / Media Container */}
            <div className={`relative aspect-4/4 bg-muted/20 overflow-hidden flex items-center justify-center`}>
                <ViewTransition name={transitionKey} share="morph">
                    {background && (
                        <Image
                            src={background}
                            alt="background"
                            className="absolute opacity-0 group-hover:opacity-100 w-full h-full object-cover transition-opacity duration-300"
                            width={800}
                            height={1200}
                        />
                    )}
                    {/* Use CharacterImage if imageFocus is provided, otherwise standard Image */}
                    {imageFocus !== undefined ? (
                        <CharacterImage
                            src={image}
                            alt={title}
                            imageFocus={imageFocus}
                            width={400}
                            height={500}
                            className={`object-cover duration-500 group-hover:scale-110 rounded-t-2xl h-full w-full ${background ? "group-hover:opacity-0" : ""}`}
                        />
                    ) : (
                        <Image
                            src={image}
                            alt={title}
                            className={`object-contain duration-500 group-hover:scale-110 h-full w-full ${background ? "group-hover:opacity-0" : ""}`}
                            width={800}
                            height={1200}
                            unoptimized
                        />
                    )}
                </ViewTransition>
            </div>

            {/* Header: Title & ID / Badge */}
            <CardHeader className="flex flex-row justify-between items-center gap-1 w-full px-4  shrink-0">
                <CardTitle className="text-base font-bold truncate" title={title}>
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                    {badge}
                    <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                        #{id}
                    </span>
                </div>
            </CardHeader>

            {/* Description */}
            <CardDescription className="flex flex-row justify-between items-center gap-2 w-full px-5 py-1 shrink-0">
                <p className={`${!universeLogo && "min-h-12.5"} line-clamp-3 text-xs text-muted-foreground font-light`}>{description || "No description available."}</p>
                {universeLogo && <div className="h-6 w-14">
                    <Image
                        src={universeLogo}
                        alt={`${title} publisher logo`}
                        width={120}
                        height={60}
                        unoptimized
                        className="h-full w-full object-contain"
                    />
                </div>}
            </CardDescription>

            {/* Footer Stats Grid (Dynamically supports 3 or 4 columns) */}
            <CardFooter className="border border-foreground/10 rounded-b-xl overflow-hidden shrink-0 p-2">
                <div className={`grid grid-cols-${stats.length} w-full divide-x divide-foreground/50 text-center text-xs`}>
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="flex flex-col items-center justify-center gap-0.5 py-1" title={stat.title}>
                                <Icon className={`w-3.5 h-3.5 ${stat.colorClass || "text-muted-foreground"}`} />
                                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[70px] capitalize">
                                    {stat.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardFooter>
        </Card>
    );
}