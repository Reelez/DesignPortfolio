import Link from "next/link";
import { getProjects } from "@/lib/api/projects";
import Grid from "@/components/Grid";

export default async function Home() {
  // Backend supports `?featured=true` (ProjectViewSet.get_queryset, Slice 2).
  const featured = await getProjects({ featured: true });

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-24 sm:px-10 sm:py-32">
        <p className="tracking-label text-xs text-accent">Digital Portfolio</p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
          Murals, fine art, and design with an editorial eye.
        </h1>
        <p className="max-w-xl text-muted">
          A curated archive of projects — images and video — shown with the
          same quiet care they were made with.
        </p>
        <Link
          href="/portfolio"
          className="tracking-label mt-4 w-fit border-b-2 border-accent pb-1 text-xs"
        >
          View full portfolio
        </Link>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 sm:px-10 sm:pb-32">
        <div className="flex items-center justify-between border-t border-line pt-10">
          <h2 className="font-display text-2xl">Featured Work</h2>
          <Link href="/portfolio" className="tracking-label text-xs text-muted hover:text-accent">
            View all
          </Link>
        </div>
        <Grid projects={featured.results} />
      </section>
    </main>
  );
}
