"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { useState } from "react";
import { PlaylistVideosSection } from "../sections/playlist-videos-section";

export const PlaylistView = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PlaylistCreateModal open={open} onOpenChange={setOpen} />
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
        <div className="flex justify-between items-center">
          <div className="">
            <h1 className="text-2xl font-bold">Playlist</h1>
            <p className="text-xs text-muted-foreground">
              your collection of videos
            </p>
          </div>
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <PlusIcon />
          </Button>
        </div>
        <PlaylistVideosSection />
      </div>
    </>
  );
};
