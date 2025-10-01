"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FoodPost } from "@/lib/food-posts";
import { updateFoodPostAction } from "@/lib/food-posts-actions";
import { PostForm } from "@/components/posts/post-form";
import { toast } from "sonner";

interface EditPostDialogProps {
  post: FoodPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPostDialog({ post, open, onOpenChange, onSuccess }: EditPostDialogProps) {
  if (!post) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>
          <DialogDescription>
            Update the place details, your notes, or swap the photo.
          </DialogDescription>
        </DialogHeader>
        <PostForm
          mode="edit"
          post={post}
          action={updateFoodPostAction.bind(null, post.id)}
          submitLabel="Update entry"
          pendingLabel="Updating…"
          onSuccess={() => {
            toast.success("Entry updated");
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
