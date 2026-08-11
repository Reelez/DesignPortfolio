import Link from "next/link";
import type { Category } from "@/lib/api/types";

/**
 * Server-rendered category filter using plain <Link> navigation with a
 * `?category=<slug>` query param. No client-side state/JS needed — the
 * portfolio page reads `searchParams.category` server-side and re-fetches.
 */
export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const base = "tracking-label text-xs pb-1 border-b-2 transition";
  const active = "border-accent text-foreground";
  const inactive = "border-transparent text-muted hover:text-foreground";

  return (
    <ul className="flex flex-wrap gap-6 border-b border-line pb-6">
      <li>
        <Link href="/portfolio" className={`${base} ${!activeSlug ? active : inactive}`}>
          All Work
        </Link>
      </li>
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/portfolio?category=${category.slug}`}
            className={`${base} ${activeSlug === category.slug ? active : inactive}`}
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
