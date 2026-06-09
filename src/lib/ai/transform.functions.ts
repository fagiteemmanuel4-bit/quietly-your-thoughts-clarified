import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FormatEnum = z.enum(["notes", "summary", "todo", "message"]);

const PROMPTS: Record<z.infer<typeof FormatEnum>, string> = {
  notes:
    "Rewrite the user's raw thoughts as clean, organized notes. Use clear section headings and concise sentences. Preserve meaning. Use markdown.",
  summary:
    "Distill the user's input into a tight bullet-point summary. Each bullet should be one short, crisp line capturing a key point. Use markdown bullets (-).",
  todo:
    "Extract every actionable item from the user's input as a clear to-do list in markdown checkbox format (- [ ] task). Be specific and concrete.",
  message:
    "Rewrite the user's raw thoughts into a single polished, professional message ready to send. Keep their voice, but make it clear, warm, and well-structured. Plain text.",
};

export const transformText = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      input: z.string().min(1).max(8000),
      format: FormatEnum,
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROMPTS[data.format] },
          { role: "user", content: data.input },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    if (!res.ok) throw new Error(`AI error: ${res.status}`);

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { output: json.choices[0]?.message?.content?.trim() ?? "" };
  });
