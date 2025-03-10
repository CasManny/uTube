import Link from "next/link";
import { PlaylistGetManyType } from "../../types";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constant";
import { PlaylistThumbnail } from "./playlist-thumbnail";
import { PlaylistInfo } from "./playlist-info";

interface PlaylistGridCardProps {
  data: PlaylistGetManyType["items"][number];
}
export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK}
          title={data.name}
          videoCount={data.videoCount}
        />
        <PlaylistInfo data={data} />
      </div>
    </Link>
  );
};
