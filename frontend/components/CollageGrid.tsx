import Image from "next/image";
import Link from "next/link";
import type { ProjectListItem } from "@/lib/api/types";

function Tile({
  project,
  className = "",
  imgClassName = "object-cover",
}: {
  project: ProjectListItem;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={`group relative block overflow-hidden border border-black bg-white ${className}`}
    >
      {project.cover_image ? (
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={`${imgClassName} transition duration-700 ease-out group-hover:scale-[1.03]`}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-4 transition-colors duration-300 group-hover:bg-black/40">
        <span className="translate-y-2 text-xs font-medium uppercase tracking-widest text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {project.title}
        </span>
      </div>
    </Link>
  );
}

/**
 * Renders a cluster of tiles in an asymmetric collage layout. The template
 * is picked by cluster size (1/2/3/4), and clusters of 5+ are split into a
 * 5-item chunk (wide+narrow row, then three even tiles) with the remainder
 * recursed back through this same function.
 */
function renderTileCluster(projects: ProjectListItem[], keyPrefix: string): React.ReactNode {
  if (projects.length === 0) return null;

  if (projects.length === 1) {
    const [a] = projects;
    return (
      <div key={keyPrefix} className="grid grid-cols-1 gap-1 md:grid-cols-12">
        <Tile project={a} className="aspect-[16/9] md:col-span-8 md:col-start-3" />
      </div>
    );
  }

  if (projects.length === 2) {
    const [a, b] = projects;
    return (
      <div key={keyPrefix} className="grid grid-cols-1 gap-1 md:grid-cols-12">
        <Tile project={a} className="aspect-[16/10] md:col-span-7" />
        <Tile project={b} className="aspect-square md:col-span-5" />
      </div>
    );
  }

  if (projects.length === 3) {
    const [a, b, c] = projects;
    return (
      <div key={keyPrefix} className="grid grid-cols-1 gap-1 md:grid-cols-12">
        <Tile project={a} className="aspect-[4/5] md:col-span-7" />
        <div className="grid grid-cols-1 gap-1 md:col-span-5">
          <Tile project={b} className="aspect-[16/9]" />
          <Tile project={c} className="aspect-[16/9]" />
        </div>
      </div>
    );
  }

  if (projects.length === 4) {
    const [a, b, c, d] = projects;
    return (
      <div key={keyPrefix} className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <Tile project={a} className="aspect-square" />
        <Tile project={b} className="aspect-square" />
        <Tile project={c} className="aspect-square" />
        <Tile project={d} className="aspect-square" />
      </div>
    );
  }

  const chunk = projects.slice(0, 5);
  const rest = projects.slice(5);
  const [a, b, c, d, e] = chunk;

  return (
    <div key={keyPrefix} className="flex flex-col gap-1">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-12">
        <Tile project={a} className="aspect-[16/10] md:col-span-7" />
        <Tile project={b} className="aspect-square md:col-span-5" />
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <Tile project={c} className="aspect-square" />
        <Tile project={d} className="aspect-square" />
        <Tile project={e} className="aspect-square" />
      </div>
      {rest.length > 0 ? renderTileCluster(rest, `${keyPrefix}-rest`) : null}
    </div>
  );
}

export default function CollageGrid({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-black/60">No projects to show yet.</p>;
  }

  return renderTileCluster(projects, "collage");
}
