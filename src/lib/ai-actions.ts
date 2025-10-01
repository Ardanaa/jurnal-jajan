"use server";

import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const SUMMARY_PROMPT = `You are a warm food journaling assistant. Summarize the following personal food note in 1-2 sentences. Keep the first-person voice, highlight feelings, textures, and standout bites. Avoid generic phrases.

NOTE:
{{note}}
`;

const TITLE_PROMPT = `You are a creative copywriter. Craft one playful, romantic headline (max 6 words) for the following food memory.

If a place name is provided, feel free to weave it in naturally.

NOTE:
{{note}}

PLACE (optional):
{{place}}
`;

function getModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-3-haiku-20240307");
  }

  throw new Error("No AI provider configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY.");
}

export async function generateNoteMagicAction(input: {
  note: string;
  placeName?: string | null;
  mode: "summary" | "title";
}) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Sign in required." };
  }

  const note = input.note?.trim();

  if (!note) {
    return { success: false, error: "Write a note first so AI has context." };
  }

  try {
    const model = getModel();

    const prompt = input.mode === "summary"
      ? SUMMARY_PROMPT.replace("{{note}}", note)
      : TITLE_PROMPT.replace("{{note}}", note).replace(
          "{{place}}",
          input.placeName?.trim() || "Unknown place",
        );

    const { text } = await generateText({
      model,
      prompt,
    });

    return {
      success: true,
      text: text.trim(),
      mode: input.mode,
    } as const;
  } catch (error) {
    console.error("AI magic failed", error);
    return {
      success: false,
      error: "AI magic fizzled out. Try again in a sec.",
    } as const;
  }
}
