import { db } from "@/db";
import {
  playlists,
  playlistsVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
  getHistory: protectProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const data = await db
        .with(viewerVideoViews)
        .select({
          user: users,
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          viewedAt: viewerVideoViews.viewedAt,
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "like"),
              eq(videoReactions.videoId, videos.id)
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "dislike"),
              eq(videoReactions.videoId, videos.id)
            )
          ),
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerVideoViews, eq(viewerVideoViews.videoId, videos.id))
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last time if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;
      return {
        items,
        nextCursor,
      };
    }),
  getLiked: protectProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            likedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "like")
            )
          )
      );

      const data = await db
        .with(viewerVideoReactions)
        .select({
          user: users,
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likedAt: viewerVideoReactions.likedAt,
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "like"),
              eq(videoReactions.videoId, videos.id)
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "dislike"),
              eq(videoReactions.videoId, videos.id)
            )
          ),
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoReactions.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReactions.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          viewerVideoReactions,
          eq(viewerVideoReactions.videoId, videos.id)
        )
        .orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last time if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, likedAt: lastItem.likedAt }
        : null;
      return {
        items,
        nextCursor,
      };
    }),
  create: protectProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const { id: userId } = ctx.user;

      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          name,
          userId,
        })
        .returning();

      if (!createdPlaylist) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return createdPlaylist;
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
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(playlistsVideos, eq(playlistsVideos.playlistId, playlists.id)),
          user: users
        })
        .from(playlists)
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(playlists.userId, users.id))
        .orderBy(desc(playlists.updatedAt), desc(videos.id))
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
