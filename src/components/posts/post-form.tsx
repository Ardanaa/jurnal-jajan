"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FoodPost } from "@/lib/food-posts";
import { generateNoteMagicAction } from "@/lib/ai-actions";

interface PostFormProps {
  mode: "create" | "edit";
  post?: FoodPost | null;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string } | { success: boolean; id: string }>;
  onSuccess: () => void;
  submitLabel?: string;
  pendingLabel?: string;
  footerSlot?: ReactNode;
}

export function PostForm({
  mode,
  post,
  action,
  onSuccess,
  submitLabel = "Save entry",
  pendingLabel = "Saving…",
  footerSlot,
}: PostFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [placeName, setPlaceName] = useState(post?.place_name ?? "");
  const [notesValue, setNotesValue] = useState(post?.notes ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(post?.image_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isMagicPending, startMagic] = useTransition();

  useEffect(() => {
    setPlaceName(post?.place_name ?? "");
    setNotesValue(post?.notes ?? "");
    setPreviewUrl(post?.image_url ?? null);
    previewUrlRef.current = null;
  }, [post?.place_name, post?.notes, post?.image_url]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const handleSubmit = (formData: FormData) => {
    setError(null);

    formData.set("placeName", placeName.trim());
    formData.set("notes", notesValue);

    if (mode === "edit") {
      formData.set("existingImageUrl", post?.image_url ?? "");
    }

    startSaving(() => {
      action(formData).then((result) => {
        if (!result.success) {
          const message = "error" in result && result.error ? result.error : "Unable to save entry.";
          setError(message);
          return;
        }

        if (mode === "create") {
          formRef.current?.reset();
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
          }
          setPlaceName("");
          setNotesValue("");
          setPreviewUrl(null);
        }

        onSuccess();
      });
    });
  };

  const handleMagic = (mode: "summary" | "title") => {
    if (!notesValue.trim()) {
      toast.error("Write a note first so AI has something to reference.");
      return;
    }

    startMagic(() => {
      generateNoteMagicAction({ note: notesValue, placeName, mode }).then((result) => {
        if (!result.success || !result.text || !result.text.trim()) {
          toast.error(result.error ?? "AI magic fizzled out. Try again.");
          return;
        }

        if (mode === "summary") {
          setNotesValue(result.text.trim());
          toast.success("Note summarized by AI");
        } else {
          const creative = result.text.trim();
          setNotesValue((prev) => {
            const trimmed = prev.trim();
            if (!creative.length) {
              return prev;
            }
            if (trimmed.startsWith(creative)) {
              return prev;
            }
            return [creative, trimmed].filter(Boolean).join("\n\n");
          });
          toast.success("Creative title added to the top");
        }
      });
    });
  };

  return (
    <form
      ref={formRef}
      className="space-y-6"
      encType="multipart/form-data"
      action={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="placeName">Place name *</Label>
        <Input
          id="placeName"
          name="placeName"
          placeholder="e.g. Blue Bottle Coffee Roastery"
          value={placeName}
          onChange={(event) => setPlaceName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes">Notes</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={isMagicPending}
              >
                <Sparkles className="h-4 w-4" />
                {isMagicPending ? "Working…" : "AI Magic"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem onClick={() => handleMagic("summary")}>
                Summarize note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMagic("title")}>
                Add creative title
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Textarea
          id="notes"
          name="notes"
          placeholder="What did you order? How did it taste? Any fun stories?"
          value={notesValue}
          onChange={(event) => setNotesValue(event.target.value)}
          rows={5}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          AI Magic will either tighten your note into a sweet summary or add a fun title to the top.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center justify-between" htmlFor="photo">
          <span>Photo</span>
          <span className="text-xs text-muted-foreground">JPEG or PNG up to 5MB</span>
        </Label>
        <Input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
              }
              const objectUrl = URL.createObjectURL(file);
              previewUrlRef.current = objectUrl;
              setPreviewUrl(objectUrl);
            } else {
              if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
              }
              setPreviewUrl(post?.image_url ?? null);
            }
          }}
        />
        {previewUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={post?.place_name ?? "Preview"}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            Add an image to make the memory pop
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {footerSlot}
        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
