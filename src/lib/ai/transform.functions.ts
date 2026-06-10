import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const FormatEnum = z.enum([
  "notes",
  "summary",
  "todo",
  "message",
  "email",
  "report",
  "action_plan",
]);
export type Format = z.infer<typeof FormatEnum>;

const PROMPTS: Record<Format, string> = {
  notes:
    "Rewrite the user's raw thoughts as clean, organized notes. Use clear section headings (## H2) and concise sentences. Preserve meaning. Markdown.",
  summary:
    "Distill the user's input into a tight bullet-point summary. Each bullet is one short, crisp line. Use markdown bullets (-).",
  todo: "Extract every actionable item as a clear to-do list using markdown checkboxes (- [ ] task). Start each with a verb. Be specific.",
  message:
    "Rewrite the user's raw thoughts into a single polished message ready to send. Keep their voice, but make it clear, warm, well-structured. Plain text.",
  email:
    "Rewrite as a professional email with Subject line, greeting, well-structured body paragraphs, and a sign-off. Format:\nSubject: ...\n\nHi [name],\n\n...\n\nBest,",
  report:
    "Structure as a brief professional report with: ## Overview, ## Key Points, ## Findings, ## Recommendations, ## Next Steps. Use markdown.",
  action_plan:
    "Create a structured action plan with: ## Objective, ## Milestones (numbered), ## Tasks (- [ ] each with owner/deadline if inferable), ## Risks, ## Success Criteria. Markdown.",
};

const ToneEnum = z.enum(["neutral", "warm", "concise", "formal", "casual"]).optional();

export const transformText = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      input: z.string().min(1).max(12000),
      format: FormatEnum,
      tone: ToneEnum,
      context: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const toneInstruction = data.tone && data.tone !== "neutral" ? `\nTone: ${data.tone}.` : "";
    const contextInstruction = data.context ? `\nAdditional context: ${data.context}` : "";

    const system =
      PROMPTS[data.format] +
      toneInstruction +
      contextInstruction +
      "\n\nKeep output focused and never include preamble like 'Here is...'.";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quietly.app",
        "X-Title": "Quietly",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.input },
        ],
        temperature: 0.5,
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (res.status === 401 || res.status === 402)
      throw new Error("AI credits exhausted. Please add OpenRouter credits.");
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI error: ${res.status} — ${txt.slice(0, 140)}`);
    }

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { output: json.choices[0]?.message?.content?.trim() ?? "" };
  });

export const dailyBrief = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().optional(),
      thoughts: z.array(z.string()).max(20).optional(),
      tasks: z.array(z.string()).max(20).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const user =
      [
        data.name ? `User: ${data.name}` : "",
        data.thoughts?.length ? `Recent thoughts:\n${data.thoughts.join("\n---\n")}` : "",
        data.tasks?.length ? `Open tasks:\n${data.tasks.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n") || "No data yet — give a calm, encouraging blank-slate brief.";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quietly.app",
        "X-Title": "Quietly",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You write a 3-4 sentence calm daily brief for a thinker's workspace. No headings, no lists — just a flowing, gently focused paragraph that highlights what matters today. Address the user by first name if provided.",
          },
          { role: "user", content: user },
        ],
        temperature: 0.6,
      }),
    });

    if (!res.ok) throw new Error(`Brief error: ${res.status}`);
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    return { brief: json.choices[0]?.message?.content?.trim() ?? "" };
  });

export const suggestTasks = createServerFn({ method: "POST" })
  .inputValidator(z.object({ thoughts: z.array(z.string()).min(1).max(20) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quietly.app",
        "X-Title": "Quietly",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              'Extract 3-7 concrete actionable tasks from the user\'s recent thoughts. Respond ONLY with a JSON array: [{"title":"...","priority":"urgent"|"later"|"someday"}]. No prose, no code fences.',
          },
          { role: "user", content: data.thoughts.join("\n---\n") },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) throw new Error(`Suggest error: ${res.status}`);
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    const raw = json.choices[0]?.message?.content?.trim() ?? "[]";
    const cleaned = raw
      .replace(/^```json?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(cleaned) as {
        title: string;
        priority: "urgent" | "later" | "someday";
      }[];
      return { tasks: parsed };
    } catch {
      return { tasks: [] as { title: string; priority: "urgent" | "later" | "someday" }[] };
    }
  });
