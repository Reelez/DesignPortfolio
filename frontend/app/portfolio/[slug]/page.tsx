import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";
import Gallery from "@/components/Gallery";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;

  let project;
  try {
    project = await getProjectBySlug(slug, preview);
  } catch (error) {
    // Missing project, or a missing/wrong preview token on a draft, both
    // resolve to a 404 from the backend (Slice 2's get_object() override).
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-col gap-3">
        {project.category ? (
          <p className="tracking-label text-xs text-accent">{project.category.name}</p>
        ) : null}
        <h1 className="font-display text-4xl">{project.title}</h1>
        {project.description ? (
          <p className="max-w-2xl whitespace-pre-line text-muted">{project.description}</p>
        ) : null}
      </div>
      <Gallery items={project.media_items} />
    </main>
  );
}
