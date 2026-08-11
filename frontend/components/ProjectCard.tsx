import Link from "next/link";
import type { ProjectListItem } from "@/lib/api/types";

export default function ProjectCard({
  project,
  size = "normal",
}: {
  project: ProjectListItem;
  size?: "normal" | "large";
}) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group flex flex-col gap-3">
      <div
        className={`w-full overflow-hidden bg-line ${
          size === "large" ? "aspect-[4/5]" : "aspect-[4/5] sm:aspect-square"
        }`}
      >
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={project.title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        {project.category ? (
          <p className="tracking-label text-[11px] text-muted">{project.category.name}</p>
        ) : null}
        <h3 className="font-display text-lg text-foreground">{project.title}</h3>
      </div>
    </Link>
  );
}
