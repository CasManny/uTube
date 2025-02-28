import { db } from "@/db";
import { subcriptions } from "@/db/schema";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const subcriptionRouter = createTRPCRouter({
  create: protectProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdSubcription] = await db
        .insert(subcriptions)
        .values({
          viewerId: ctx.user.id,
          creatorId: userId,
        })
        .returning();

      return createdSubcription;
    }),

  remove: protectProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [deletedSubcription] = await db
        .delete(subcriptions)
        .where(
          and(
            eq(subcriptions.viewerId, ctx.user.id),
            eq(subcriptions.creatorId, userId)
          )
        )
        .returning();

      return deletedSubcription;
    }),
});
