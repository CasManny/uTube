import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "../../constant";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
}

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          className="size-full object-cover group-hover:opacity-0"
          src={imageUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
        />
        <Image
          unoptimized={!!previewUrl}
          className="size-full hidden object-cover opacity-0 group-hover:opacity-100"
          src={previewUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
        />
      </div>
      <div className="absolute bottom-2 right-2 px-1 py-0.5 font-medium rounded bg-black/80 text-white text-xs">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
