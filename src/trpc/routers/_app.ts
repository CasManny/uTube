import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { createTRPCRouter } from "../init";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { subcriptionRouter } from "@/modules/subcriptions/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
export const appRouter = createTRPCRouter({
  studio: studioRouter,
  vidoes: videosRouter,
  search: searchRouter,
  comments: commentsRouter,
  videoViews: videoViewsRouter,
  categories: categoriesRouter,
  suggestions: suggestionsRouter,
  subcriptions: subcriptionRouter,
  videoReactions: videoReactionsRouter,
  commentReactions: commentReactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
