import { DEFAULT_LIMIT } from "@/constants";
import { LikedVideoViews } from "@/modules/playlists/ui/views/liked-videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const PlaylistsLikedVideos = () => {
  void trpc.playlists.getLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <LikedVideoViews />
    </HydrateClient>
  );
};

export default PlaylistsLikedVideos;
