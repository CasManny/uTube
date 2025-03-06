import { db } from "@/db";
import {
  subcriptions,
  users,
  videoReactions,
  videos,
  videoViews,
  vidoeUpdateSchema,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, isNotNull, lt, or } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  create: protectProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*",
    });
    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return {
      video,
      url: upload.url,
    };
  }),
  update: protectProcedure
    .input(vidoeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({ message: "Bad request", code: "BAD_REQUEST" });
      }
      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.userId, userId), eq(videos.id, input.id)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return updatedVideo;
    }),
  deleteVideo: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
        .returning();

      if (!removedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return removedVideo;
    }),
  restoreThumbnail: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi();
        await utApi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const utApi = new UTApi();
      const uploadedThumbnail = await utApi.uploadFilesFromUrl(
        tempThumbnailUrl
      );
      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),

  generateThumbnail: protectProcedure
    .input(
      z.object({
        videoId: z.string(),
        prompt: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId, prompt } = input;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/webhooks/videos/workflows/prompt`,
        body: { userId, videoId, prompt },
      });

      return workflowRunId;
    }),
  generateTitle: protectProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/webhooks/videos/workflows/title`,
        body: { userId, videoId },
      });

      return workflowRunId;
    }),
  generateDescription: protectProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/webhooks/videos/workflows/description`,
        body: { userId, videoId },
      });

      return workflowRunId;
    }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;
      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const viewerSubcriptions = db.$with("viewer_subcription").as(
        db
          .select()
          .from(subcriptions)
          .where(inArray(subcriptions.viewerId, userId ? [userId] : []))
      );

      const [existingVideo] = await db
        .with(viewerReactions, viewerSubcriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subcriberCount: db.$count(
              subcriptions,
              eq(subcriptions.creatorId, users.id)
            ),
            viewerSubcribed: isNotNull(viewerSubcriptions.viewerId).mapWith(
              Boolean
            ),
          },
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          viewerReactions: viewerReactions.type,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubcriptions,
          eq(viewerSubcriptions.creatorId, users.id)
        )
        .where(eq(videos.id, input.id));
      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return existingVideo;
    }),
  revalidate: protectProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const directUpload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );
      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);

      if (!asset) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const playbackId = asset.playback_ids?.[0].id;
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: playbackId,
          muxAssetId: asset.id,
          duration: duration,
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, categoryId } = input;
      const data = await db
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
            eq(videos.visibility, 'public'),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
