import Link from "next/link";
import type { Category } from "@/lib/api/types";

// Fixed display order for category tabs; unlisted slugs fall back to the
// end in whatever order the API returned them.
const CATEGORY_ORDER = [
  "murals",
  "fine-art",
  "brand-design",
  "graphic-design",
  "product-design",
  "web-design",
];

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
  const base =
    "font-anton text-sm px-4 py-2 border border-black transition-colors duration-200";
  const active = "bg-black text-white";
  const inactive = "bg-white text-black hover:bg-black hover:text-white";

  const orderedCategories = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug),
  );

  return (
    <ul className="flex flex-wrap gap-3 border-b border-black pb-8">
      {orderedCategories.map((category) => (
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
