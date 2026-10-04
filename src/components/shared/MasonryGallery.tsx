"use client";

import { useState } from "react";
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

  if (validEntries.length === 0) {
    return <p className="text-sm font-semibold text-muted-foreground">No gallery images listed.</p>;
  }

  const handleOpenModal = (key: string, src: string) => {
    setActiveImage({ key, src });
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
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

      {/* this modal is not completed ❌  */}
      {/* Optimized Mobile-First Lightbox Modal */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent className="max-w-4xl w-[92vw] sm:w-[85vw] max-h-[90vh] p-0 border-0 bg-background/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
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

          {/* Scrollable & Pan-friendly Image Viewport */}
          <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-auto flex items-center justify-center p-2 sm:p-6 bg-black/5 dark:bg-black/40">
            {activeImage && (
              <div
                className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                }}
              >
                <img
                  src={activeImage.src}
                  alt={`${characterName} ${activeImage.key}`}
                  className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded-lg shadow-xl select-none pointer-events-auto"
                />
              </div>
            )}
          </div>

          {/* Floating Bottom Control Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2 bg-background/90 backdrop-blur-md p-1.5 rounded-full border border-border shadow-xl">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
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
              className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground border-l border-border/60 ml-0.5 pl-2.5"
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