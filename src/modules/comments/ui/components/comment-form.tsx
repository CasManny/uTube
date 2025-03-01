import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentsInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
}

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const { user } = useClerk();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const form = useForm<z.infer<typeof commentsInsertSchema>>({
    resolver: zodResolver(commentsInsertSchema.omit({ userId: true })),
    defaultValues: {
      videoId: videoId,
      value: "",
    },
  });
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      toast.success("comment added");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const onSubmit = (values: z.infer<typeof commentsInsertSchema>) => {
    create.mutate(values);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 group">
        <UserAvatar
          name={user?.username || "User"}
          size={"lg"}
          imageUrl={user?.imageUrl || "/placeholder.svg"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Add a comment..."
                    {...field}
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            <Button
              className=""
              type="submit"
              size={"sm"}
              disabled={create.isPending}
            >
              comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
