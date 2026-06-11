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

// ── Free model waterfall ───────────────────────────────────────────────────
const FREE_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
];

async function callOpenRouter(
  apiKey: string,
  messages: { role: string; content: string }[],
  attempt = 0,
): Promise<string> {
  const model = FREE_MODELS[attempt % FREE_MODELS.length];
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VITE_APP_URL || "https://quietly.app",
      "X-Title": "Quietly",
    },
    body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 2000 }),
  });

  if ((res.status === 429 || res.status === 503 || res.status === 502) && attempt < FREE_MODELS.length - 1) {
    return callOpenRouter(apiKey, messages, attempt + 1);
  }
  if (res.status === 401 || res.status === 402)
    throw new Error("AI credits exhausted. Please add OpenRouter credits.");
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI error: ${res.status} — ${txt.slice(0, 140)}`);
  }

  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content?.trim() ?? "";
}

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
    const output = await callOpenRouter(apiKey, [
      { role: "system", content: system },
      { role: "user", content: data.input },
    ]);
    return { output };
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
    const userContent =
      [
        data.name ? `User: ${data.name}` : "",
        data.thoughts?.length ? `Recent thoughts:\n${data.thoughts.join("\n---\n")}` : "",
        data.tasks?.length ? `Open tasks:\n${data.tasks.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n") || "No data yet — give a calm, encouraging blank-slate brief.";

    const brief = await callOpenRouter(apiKey, [
      {
        role: "system",
        content:
          "You write a 3-4 sentence calm daily brief for a thinker's workspace. No headings, no lists — just a flowing, gently focused paragraph that highlights what matters today. Address the user by first name if provided.",
      },
      { role: "user", content: userContent },
    ]);
    return { brief };
  });

export const suggestTasks = createServerFn({ method: "POST" })
  .inputValidator(z.object({ thoughts: z.array(z.string()).min(1).max(20) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const raw = await callOpenRouter(apiKey, [
      {
        role: "system",
        content:
          'Extract 3-7 concrete actionable tasks from the user\'s recent thoughts. Respond ONLY with a JSON array: [{"title":"...","priority":"urgent"|"later"|"someday"}]. No prose, no code fences.',
      },
      { role: "user", content: data.thoughts.join("\n---\n") },
    ]);
    const cleaned = raw
      .replace(/^```json?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      return {
        tasks: JSON.parse(cleaned) as { title: string; priority: "urgent" | "later" | "someday" }[],
      };
    } catch {
      return { tasks: [] as { title: string; priority: "urgent" | "later" | "someday" }[] };
    }
  });

// ── Chat agent ─────────────────────────────────────────────────────────────
export const chatAgent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1).max(40),
      userName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const system = `You are the Quietly AI assistant — calm, sharp, and genuinely helpful. You help users clarify thoughts, manage tasks, draft emails, plan projects, and understand their work.

You can perform the following actions when asked — respond with a JSON block inside triple backticks tagged 'action' to trigger them:
- create_task: { title, priority: "urgent"|"later"|"someday" }
- create_event: { title, date, time }
- send_team_message: { message }

If asked to do one of these, first respond naturally, then append the action JSON. Otherwise just respond in markdown.

${data.userName ? `User's name: ${data.userName}` : ""}`;

    const output = await callOpenRouter(
      apiKey,
      [{ role: "system", content: system }, ...data.messages],
    );
    return { output };
  });

// ── Help AI ────────────────────────────────────────────────────────────────
const QUIETLY_KNOWLEDGE = `You are the Quietly Help Assistant. You know every feature of the Quietly app:

NAVIGATION: Sidebar (desktop) or bottom nav (mobile) with: Dashboard, Workspace, Thoughts archive, Planner, Calendar, Team chat, Shared Spaces, Settings.

DASHBOARD (/app): AI daily brief card, recent thoughts, quick-action buttons. Brief auto-generates on load.

WORKSPACE (/app/workspace): AI chat interface. Type messages, pick format (notes/summary/todo/message/email/report/action plan) and tone. Voice input available. History panel on right.

THOUGHTS (/app/thoughts): Archive of all saved AI outputs. Searchable and filterable by type.

PLANNER (/app/planner): Kanban board with Urgent/Later/Someday columns. AI can suggest tasks from thoughts. Toggle list/kanban view.

CALENDAR (/app/calendar): Monthly calendar. Click a day to add events. Events stored per user.

TEAM (/app/team): Real-time team chat. All members see messages live.

SPACES (/app/spaces): Shared collaborative spaces with presence indicators. Create rooms, invite members.

SETTINGS (/app/settings): Account info, theme toggle (light/dark), invite teammates, Secrets Vault, notification preferences, change password, delete account.

SECRETS VAULT: In Settings. Store passwords, API keys, sensitive info. Control who on your team can see each secret.

HELP (/app/help): This assistant. Ask anything about the app.

AUTH: Email signup with OTP verification, Google sign-in. Forgot password sends OTP to email.`;

export const helpChat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const output = await callOpenRouter(apiKey, [
      { role: "system", content: QUIETLY_KNOWLEDGE },
      ...data.messages,
    ]);
    return { output };
  });
