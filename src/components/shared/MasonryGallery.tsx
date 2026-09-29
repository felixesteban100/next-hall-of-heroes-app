"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MasonryGalleryProps {
  images: Record<string, string | undefined | null>;
  characterName?: string;
}

/* zoom is terrible and the dialog is too big in mobile */

export function MasonryGallery({ images, characterName = "Character" }: MasonryGalleryProps) {
  // Filter valid image entries while preserving keys (e.g. ['md', 'https://...'])
  const validEntries = Object.entries(images).filter(
    ([, src]) => src && src !== "-" && typeof src === "string" && src.trim() !== ""
  ) as [string, string][];

  // Modal State
  const [activeImage, setActiveImage] = useState<{ key: string; src: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (validEntries.length === 0) {
    return <p className="text-sm font-semibold text-muted-foreground">No gallery images listed.</p>;
  }

  const handleOpenModal = (key: string, src: string) => {
    setActiveImage({ key, src });
    setZoomLevel(1); // Reset zoom on open
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

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

            {/* Top Key Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider bg-background/80 text-foreground backdrop-blur-md border border-border">
                {key}
              </Badge>
            </div>

            {/* Hover Expand Icon Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-2.5 rounded-full bg-background/80 backdrop-blur-md text-foreground shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Zoom Modal */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border flex flex-col justify-between">
          <DialogTitle className="sr-only">
            {characterName} Gallery Image ({activeImage?.key})
          </DialogTitle>

          {/* Modal Header Controls */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 z-20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{characterName}</span>
              {activeImage?.key && (
                <Badge variant="outline" className="uppercase font-mono text-xs">
                  {activeImage.key}
                </Badge>
              )}
            </div>

            {/* Zoom Controls Bar */}
            <div className="flex items-center gap-1 sm:gap-2 bg-muted/80 p-1 rounded-lg border border-border">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1.5 rounded hover:bg-background disabled:opacity-40 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono px-2 text-muted-foreground w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                className="p-1.5 rounded hover:bg-background disabled:opacity-40 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded hover:bg-background transition-colors border-l border-border pl-2"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zoomable Image Container */}
          <div className="relative flex-1 w-full h-full overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing">
            {activeImage && (
              <div
                className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={activeImage.src}
                  alt={`${characterName} ${activeImage.key}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}