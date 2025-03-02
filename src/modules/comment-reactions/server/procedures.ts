import { db } from "@/db";
import { commentReactions, users } from "@/db/schema";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
  like: protectProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingCommentReactionLike] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.type, "like"),
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, commentId)
          )
        );

      if (existingCommentReactionLike) {
        const [deletedReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId)
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createLikeReaction] = await db
        .insert(commentReactions)
        .values({
          userId,
          commentId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createLikeReaction;
    }),
  dislike: protectProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingCommentReactionDislike] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.type, "dislike"),
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId)
          )
        );

      if (existingCommentReactionDislike) {
        const [deletedReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              eq(commentReactions.commentId, commentId)
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createdDislikeReaction] = await db
        .insert(commentReactions)
        .values({
          userId,
          commentId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: {
            type: "dislike",
          },
        })
          .returning();
        
        return createdDislikeReaction
    }),
});
