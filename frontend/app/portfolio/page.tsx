import Link from "next/link";
import { getProjects } from "@/lib/api/projects";
import { getCategories } from "@/lib/api/site";
import CollageGrid from "@/components/CollageGrid";
import CategoryFilter from "@/components/CategoryFilter";
import TagFilterDropdown from "@/components/TagFilterDropdown";
import type { Tag } from "@/lib/api/types";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;

  // Category filtering is done server-side via the DRF `?category=<slug>`
  // query param (ProjectViewSet.get_queryset, Slice 2), not client-side.
  // Tag filtering (subcategory dropdown, per-category) is applied
  // client-side below since `ProjectListItem.tags` is already returned
  // in full by the category-scoped fetch.
  const [projects, categories] = await Promise.all([
    getProjects({ category }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const heading = activeCategory?.name ?? "All Projects";

  const availableTags: Tag[] = [];
  const seenTagSlugs = new Set<string>();
  for (const project of projects.results) {
    const firstTag = project.tags[0];
    if (firstTag && !seenTagSlugs.has(firstTag.slug)) {
      seenTagSlugs.add(firstTag.slug);
      availableTags.push(firstTag);
    }
  }

  const visibleProjects = tag
    ? projects.results.filter((p) => p.tags[0]?.slug === tag)
    : projects.results;

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-black sm:px-10 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <Link
          href="/#work"
          className="group inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-70"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          Back to work
        </Link>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h1 className="font-anton text-6xl leading-[0.9] md:text-8xl">{heading}</h1>
          {category && availableTags.length > 0 ? (
            <TagFilterDropdown categorySlug={category} tags={availableTags} activeTag={tag} />
          ) : null}
        </div>
        <CategoryFilter categories={categories} activeSlug={category} />
        <CollageGrid projects={visibleProjects} />
      </div>
    </main>
  );
}
