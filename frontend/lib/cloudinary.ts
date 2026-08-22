/**
 * Cloudinary serves originals as-uploaded unless a transformation is
 * requested in the URL — every image on the site was being downloaded at
 * full camera resolution, which is the main reason the portfolio grid felt
 * slow to load. Inserting `f_auto,q_auto,w_<n>,dpr_auto` right after
 * `/upload/` asks Cloudinary's CDN for an auto-format (AVIF/WebP),
 * auto-quality, width-capped, retina-aware version instead — cached at
 * that URL the same way the original was.
 */
export function cloudinaryOptimize(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
}
