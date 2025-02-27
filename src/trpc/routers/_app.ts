import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { createTRPCRouter } from "../init";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
export const appRouter = createTRPCRouter({
  studio: studioRouter,
  vidoes: videosRouter,
  videoViews: videoViewsRouter,
  categories: categoriesRouter,
  videoReactions: videoReactionsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
