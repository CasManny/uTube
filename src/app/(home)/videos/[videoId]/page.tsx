import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = 'force-dynamic'

interface VideoIdPageProps {
  params: Promise<{ videoId: string }>;
}
const videoIdPage = async ({ params }: VideoIdPageProps) => {
  const { videoId } = await params;
  void trpc.suggestions.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT
  })
  void trpc.vidoes.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default videoIdPage;
