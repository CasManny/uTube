import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

interface VideoIdProps {
  params: Promise<{ videoId: string }>;
}

const VideoId = async ({ params }: VideoIdProps) => {
  const { videoId } = await params;
    void trpc.studio.getOne.prefetch({ videoId });
    void trpc.categories.getMany.prefetch()
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoId;
