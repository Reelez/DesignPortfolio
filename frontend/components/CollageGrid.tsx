import type { MediaTile } from "@/components/PortfolioExplorer";

/**
 * CSS multi-column masonry: each image keeps its natural aspect ratio and
 * `break-inside-avoid` guarantees tiles stack without ever overlapping,
 * regardless of how many pass the current filter.
 */
export default function CollageGrid({ tiles }: { tiles: MediaTile[] }) {
  if (tiles.length === 0) {
    return <p className="text-sm text-black/60">No images to show yet.</p>;
  }

  return (
    <div className="columns-2 gap-0 sm:columns-3 lg:columns-4">
      {tiles.map((tile) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={tile.key}
          src={tile.imageUrl}
          alt={tile.alt}
          loading="lazy"
          className="block w-full break-inside-avoid object-cover"
        />
      ))}
    </div>
  );
}
