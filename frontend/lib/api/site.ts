import { fetchJson } from "./client";
import type { Category, SiteSettings } from "./types";

export async function getCategories(): Promise<Category[]> {
  return fetchJson<Category[]>("/api/categories/");
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchJson<SiteSettings>("/api/site-settings/");
}
