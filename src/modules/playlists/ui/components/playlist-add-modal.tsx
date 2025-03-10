import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CheckIcon, Loader2, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean;
  videoId: string;
  onOpenChange: (open: boolean) => void;
}

export const PlaylistAddModal = ({
  open,
  videoId,
  onOpenChange,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlists.getManyForVideos.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        videoId,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
        enabled: !!videoId && open,
      }
    );
  const handleOpenChange = (newOpen: boolean) => {
    utils.playlists.getManyForVideos.invalidate({ videoId });
    onOpenChange(newOpen);
  };

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video added to playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideos.invalidate({ videoId });
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideos.invalidate({ videoId });
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const isPending = removeVideo.isPending || addVideo.isPending;

  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button
                className="w-full justify-start [&_svg]:size-5"
                size={"lg"}
                disabled={isPending}
                key={playlist.id}
                variant={"ghost"}
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideo.mutate({ playlistId: playlist.id, videoId });
                  } else {
                    addVideo.mutate({ playlistId: playlist.id, videoId });
                  }
                }}
              >
                {playlist.containsVideo ? <CheckIcon /> : <SquareIcon />}
              </Button>
            ))}
        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
