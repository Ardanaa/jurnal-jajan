"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { createSupabaseServerClient } from "@/lib/supabase";

const DEFAULT_BUCKET = "food-posts";
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_BUCKET;

function getStoragePathFromPublicUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.findIndex((segment) => segment === bucket);

    if (bucketIndex === -1) {
      return null;
    }

    const objectSegments = segments.slice(bucketIndex + 1).map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch (error) {
        console.warn("Failed to decode storage path segment", segment, error);
        return segment;
      }
    });

    return objectSegments.join("/");
  } catch (error) {
    console.error("Failed to parse storage URL", error);
    return null;
  }
}

async function uploadPhoto(file: File, userId: string) {
  const supabase = await createSupabaseServerClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name?.split(".").pop();
  const fileName = `${randomUUID()}${extension ? `.${extension}` : ""}`;
  const objectPath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    console.error("Failed to upload photo", uploadError);

    const normalizedMessage = uploadError.message?.toLowerCase?.() ?? "";
    const bucketMissingMessage = `Storage bucket "${bucket}" was not found. Create it in Supabase Storage (or set NEXT_PUBLIC_SUPABASE_BUCKET).`;

    if (normalizedMessage.includes("bucket") || uploadError.statusCode === "404") {
      throw new Error(bucketMissingMessage);
    }

    throw new Error(uploadError.message || "Unable to upload photo. Please try again.");
  }

  const {
    data: { publicUrl },
    error: urlError,
  } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  if (urlError) {
    console.error("Failed to generate public URL", urlError);
    throw new Error(urlError.message || "Unable to get photo URL. Please try again.");
  }

  return { publicUrl, path: objectPath };
}

export async function createFoodPostAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const placeName = formData.get("placeName")?.toString().trim();
  const notesValue = formData.get("notes")?.toString().trim();
  const file = formData.get("photo") as File | null;

  if (!placeName) {
    return { success: false, error: "Place name is required." };
  }

  const supabase = await createSupabaseServerClient();

  let imageUrl: string | null = null;

  if (file && file.size > 0) {
    try {
      const { publicUrl } = await uploadPhoto(file, userId);
      imageUrl = publicUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload photo.";
      return { success: false, error: message };
    }
  }

  const { data, error } = await supabase
    .from("jajan_posts")
    .insert({
      user_id: userId,
      place_name: placeName,
      notes: notesValue || null,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create food post", error);
    return { success: false, error: "Could not save entry. Please try again." };
  }

  revalidatePath("/");

  return { success: true, id: data.id };
}

export async function updateFoodPostAction(id: string, formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const placeName = formData.get("placeName")?.toString().trim();
  const notesValue = formData.get("notes")?.toString().trim();
  const file = formData.get("photo") as File | null;
  const existingImageUrl = formData.get("existingImageUrl")?.toString();

  if (!placeName) {
    return { success: false, error: "Place name is required." };
  }

  const supabase = await createSupabaseServerClient();

  let imageUrl: string | null = existingImageUrl || null;
  let uploadedPath: string | null = null;

  if (file && file.size > 0) {
    try {
      const uploadResult = await uploadPhoto(file, userId);
      imageUrl = uploadResult.publicUrl;
      uploadedPath = uploadResult.path;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload photo.";
      return { success: false, error: message };
    }
  }

  const { error } = await supabase
    .from("jajan_posts")
    .update({
      place_name: placeName,
      notes: notesValue || null,
      image_url: imageUrl,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update food post", error);

    if (uploadedPath) {
      await supabase.storage.from(bucket).remove([uploadedPath]);
    }

    return { success: false, error: "Could not update entry. Please try again." };
  }

  if (uploadedPath && existingImageUrl) {
    const previousPath = getStoragePathFromPublicUrl(existingImageUrl);
    if (previousPath) {
      await supabase.storage.from(bucket).remove([previousPath]);
    }
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);

  return { success: true };
}

export async function deleteFoodPostAction(id: string, imageUrl?: string | null) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("jajan_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete food post", error);
    return { success: false, error: "Could not delete entry. Please try again." };
  }

  if (imageUrl) {
    const path = getStoragePathFromPublicUrl(imageUrl);
    if (path) {
      await supabase.storage.from(bucket).remove([path]);
    }
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);

  return { success: true };
}
