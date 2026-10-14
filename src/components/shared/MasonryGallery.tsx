"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MasonryGalleryProps {
  images: Record<string, string | undefined | null>;
  characterName?: string;
}

export function MasonryGallery({ images, characterName = "Character" }: MasonryGalleryProps) {
  const validEntries = Object.entries(images).filter(
    ([, src]) => src && src !== "-" && typeof src === "string" && src.trim() !== ""
  ) as [string, string][];

  const [activeImage, setActiveImage] = useState<{ key: string; src: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  if (validEntries.length === 0) {
    return <p className="text-sm font-semibold text-muted-foreground">No gallery images listed.</p>;
  }

  const handleOpenModal = (key: string, src: string) => {
    setActiveImage({ key, src });
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse wheel zoom centered on cursor pointer
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 0.25 : -0.25;
    const newZoom = Math.min(Math.max(zoomLevel + zoomFactor, 1), 3);

    if (newZoom === 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    // Get mouse position relative to container center
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    // Adjust pan so the point under the mouse stays in place
    const ratio = newZoom / zoomLevel;
    const newPanX = mouseX - ratio * (mouseX - pan.x);
    const newPanY = mouseY - ratio * (mouseY - pan.y);

    setZoomLevel(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Click & Drag panning logic
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX - pan.x);
    setStartY(e.clientY - pan.y);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setPan({
      x: e.clientX - startX,
      y: e.clientY - startY,
    });
  };

  return (
    <>
      {/* CSS Masonry Layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {validEntries.map(([key, value]) => (
          <div
            key={key}
            onClick={() => handleOpenModal(key, value)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted/40 transition-all duration-300 hover:border-primary/50 hover:shadow-xl break-inside-avoid"
            title={`${characterName} - ${key}`}
          >
            <Image
              unoptimized
              src={value}
              alt={`${characterName} ${key}`}
              width={600}
              height={600}
              className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider bg-background/80 text-foreground backdrop-blur-md border border-border">
                {key}
              </Badge>
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-2.5 rounded-full bg-background/80 backdrop-blur-md text-foreground shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal with Pointer Zoom & Drag */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent aria-description="dialog-image" className="max-w-4xl w-[92vw] sm:w-[85vw] max-h-[90vh] p-0 border-0 bg-background/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <DialogTitle className="sr-only">
            {characterName} Gallery Image ({activeImage?.key})
          </DialogTitle>

          {/* Floating Header Info */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/50 px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-none">{characterName}</span>
            {activeImage?.key && (
              <Badge variant="outline" className="uppercase font-mono text-[10px] px-1.5 py-0">
                {activeImage.key}
              </Badge>
            )}
          </div>

          {/* Pointer-Centric Zoom & Drag Viewport */}
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className={`relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-black/5 dark:bg-black/40 flex items-center justify-center select-none ${zoomLevel > 1
              ? isDragging ? "cursor-grabbing" : "cursor-grab"
              : "cursor-default"
              }`}
          >
            {activeImage && (
              <div
                className="transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                }}
              >
                <Image
                  height={1000}
                  width={1000}
                  src={activeImage.src}
                  alt={`${characterName} ${activeImage.key}`}
                  className="max-w-[70vw] max-h-[60vh] object-contain rounded-lg shadow-xl pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Floating Bottom Control Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2 bg-background/90 backdrop-blur-md p-1.5 rounded-full border border-border shadow-xl">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono px-2 text-muted-foreground min-w-[40px] text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground border-l border-border/60 ml-0.5 pl-2.5 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}