"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PostForm } from "@/components/posts/post-form";
import { createFoodPostAction } from "@/lib/food-posts-actions";
import { toast } from "sonner";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePostDialog({ open, onOpenChange, onSuccess }: CreatePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New food memory</DialogTitle>
          <DialogDescription>
            Save the place, your thoughts, and a photo to remember it by.
          </DialogDescription>
        </DialogHeader>
        <PostForm
          mode="create"
          action={createFoodPostAction}
          submitLabel="Save entry"
          pendingLabel="Saving…"
          onSuccess={() => {
            toast.success("Entry saved");
            onSuccess();
          }}
          footerSlot={
            <p className="text-xs text-muted-foreground">
              Pro tip: jot down a favorite bite or something sweet they said.
            </p>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
