import Link from "next/link";
import { Suspense } from "react";
import { getProjects, getProjectBySlug } from "@/lib/api/projects";
import { getCategories } from "@/lib/api/site";
import PortfolioExplorer from "@/components/PortfolioExplorer";
import type { MediaTile } from "@/components/PortfolioExplorer";

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()]);

  const details = await Promise.all(
    projects.results.map((p) => getProjectBySlug(p.slug)),
  );

  const tiles: MediaTile[] = details.flatMap((project) =>
    project.media_items
      .filter((m) => m.type === "image")
      .map((m) => ({
        key: m.id,
        imageUrl: m.file_url,
        alt: m.alt_text || project.title,
        category: project.category,
        tags: project.tags,
        projectSlug: project.slug,
        projectTitle: project.title,
      })),
  );

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
        <Suspense fallback={null}>
          <PortfolioExplorer tiles={tiles} categories={categories} />
        </Suspense>
      </div>
    </main>
  );
}
