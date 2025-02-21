"use client";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2, PlusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadButton = () => {
  const router = useRouter()
  const utils = trpc.useUtils();
  const create = trpc.vidoes.create.useMutation({
    onSuccess: () => {
      toast.success("Video created");
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const onSuccess = () => {
    if (!create?.data?.video.id) {
      return
    }
    create.reset()
    router.push(`/studio/videos/${create.data.video.id}`)

  }
  return (
    <>
      <ResponsiveModal
        title="upload a video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
        <StudioUploader onSuccess={onSuccess} endpoint={create.data.url} />
        ): (
          <Loader2 className="animate-spin" />
        )}
      </ResponsiveModal>
      <Button
        disabled={create.isPending}
        variant={"secondary"}
        onClick={() => create.mutate()}
      >
        {create.isPending ? <Loader2 className="animate-spin" /> : <PlusIcon />}
        Create
      </Button>
    </>
  );
};
