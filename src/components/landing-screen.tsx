"use client";

import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="flex items-center justify-between px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-400 to-pink-500 text-white flex items-center justify-center font-semibold">
            JJ
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Jurnal Jajan
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Shared food memories
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <SignInButton mode="modal">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </SignInButton>
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-16">
        <section className="max-w-5xl mx-auto text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-orange-200 dark:border-orange-900/60 bg-white/60 dark:bg-white/5 px-3 py-1 text-xs sm:text-sm font-medium text-orange-500 dark:text-orange-300 mb-6">
            <Sparkles className="h-4 w-4" />
            Document every delicious moment
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold font-parkinsans text-slate-900 dark:text-white leading-tight">
            A cozy food journal for you and your favorite person
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Capture where you ate, what you loved, and how it felt. Keep track of your culinary adventures together with photos, notes, and a touch of AI magic.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2 text-base">
                <Sparkles className="h-5 w-5" />
                Start journaling
              </Button>
            </SignInButton>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Login required • Personal use only
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
