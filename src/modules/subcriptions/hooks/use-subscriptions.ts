import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubcriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscription = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubcriptionProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subcribe = trpc.subcriptions.create.useMutation({
    onSuccess: () => {
      toast.success("subscribed");
      if (fromVideoId) {
        utils.vidoes.getOne.invalidate({ id: fromVideoId });
        utils.vidoes.getManySubscribed.invalidate()
      }
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const unSubcribe = trpc.subcriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      if (fromVideoId) {
        utils.vidoes.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subcribe.isPending || unSubcribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unSubcribe.mutate({ userId });
    } else {
      subcribe.mutate({ userId });
    }
  };

  return {
    isPending,
    onClick,
  };
};
