import { getProjects } from "@/lib/api/projects";
import { getCategories } from "@/lib/api/site";
import Grid from "@/components/Grid";
import CategoryFilter from "@/components/CategoryFilter";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // Category filtering is done server-side via the DRF `?category=<slug>`
  // query param (ProjectViewSet.get_queryset, Slice 2), not client-side.
  const [projects, categories] = await Promise.all([
    getProjects({ category }),
    getCategories(),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-col gap-2">
        <p className="tracking-label text-xs text-accent">Portfolio</p>
        <h1 className="font-display text-4xl">All Projects</h1>
      </div>
      <CategoryFilter categories={categories} activeSlug={category} />
      <Grid projects={projects.results} />
    </main>
  );
}
