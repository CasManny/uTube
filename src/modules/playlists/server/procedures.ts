import { db } from "@/db";
import {
  playlists,
  playlistsVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
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
          videoCount: db.$count(
            playlistsVideos,
            eq(playlistsVideos.playlistId, playlists.id)
          ),
          user: users,
          thumbnailUrl: sql<string | null>`(
          SELECT v.thumbnail_url
          FROM ${playlistsVideos} pv
          JOIN ${videos} v ON v.id = pv.video_id
          WHERE pv.playlist_id = ${playlists.id}
          ORDER BY pv.updated_at DESC
          LIMIT 1
          )`,
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
  getManyForVideos: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
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
      const { cursor, limit, videoId } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistsVideos,
            eq(playlistsVideos.playlistId, playlists.id)
          ),
          user: users,
          containsVideo: videoId
            ? sql<boolean>`(
          SELECT EXISTS(
            SELECT 1
            FROM ${playlistsVideos} pv
            WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId}
          )
          )`
            : sql<boolean>`false`,
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
  addVideo: protectProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistsVideos)
        .where(
          and(
            eq(playlistsVideos.playlistId, playlistId),
            eq(playlistsVideos.videoId, videoId)
          )
        );

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT" });
      }
      const [createdPlaylistVideo] = await db
        .insert(playlistsVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      return createdPlaylistVideo;
    }),
  removeVideo: protectProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistsVideos)
        .where(
          and(
            eq(playlistsVideos.playlistId, playlistId),
            eq(playlistsVideos.videoId, videoId)
          )
        );

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistsVideos)
        .where(
          and(
            eq(playlistsVideos.playlistId, playlistId),
            eq(playlistsVideos.videoId, videoId)
          )
        )
        .returning();

      return deletedPlaylistVideo;
    }),
  getVideos: baseProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
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
      const { cursor, limit, playlistId } = input;

      const videosFromPlaylist = db.$with("videos_from_playlist").as(
        db
          .select({
            videoId: playlistsVideos.videoId,
          })
          .from(playlistsVideos)
          .where(eq(playlistsVideos.playlistId, playlistId))
      );

      const data = await db
        .with(videosFromPlaylist)
        .select({
          user: users,
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
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
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          videosFromPlaylist,
          eq(videosFromPlaylist.videoId, videos.id)
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
  getOne: protectProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.userId, userId), eq(playlists.id, id)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingPlaylist;
    }),

  remove: protectProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.userId, userId), eq(playlists.id, id)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [deletedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
        .returning();
      
      if (!deletedPlaylist) {
        throw new TRPCError({code: 'NOT_FOUND'})
      }

      return deletedPlaylist;
    }),
});
