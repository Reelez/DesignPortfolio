import type { MediaItem } from "@/lib/api/types";
import { cloudinaryOptimize } from "@/lib/cloudinary";

export default function Gallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) =>
          item.type === "video" ? (
            <video
              key={item.id}
              src={item.file_url}
              controls
              className="w-full bg-line"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              src={cloudinaryOptimize(item.file_url, 1200)}
              alt={item.alt_text}
              loading="lazy"
              className="w-full bg-line object-cover"
            />
          ),
        )}
    </div>
  );
}
