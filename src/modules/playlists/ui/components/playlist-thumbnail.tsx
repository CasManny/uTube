import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constant";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
interface PlaylistThumbnailProps {
  imageUrl: string;
  title: string;
  videoCount: number;
  className?: string;
  thumbnailUrl?: string | null;
}

export const PlaylistThumbnail = ({
  imageUrl,
  videoCount,
  className,
  title,
  thumbnailUrl,
}: PlaylistThumbnailProps) => {
  return (
    <div className={cn("relative pt-3 group", className)}>
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />

        <div className="relative overflow-hidden w-full rounded-xl aspect-video">
          <Image
            src={imageUrl || THUMBNAIL_FALLBACK}
            alt={title}
            className="size-full object-cover"
            fill
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">playall</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4 " />
        {videoCount} videos
      </div>
    </div>
  );
};
