import { ResponsiveModal } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils()

  const onClientUploadComplete = () => {
    utils.studio.getOne.invalidate({ videoId })
    utils.studio.getMany.invalidate()
    onOpenChange(false)
  }
  return (
    <ResponsiveModal
      title="Upload a Thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        onClientUploadComplete={onClientUploadComplete}
        input={{ videoId }}
        endpoint={"thumbnailUploader"} />
    </ResponsiveModal>
  );
};
