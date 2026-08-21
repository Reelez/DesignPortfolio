"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Tag } from "@/lib/api/types";

export default function TagFilterDropdown({
  categorySlug,
  tags,
  activeTag,
}: {
  categorySlug: string;
  tags: Tag[];
  activeTag?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeLabel = tags.find((t) => t.slug === activeTag)?.name ?? "All";

  return (
    <div ref={ref} className="relative ml-auto w-fit shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border-b border-t-0 border-r-0 border-l-0 border-black pb-1 font-medium text-xs uppercase tracking-widest transition-colors duration-200 hover:opacity-70"
      >
        <span>Filter: {activeLabel}</span>
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 border border-black bg-white">
          <ul className="flex flex-col">
            <li>
              <Link
                href={`/portfolio?category=${categorySlug}`}
                onClick={() => setOpen(false)}
                className={`block border-b border-black px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors duration-200 hover:bg-black hover:text-white ${
                  !activeTag ? "bg-black text-white" : ""
                }`}
              >
                All
              </Link>
            </li>
            {tags.map((tag, i) => (
              <li key={tag.slug}>
                <Link
                  href={`/portfolio?category=${categorySlug}&tag=${tag.slug}`}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors duration-200 hover:bg-black hover:text-white ${
                    i < tags.length - 1 ? "border-b border-black" : ""
                  } ${activeTag === tag.slug ? "bg-black text-white" : ""}`}
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
