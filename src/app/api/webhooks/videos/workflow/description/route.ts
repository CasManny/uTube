import { db } from "@/db";
import { videos } from "@/db/schema";
import { geminiAIModel } from "@/lib/model";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}
const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new Error("Not found");
    }

    return existingVideo;
  });

  const getTranscript = await context.run('get_transcript', async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`
    const response = await fetch(trackUrl)
    const text = response.text()
    if (!text) {
      throw new Error("No transcript available")
    }
    return text
  })

  const generatedDescription = await context.run("generate-title", async () => {
    const prompt = `${DESCRIPTION_SYSTEM_PROMPT}\n\nTranscript:\n${getTranscript}`;
    const result = await geminiAIModel.generateContent(prompt);
    const description = result.response.text();
    if (!description) {
      throw new Error("Bad request")
    }
    return description;
  });
 
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        description: generatedDescription || video.description,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});