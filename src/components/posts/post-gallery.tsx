"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { FoodPost } from "@/lib/food-posts";
import { EditPostDialog } from "@/components/posts/edit-post-dialog";
import { deleteFoodPostAction } from "@/lib/food-posts-actions";

interface PostGalleryProps {
  posts: FoodPost[];
  onCreate: () => void;
  onRefresh: () => void;
}

export function PostGallery({ posts, onCreate, onRefresh }: PostGalleryProps) {
  const [editPost, setEditPost] = useState<FoodPost | null>(null);
  const [deletePost, setDeletePost] = useState<FoodPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePost) return;

    setIsDeleting(true);
    const result = await deleteFoodPostAction(deletePost.id, deletePost.image_url);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      onRefresh();
    }

    setIsDeleting(false);
    setDeletePost(null);
  };

  if (!posts.length) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-200/80 dark:border-orange-900/50 bg-white/70 dark:bg-slate-950/40 p-10 text-center">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          Your shared food story starts here
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Add the first entry with a favorite place, a quick note, and a photo to remember the moment.
        </p>
        <Button className="mt-6" onClick={onCreate}>
          Add your first entry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="group overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {post.image_url ? (
                <Image
                  src={post.image_url}
                  alt={post.place_name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-200/60 to-amber-100/60 dark:from-orange-900/40 dark:to-amber-800/30 text-orange-600 dark:text-orange-300 text-sm font-medium">
                  No photo yet
                </div>
              )}
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-black/20 text-white backdrop-blur hover:bg-black/40"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditPost(post)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setDeletePost(post)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="space-y-2 px-4 py-4">
              <Link href={`/posts/${post.id}`} className="block">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {post.place_name}
                </h3>
              </Link>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {format(new Date(post.created_at), "MMM d, yyyy")}
              </p>
              {post.notes ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {post.notes}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400 dark:text-slate-500">
                  No notes yet. Tap to add thoughts.
                </p>
              )}
            </CardContent>
            <CardFooter className="px-4 pb-4">
              <Link
                href={`/posts/${post.id}`}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-300"
              >
                View story →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <EditPostDialog
        post={editPost}
        open={!!editPost}
        onOpenChange={(open) => {
          if (!open) {
            setEditPost(null);
          }
        }}
        onSuccess={() => {
          setEditPost(null);
          toast.success("Entry updated");
          onRefresh();
        }}
      />

      <AlertDialog open={!!deletePost} onOpenChange={(open) => !open && setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the post permanently. Photos stored in Supabase will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
