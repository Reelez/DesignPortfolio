"use client";

import { useMemo, useState } from "react";
import CollageGrid from "@/components/CollageGrid";
import type { Category, Tag } from "@/lib/api/types";

export interface MediaTile {
  key: string;
  imageUrl: string;
  alt: string;
  category: Category | null;
  tags: Tag[];
}

// Fixed display order for category pills; unlisted slugs fall back to the
// end in whatever order the API returned them.
const CATEGORY_ORDER = [
  "murals",
  "fine-art",
  "brand-design",
  "graphic-design",
  "product-design",
  "web-design",
];

export default function PortfolioExplorer({
  tiles,
  categories,
}: {
  tiles: MediaTile[];
  categories: Category[];
}) {
  const orderedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug),
      ),
    [categories],
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const categoryTiles = useMemo(
    () => (activeCategory ? tiles.filter((t) => t.category?.slug === activeCategory) : tiles),
    [tiles, activeCategory],
  );

  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    const tags: Tag[] = [];
    for (const tile of categoryTiles) {
      for (const tag of tile.tags) {
        if (!seen.has(tag.slug)) {
          seen.add(tag.slug);
          tags.push(tag);
        }
      }
    }
    return tags;
  }, [categoryTiles]);

  const visibleTiles = useMemo(
    () =>
      activeTag ? categoryTiles.filter((t) => t.tags.some((tag) => tag.slug === activeTag)) : categoryTiles,
    [categoryTiles, activeTag],
  );

  const activeCategoryName =
    orderedCategories.find((c) => c.slug === activeCategory)?.name ?? "All Work";
  const activeTagLabel = availableTags.find((t) => t.slug === activeTag)?.name ?? "All";

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-anton text-6xl leading-[0.9] md:text-8xl">{activeCategoryName}</h1>

      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setActiveTag(null);
            }}
            className={`border border-black px-3 py-1 text-xs font-medium uppercase tracking-widest transition-colors duration-200 ${
              !activeCategory
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-black hover:text-white"
            }`}
          >
            All Work
          </button>
          {orderedCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setActiveCategory(category.slug);
                setActiveTag(null);
              }}
              className={`border border-black px-3 py-1 text-xs font-medium uppercase tracking-widest transition-colors duration-200 ${
                activeCategory === category.slug
                  ? "bg-black text-white"
                  : "bg-transparent text-black hover:bg-black hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {availableTags.length > 0 ? (
          <div className="group relative ml-auto w-fit shrink-0">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-2 border-b border-black pb-1 text-xs font-medium uppercase tracking-widest transition-opacity duration-200 hover:opacity-70"
            >
              <span>Filter: {activeTagLabel}</span>
              <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>

            <div
              className={`absolute right-0 top-full z-30 mt-2 w-48 border border-black bg-white ${open ? "block" : "hidden"}`}
            >
              <ul className="flex flex-col">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTag(null);
                      setOpen(false);
                    }}
                    className={`block w-full border-b border-black px-4 py-2 text-left text-xs font-medium uppercase tracking-widest transition-colors duration-200 hover:bg-black hover:text-white ${
                      !activeTag ? "bg-black text-white" : ""
                    }`}
                  >
                    All
                  </button>
                </li>
                {availableTags.map((tag, i) => (
                  <li key={tag.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTag(tag.slug);
                        setOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs font-medium uppercase tracking-widest transition-colors duration-200 hover:bg-black hover:text-white ${
                        i < availableTags.length - 1 ? "border-b border-black" : ""
                      } ${activeTag === tag.slug ? "bg-black text-white" : ""}`}
                    >
                      {tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <CollageGrid tiles={visibleTiles} />
    </div>
  );
}
