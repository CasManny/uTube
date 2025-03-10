import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
  playlistId: string;
}

export const PlaylistHeaderSection = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={"loading"}>
      <ErrorBoundary fallback={"error"}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
    id: playlistId,
  });

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("playlist removed");
      utils.playlists.getMany.invalidate();
      router.replace(`/playlists`);
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });
  return (
    <div className="flex justify-between items-center">
      <div className="">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-xs text-muted-foreground">
          Videos from the playlist
        </p>
      </div>
      <Button
        variant={"outline"}
        size="icon"
        disabled={remove.isPending}
        className="rounded-full"
        onClick={() => remove.mutate({ id: playlist.id })}
      >
        <Trash2Icon className="" />
      </Button>
    </div>
  );
};
