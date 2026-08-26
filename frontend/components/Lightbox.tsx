"use client";

import { useCallback, useEffect } from "react";

export interface LightboxTile {
  imageUrl: string;
  alt: string;
}

/**
 * Full-screen click-to-enlarge overlay with prev/next navigation.
 * Controlled by the parent via `openIndex` (null = closed).
 */
export default function Lightbox({
  tiles,
  openIndex,
  onClose,
  onNavigate,
}: {
  tiles: LightboxTile[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const isOpen = openIndex !== null && tiles.length > 0;

  const goPrev = useCallback(() => {
    if (openIndex === null) return;
    onNavigate((openIndex - 1 + tiles.length) % tiles.length);
  }, [openIndex, tiles.length, onNavigate]);

  const goNext = useCallback(() => {
    if (openIndex === null) return;
    onNavigate((openIndex + 1) % tiles.length);
  }, [openIndex, tiles.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || openIndex === null) return null;

  const tile = tiles[openIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-3xl leading-none text-white transition-opacity hover:opacity-70"
      >
        &times;
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Previous image"
        className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl leading-none text-white transition-opacity hover:opacity-70 md:left-6"
      >
        &#8249;
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.imageUrl}
        alt={tile.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Next image"
        className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl leading-none text-white transition-opacity hover:opacity-70 md:right-6"
      >
        &#8250;
      </button>
    </div>
  );
}
