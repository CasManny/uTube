import { DEFAULT_LIMIT } from "@/constants"
import { VideosView } from "@/modules/playlists/ui/views/video-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = 'force-dynamic'

interface PlaylistIdPageProps{
    params: Promise<{playlistId: string}>
}
const PlaylistIdPage = async ({ params }: PlaylistIdPageProps) => {
    const { playlistId } = await params
    void trpc.playlists.getVideos.prefetchInfinite({
        limit: DEFAULT_LIMIT,
        playlistId,
    })

    void trpc.playlists.getOne.prefetch({id: playlistId})
  return (
      <HydrateClient>
          <VideosView playlistId={playlistId} />
    </HydrateClient>
  )
}

export default PlaylistIdPage