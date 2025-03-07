import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/home/ui/views/subscription-veiw";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Subscriptions = () => {
  void trpc.vidoes.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default Subscriptions;
