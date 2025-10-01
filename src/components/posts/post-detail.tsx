"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { FoodPost } from "@/lib/food-posts";
import { EditPostDialog } from "@/components/posts/edit-post-dialog";
import { deleteFoodPostAction } from "@/lib/food-posts-actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PostDetailProps {
  post: FoodPost;
}

export function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteFoodPostAction(post.id, post.image_url);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete entry");
      setIsDeleting(false);
      return;
    }

    toast.success("Entry deleted");
    setIsDeleting(false);
    setConfirmDelete(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to journal
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 shadow-sm overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
              {post.image_url ? (
                <Image
                  src={post.image_url}
                  alt={post.place_name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                  No photo uploaded
                </div>
              )}
            </div>
            <div className="space-y-5 px-6 py-6 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-orange-500 dark:text-orange-300">
                  {format(new Date(post.created_at), "MMMM d, yyyy")}
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                  {post.place_name}
                </h1>
              </div>

              {post.notes ? (
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                  {post.notes}
                </p>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/40 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                  No notes yet — add something memorable!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditPostDialog
        post={post}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          setEditOpen(false);
          toast.success("Entry updated");
          router.refresh();
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action removes the post and its stored photo. You cannot undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
