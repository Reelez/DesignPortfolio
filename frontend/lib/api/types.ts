/**
 * TypeScript types mirroring the DRF serializer field names one-to-one.
 * snake_case is preserved intentionally to match the backend contract exactly
 * (no mapping/transform layer in v1).
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface MediaItem {
  id: string;
  type: "image" | "video";
  file_url: string;
  thumbnail_url: string;
  order: number;
  alt_text: string;
  caption: string;
}

export interface ProjectListItem {
  id: string;
  title: string;
  slug: string;
  category: Category | null;
  cover_image: string | null;
  featured: boolean;
  order: number;
  project_date: string | null;
  tags: Tag[];
}

export interface ProjectDetail extends ProjectListItem {
  description: string;
  client_name: string;
  media_items: MediaItem[];
}

export interface SiteSettings {
  bio: string;
  profile_photo: string | null;
  instagram_url: string;
  behance_url: string;
  linkedin_url: string;
  contact_email: string;
  seo_title: string;
  seo_description: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
