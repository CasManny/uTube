import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubcriptionButton } from "@/modules/subcriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscription } from "@/modules/subcriptions/hooks/use-subscriptions";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: VideoGetOneOutput["id"];
}
export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubcribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size={"lg"} name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subcriberCount} subcribers
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button asChild className="rounded-full" variant={"secondary"}>
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubcriptionButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscribed={user.viewerSubcribed}
          className="flex-none"
        />
      )}
    </div>
  );
};
