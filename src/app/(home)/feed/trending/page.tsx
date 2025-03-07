import { DEFAULT_LIMIT } from "@/constants";
import { TrendingView } from "@/modules/home/ui/views/trending-veiw";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Trending = () => {
  void trpc.vidoes.getManyTrending.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
};

export default Trending;
