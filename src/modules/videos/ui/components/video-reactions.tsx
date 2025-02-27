import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import React from "react";
import { VideoGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReactions"];
}
export const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const like = trpc.videoReactions.like.useMutation({
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSuccess: () => {
      utils.vidoes.getOne.invalidate({ id: videoId });
    },
  });
  const dislike = trpc.videoReactions.dislike.useMutation({
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSuccess: () => {
      utils.vidoes.getOne.invalidate({ id: videoId });
    },
  });
  return (
    <div className="flex items-center flex-none">
      <Button
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant={"secondary"}
        className="rounded-l-full rounded-r-full gap-2 pr-2"
      >
        <ThumbsUp
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        onClick={() => dislike.mutate({ videoId })}
        disabled={dislike.isPending || like.isPending}
        variant={"secondary"}
        className="rounded-l-none rounded-r-full gap-2 pl-3"
      >
        <ThumbsDown
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  );
};
