"use client";

import { useEffect, useState } from "react";
import type { MediaTile } from "@/components/PortfolioExplorer";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import Lightbox from "@/components/Lightbox";

function useColumnCount() {
  const [count, setCount] = useState(2);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");

    const update = () => setCount(lg.matches ? 4 : sm.matches ? 3 : 2);
    update();

    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);

  return count;
}

/**
 * Masonry with horizontal reading order: tiles are dealt round-robin into
 * columns (item i -> column i % columnCount) so the collage reads left to
 * right, top to bottom, instead of column-filling like CSS multi-column
 * does (which stacks a whole project vertically in one column).
 */
export default function CollageGrid({ tiles }: { tiles: MediaTile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const columnCount = useColumnCount();

  if (tiles.length === 0) {
    return <p className="text-sm text-black/60">No images to show yet.</p>;
  }

  const columns: { tile: MediaTile; index: number }[][] = Array.from(
    { length: columnCount },
    () => [],
  );
  tiles.forEach((tile, index) => {
    columns[index % columnCount].push({ tile, index });
  });

  return (
    <div className="flex gap-[5px]">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-1 flex-col gap-[5px]">
          {column.map(({ tile, index }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={tile.key}
              src={cloudinaryOptimize(tile.imageUrl, 600)}
              alt={tile.alt}
              loading="lazy"
              decoding="async"
              onClick={() => setOpenIndex(index)}
              className="img-loading block min-h-[140px] w-full cursor-pointer object-cover"
            />
          ))}
        </div>
      ))}

      <Lightbox
        tiles={tiles.map((tile) => ({
          imageUrl: cloudinaryOptimize(tile.imageUrl, 1600),
          alt: tile.alt,
        }))}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  );
}
