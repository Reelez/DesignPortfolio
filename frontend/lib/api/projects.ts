import { fetchJson } from "./client";
import type { Paginated, ProjectDetail, ProjectListItem } from "./types";

export interface GetProjectsParams {
  category?: string;
  featured?: boolean;
}

export async function getProjects(
  params?: GetProjectsParams,
): Promise<Paginated<ProjectListItem>> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.featured !== undefined) {
    search.set("featured", String(params.featured));
  }

  const query = search.toString();
  const path = query ? `/api/projects/?${query}` : "/api/projects/";

  return fetchJson<Paginated<ProjectListItem>>(path);
}

export async function getProjectBySlug(
  slug: string,
  previewToken?: string,
): Promise<ProjectDetail> {
  const path = previewToken
    ? `/api/projects/${slug}/?preview=${previewToken}`
    : `/api/projects/${slug}/`;

  return fetchJson<ProjectDetail>(
    path,
    previewToken ? { cache: "no-store" } : undefined,
  );
}
