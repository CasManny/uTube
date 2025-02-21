import { db } from "@/db";
import { z } from "zod";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
  getOne: protectProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
      
      if (!video) {
        throw new TRPCError({message: "No video found", code: "NOT_FOUND"})
      }

      return video
    }),
  getMany: protectProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last time if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;
      return {
        items,
        nextCursor,
      };
    }),
});
