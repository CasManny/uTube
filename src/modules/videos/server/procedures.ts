import { db } from "@/db";
import { videos, vidoeUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const thumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
});
