"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { FoodPost } from "@/lib/food-posts";
import { CreatePostDialog } from "@/components/posts/create-post-dialog";
import { PostGallery } from "@/components/posts/post-gallery";

interface DashboardClientProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  posts: FoodPost[];
}

export function DashboardClient({ user, posts }: DashboardClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const greeting = useMemo(() => {
    if (user.firstName) {
      return `Hi, ${user.firstName}!`;
    }
    return "Welcome back!";
  }, [user.firstName]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-300">
              Jurnal Jajan
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {greeting}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              className="gap-2"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New entry
            </Button>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 flex flex-col gap-6">
        <section className="grid gap-4 rounded-3xl bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-slate-50 dark:from-orange-400/10 dark:via-orange-500/5 dark:to-slate-900 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Keep your shared cravings in one place
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                Snap a quick photo, jot down a note, and build the ultimate guide to the bites you love together.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-orange-200 dark:border-orange-900/60"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add new entry
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-4 py-2">
              <UtensilsCrossed className="h-4 w-4 text-orange-500" />
              {posts.length} saved spots
            </div>
          </div>
        </section>

        <section>
          <PostGallery
            posts={posts}
            onCreate={() => setIsCreateOpen(true)}
            onRefresh={() => router.refresh()}
          />
        </section>
      </main>

      <CreatePostDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          setIsCreateOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
