"use client";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2, PlusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const StudioUploadButton = () => {
  const utils = trpc.useUtils();
  const create = trpc.vidoes.create.useMutation({
    onSuccess: () => {
      toast.success("Video created")
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("something went wrong")
    }
  });
  return (
    <Button
      disabled={create.isPending}
      variant={"secondary"}
      onClick={() => create.mutate()}
    >
      {create.isPending ? <Loader2 className="animate-spin" /> : <PlusIcon />}
      Create
    </Button>
  );
};
