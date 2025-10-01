import { auth } from "@clerk/nextjs/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase";

export type FoodPost = {
  id: string;
  created_at: string;
  user_id: string;
  place_name: string;
  notes: string | null;
  image_url: string | null;
};

function isMissingTableError(error: PostgrestError) {
  return error.code === "42P01";
}

function logSupabaseError(error: PostgrestError, context: string) {
  console.error(`[supabase] ${context}`, error);
}

export async function getFoodPostsForCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to load posts.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jajan_posts")
    .select("id, created_at, user_id, place_name, notes, image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError(error, "Unable to fetch jajan_posts list");

    if (isMissingTableError(error)) {
      console.warn(
        "Supabase table 'jajan_posts' not found. Returning an empty list so the UI can render. Make sure to run the SQL from tech-doc.md.",
      );
      return [];
    }

    throw new Error(error.message || "Failed to load food posts");
  }

  return (data ?? []) as FoodPost[];
}

export async function getFoodPostByIdForCurrentUser(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to load a post.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jajan_posts")
    .select("id, created_at, user_id, place_name, notes, image_url")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logSupabaseError(error, `Unable to fetch jajan_posts entry ${id}`);

    if (isMissingTableError(error)) {
      return null;
    }

    throw new Error(error.message || "Failed to load food post");
  }

  return data as FoodPost | null;
}
