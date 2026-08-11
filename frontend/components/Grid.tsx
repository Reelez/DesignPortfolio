import type { ProjectListItem } from "@/lib/api/types";
import ProjectCard from "./ProjectCard";

export default function Grid({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) {
    return <p className="text-muted">No projects to show yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
