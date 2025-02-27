import { db } from "@/db";
import { videoReactions, videos } from "@/db/schema";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionsRouter = createTRPCRouter({
  like: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        );

      if (existingVideoReaction) {
        const [deletedVideoReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId)
            )
          )
          .returning();

        return deletedVideoReaction;
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          videoId,
          userId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createdVideoReaction;
    }),

  dislike: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingDislikeVideo] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.userId, userId),
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.type, "dislike")
          )
        );

      if (existingDislikeVideo) {
        const [deletedDislikeVideo] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.videoId, videoId)
            )
          )
          .returning();

        return deletedDislikeVideo;
      }

      const [createdDislikeVideo] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning();

      return createdDislikeVideo;
    }),
});
