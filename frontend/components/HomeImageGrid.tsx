"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

export default function HomeImageGrid({
  images,
  alts,
  tileClassName,
  imgClassName,
}: {
  images: string[];
  alts: string[];
  tileClassName: string;
  imgClassName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const tiles = images.map((imageUrl, i) => ({
    imageUrl,
    alt: alts[i] ?? "Portfolio image",
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {images.map((src, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label="Expand image"
              className={tileClassName}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={alts[i] ?? "Portfolio image"}
                className={imgClassName}
                src={src}
                loading="lazy"
                decoding="async"
              />
            </button>
          </div>
        ))}
      </div>
      <Lightbox
        tiles={tiles}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
