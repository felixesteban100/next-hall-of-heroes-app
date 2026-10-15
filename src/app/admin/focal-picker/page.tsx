"use client";

import { useState } from "react";
import Image from "next/image";

export default function FocalPickerPage() {
    const [imgSrc, setImgSrc] = useState("");
    const [position, setPosition] = useState({ x: 50, y: 15 });
    const [copied, setCopied] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        setPosition({ x, y });
    };

    const focusString = `${position.x}% ${position.y}%`;
    const dbSnippet = `imageFocus: "${focusString}"`;

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold">Pinterest Focal Point & Avatar Tester</h1>
                <p className="text-xs text-muted-foreground">
                    Paste any Pinterest image link, click directly on the character&apos;s face, and preview the circular avatar crop live.
                </p>
            </div>

            <input
                type="text"
                placeholder="Paste Pinterest image URL here (e.g., https://i.pinimg.com/...)"
                value={imgSrc}
                onChange={(e) => setImgSrc(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-background text-sm"
            />

            {imgSrc && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start bg-card p-4 rounded-xl border border-border">
                        {/* Clickable Image Preview Container */}
                        <div
                            onClick={handleClick}
                            className="relative border rounded-lg overflow-hidden cursor-crosshair h-[450px] flex items-center justify-center bg-muted"
                        >
                            <Image
                                unoptimized
                                src={imgSrc}
                                alt="Target Preview"
                                fill
                                className="object-contain select-none"
                            />
                            {/* Reticle indicator */}
                            <div
                                className="absolute w-7 h-7 border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-primary/30 shadow-md flex items-center justify-center z-10"
                                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                            >
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            </div>
                        </div>

                        {/* Live Avatar Test Box */}
                        <div className="flex flex-col items-center gap-2 bg-muted/50 p-4 rounded-xl border border-border/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Live Avatar Preview
                            </span>

                            {/* Actual 40px (w-10 h-10) circular test container */}
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-md bg-background">
                                <Image
                                    unoptimized
                                    src={imgSrc}
                                    alt="Avatar Crop Test"
                                    fill
                                    className="object-cover"
                                    style={{ objectPosition: focusString }}
                                />
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground">40px Circle</span>
                        </div>
                    </div>

                    {/* Database Output & Copy Button */}
                    <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border shadow-sm">
                        <div className="font-mono text-xs text-primary font-bold">
                            {dbSnippet}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(dbSnippet);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                            }}
                            className="px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-bold cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            {copied ? "Copied Snippet!" : "Copy DB Snippet"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}