"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videos, vidoeUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  LockIcon,
  MoreVertical,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FormSectionProps {
  videoId: string;
}
export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={"error"}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return <p>Loading...</p>;
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const fullUrl = `${
    process.env.VERCEL_URL || "http://localhost:3000"
  }/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);
  const [video] = trpc.studio.getOne.useSuspenseQuery({ videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.vidoes.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ videoId });
      toast.success("Video updated");
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const deleteVideo = trpc.vidoes.deleteVideo.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video deleted");
      router.replace(`/studio/video`);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const form = useForm<z.infer<typeof vidoeUpdateSchema>>({
    resolver: zodResolver(vidoeUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof vidoeUpdateSchema>) => {
    update.mutate(data);
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div className="">
            <h1 className="text-2xl font-bold">Video Details</h1>
            <p className="text-xs text-muted-foreground">
              Manage your Video details
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <Button type="submit" disabled={update.isPending}>
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => deleteVideo.mutate({ videoId })}
                >
                  <TrashIcon className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-8 lg:col-span-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  {/* { TODO: ADD AI GENERATE BUTTON} */}
                  <FormControl>
                    <Input placeholder="Add a title to your video" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  {/* { TODO: ADD AI GENERATE BUTTON} */}
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      value={field.value ?? ""}
                      className="resize-none pr-10"
                      placeholder="Add a title to your video"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* { ADD THUMBNAIL FIELD HERE} */}

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {/* { TODO: ADD AI GENERATE BUTTON} */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-8 lg:col-span-2">
            <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
              <div className="aspect-video overflow-hidden relative">
                <VideoPlayer
                  playbackId={video.muxPlaybackId}
                  thumbnailUrl={video.thumbnailUrl}
                />
              </div>
              <div className="p-4 flex flex-col gap-y-6">
                <div className="flex justify-between items-center gap-x-2">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-muted-foreground text-xs">Video link</p>
                    <div className="flex items-center gap-x-2">
                      <Link href={`/videos/${video.id}`}>
                        <p className="line-clamp-1 text-sm text-blue-500">
                          {fullUrl}
                        </p>
                      </Link>
                      <Button
                        className="shrink-0"
                        onClick={onCopy}
                        type="button"
                        variant={"ghost"}
                        size={"icon"}
                        disabled={isCopied}
                      >
                        {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-muted-foreground">Video status</p>
                    <p>{snakeCaseToTitle(video.muxStatus || "preparing")}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-muted-foreground">subtitle status</p>
                    <p>
                      {snakeCaseToTitle(video.muxTrackStatus || "no_audio")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  {/* { TODO: ADD AI GENERATE BUTTON} */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe2Icon className="size-4 mr-2" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <LockIcon className="size-4 mr-2" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
