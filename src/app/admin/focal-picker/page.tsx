"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function FocalPickerPage() {
    const [imgSrc, setImgSrc] = useState("");
    const [position, setPosition] = useState({ x: 50, y: 15 });
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [copied, setCopied] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) return;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const x = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
        const y = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

        setPosition({ x, y });
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 0.25 : -0.25;
        setZoomLevel((prev) => Math.min(Math.max(prev + factor, 1), 4));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Include zoom scale in the output if it's greater than 1
    const focusString = zoomLevel > 1
        ? `${position.x}% ${position.y}% ${zoomLevel.toFixed(2)}`
        : `${position.x}% ${position.y}%`;

    const dbSnippet = `"imageFocus": "${focusString}"`;

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold">Pinterest Focal Point & Zoom DB Generator</h1>
                <p className="text-xs text-muted-foreground">
                    Adjust position and zoom level. The resulting string will automatically encode both positioning and scale for your DB.
                </p>
            </div>

            <input
                type="text"
                placeholder="Paste Pinterest image URL here..."
                value={imgSrc}
                onChange={(e) => {
                    setImgSrc(e.target.value);
                    setZoomLevel(1);
                    setPan({ x: 0, y: 0 });
                }}
                className="w-full p-2.5 border rounded-lg bg-background text-sm"
            />

            {imgSrc && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start bg-card p-4 rounded-xl border border-border">

                        <div className="relative flex flex-col gap-2">
                            <div
                                ref={containerRef}
                                onClick={handleClick}
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUpOrLeave}
                                onMouseLeave={handleMouseUpOrLeave}
                                className={`relative border rounded-lg overflow-hidden h-[450px] flex items-center justify-center bg-muted select-none ${zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"
                                    }`}
                            >
                                <div
                                    className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                                    style={{
                                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                                    }}
                                >
                                    <Image
                                        unoptimized
                                        src={imgSrc}
                                        alt="Target Preview"
                                        fill
                                        className="object-contain pointer-events-none"
                                    />
                                </div>

                                <div
                                    className="absolute w-6 h-6 border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-primary/40 shadow-md flex items-center justify-center z-20"
                                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                                >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                                <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setZoomLevel((p) => Math.max(p - 0.5, 1))} className="p-1 rounded hover:bg-accent cursor-pointer">
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setZoomLevel(1); setPan({ x: 0, y: 0 }); }} className="p-1 rounded hover:bg-accent cursor-pointer">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setZoomLevel((p) => Math.min(p + 0.5, 4))} className="p-1 rounded hover:bg-accent cursor-pointer">
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Live Avatar Preview incorporating both position and scale */}
                        <div className="flex flex-col items-center gap-2 bg-muted/50 p-4 rounded-xl border border-border/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Live Avatar Preview
                            </span>

                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-md bg-background flex items-center justify-center">
                                <div
                                    className="relative w-full h-full"
                                    style={{
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: focusString ? `${focusString.split(' ')[0]} ${focusString.split(' ')[1]}` : 'center'
                                    }}
                                >
                                    <Image
                                        unoptimized
                                        src={imgSrc}
                                        alt="Avatar Crop Test"
                                        fill
                                        className="object-cover"
                                        style={{ objectPosition: `${position.x}% ${position.y}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground">40px Circle</span>
                        </div>
                    </div>

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