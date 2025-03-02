import Link from "next/link";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDown,
  ThumbsUp,
  Trash2Icon,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
}
export const CommentItem = ({ comment }: CommentItemProps) => {
  const { userId } = useAuth();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("removed comment");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      toast.success("reaction added");
      utils.comments.getMany.invalidate({videoId: comment.videoId})
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      toast.success("dislike reaction added");
      utils.comments.getMany.invalidate({videoId: comment.videoId})
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const isPending = like.isPending || dislike.isPending
  return (
    <div className="">
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0 5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.value}</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              <Button
                size={"icon"}
                disabled={isPending}
                variant={"ghost"}
                className="size-8"
                onClick={() => like.mutate({commentId: comment.id})}
              >
                <ThumbsUp
                  className={cn(
                    comment.viewReaction === "like" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                size={"icon"}
                disabled={isPending}
                variant={"ghost"}
                className="size-8"
                onClick={() => dislike.mutate({ commentId: comment.id})}
              >
                <ThumbsDown
                  className={cn(
                    comment.viewReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon className="" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>
            {userId === comment.user.clerkId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ commentId: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
