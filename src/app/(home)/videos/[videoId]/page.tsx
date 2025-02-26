import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface VideoIdPageProps {
  params: Promise<{ videoId: string }>;
}
const videoIdPage = async ({ params }: VideoIdPageProps) => {
  const { videoId } = await params;
  void trpc.vidoes.getOne.prefetch({ id: videoId });
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default videoIdPage;
