"use client";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2, PlusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadButton = () => {
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
  return (
    <>
      <ResponsiveModal
        title="upload a video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
        <StudioUploader onSuccess={() => {}} endpoint={create.data.url} />
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
