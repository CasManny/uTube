import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";
import { redis } from "@/lib/redis";
import { ratelimit } from "@/lib/ratelimit";

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


export const protectProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.clerkUserId) {
    throw new TRPCError({
      message: "Not authorized User",
      code: "UNAUTHORIZED",
    });
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId));
  
  if (!user) {
    throw new TRPCError({message: "Not authorized user", code: "UNAUTHORIZED"})
  }


  const { success } = await ratelimit.limit(user.id)
  if (!success) {
    throw new TRPCError({message: "Too many request", code: "TOO_MANY_REQUESTS"})
  }

  return opts.next({
    ctx: {
      ...ctx,
      user
    },
  });
});
