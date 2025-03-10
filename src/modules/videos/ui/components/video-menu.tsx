import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";
import { ListPlusIcon, MoreVertical, ShareIcon, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export const VideoMenu = ({
  variant = "ghost",
  onRemove,
  videoId,
}: VideoMenuProps) => {
  const [openAddPlaylist, setOpenAddPlaylist] = useState(false);
  const onShare = async () => {
    const fullUrl = `${
      process.env.VERCEL_URL || "http://localhost:3000"
    }/videos/${videoId}`;
    await navigator.clipboard.writeText(fullUrl);
    toast.success("copied successfully");
  };

  return (
    <>
      <PlaylistAddModal
        videoId={videoId}
        open={openAddPlaylist}
        onOpenChange={setOpenAddPlaylist}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={"icon"} className="rounded-full">
            <MoreVertical className="" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenAddPlaylist(true)}>
            <ListPlusIcon className="mr-2 size-4" />
            Add to playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={() => {}}>
              <Trash className="mr-2 size-4" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
