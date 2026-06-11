import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const FormatEnum = z.enum([
  "notes", "summary", "todo", "message", "email", "report", "action_plan",
]);
export type Format = z.infer<typeof FormatEnum>;

const PROMPTS: Record<Format, string> = {
  notes:       "Rewrite the user's raw thoughts as clean, organized notes. Use ## headings and concise sentences. Preserve meaning. Markdown.",
  summary:     "Distill the input into a tight bullet-point summary. Each bullet is one short line. Use markdown bullets (-).",
  todo:        "Extract every actionable item as a to-do list using markdown checkboxes (- [ ] task). Start each with a verb. Be specific.",
  message:     "Rewrite as a single polished message ready to send. Keep their voice, make it clear and warm. Plain text.",
  email:       "Rewrite as a professional email.\nFormat:\nSubject: ...\n\nHi [name],\n\n[body]\n\nBest,",
  report:      "Structure as a brief professional report: ## Overview, ## Key Points, ## Findings, ## Recommendations, ## Next Steps. Markdown.",
  action_plan: "Create an action plan: ## Objective, ## Milestones (numbered), ## Tasks (- [ ] each), ## Risks, ## Success Criteria. Markdown.",
};

const ToneEnum = z.enum(["neutral","warm","concise","formal","casual"]).optional();

// ── Free model router — uses openrouter/auto which picks best available free model
// Fallback list if auto fails
const FREE_MODELS = [
  "openrouter/auto",                         // primary: auto-router picks best free model
  "meta-llama/llama-3.1-8b-instruct:free",   // fallback 1
  "mistralai/mistral-7b-instruct:free",      // fallback 2
  "qwen/qwen-2-7b-instruct:free",            // fallback 3
];

async function callOpenRouter(
  apiKey: string,
  messages: { role: string; content: string }[],
  attempt = 0,
): Promise<string> {
  const model = FREE_MODELS[Math.min(attempt, FREE_MODELS.length - 1)];
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VITE_APP_URL ?? "https://quietly.app",
      "X-Title": "Quietly",
    },
    body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 2000 }),
  });

  // Retry on rate-limit or server error with next fallback model
  if ((res.status === 429 || res.status === 503 || res.status === 502 || res.status === 404)
    && attempt < FREE_MODELS.length - 1) {
    return callOpenRouter(apiKey, messages, attempt + 1);
  }

  if (res.status === 401 || res.status === 402)
    throw new Error("AI credits exhausted — check your OpenRouter key.");
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`AI error (${res.status}): ${txt.slice(0, 120)}`);
  }

  const json = await res.json() as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("AI returned an empty response — please try again.");
  return text;
}

// ── Transform ──────────────────────────────────────────────────────────────
export const transformText = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    input:   z.string().min(1).max(12000),
    format:  FormatEnum,
    tone:    ToneEnum,
    context: z.string().max(500).optional(),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured — add OPENROUTER_API_KEY.");
    const toneHint = data.tone && data.tone !== "neutral" ? `\nTone: ${data.tone}.` : "";
    const ctxHint  = data.context ? `\nContext: ${data.context}` : "";
    const system   = PROMPTS[data.format] + toneHint + ctxHint
      + "\n\nNever include preamble like 'Here is…'. Output only the transformed content.";
    const output = await callOpenRouter(apiKey, [
      { role: "system", content: system },
      { role: "user",   content: data.input },
    ]);
    return { output };
  });

// ── Daily brief ────────────────────────────────────────────────────────────
export const dailyBrief = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name:     z.string().optional(),
    thoughts: z.array(z.string()).max(20).optional(),
    tasks:    z.array(z.string()).max(20).optional(),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const body = [
      data.name     ? `User: ${data.name}` : "",
      data.thoughts?.length ? `Recent thoughts:\n${data.thoughts.join("\n---\n")}` : "",
      data.tasks?.length    ? `Open tasks:\n${data.tasks.join("\n")}` : "",
    ].filter(Boolean).join("\n\n") || "No data yet.";

    const brief = await callOpenRouter(apiKey, [
      { role: "system", content: "Write a 3-4 sentence calm daily brief for a productivity workspace. No headings, no lists — flowing prose. Address the user by first name if provided. Be gently motivating." },
      { role: "user",   content: body },
    ]);
    return { brief };
  });

// ── Task suggester ─────────────────────────────────────────────────────────
export const suggestTasks = createServerFn({ method: "POST" })
  .inputValidator(z.object({ thoughts: z.array(z.string()).min(1).max(20) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const raw = await callOpenRouter(apiKey, [
      { role: "system", content: 'Extract 3-7 concrete actionable tasks from the thoughts. Respond ONLY with a JSON array: [{"title":"...","priority":"urgent"|"later"|"someday"}]. No prose, no code fences.' },
      { role: "user",   content: data.thoughts.join("\n---\n") },
    ]);
    const clean = raw.replace(/^```json?\s*/i,"").replace(/```$/i,"").trim();
    try {
      return { tasks: JSON.parse(clean) as { title: string; priority: string }[] };
    } catch {
      return { tasks: [] as { title: string; priority: string }[] };
    }
  });

// ── Chat agent ─────────────────────────────────────────────────────────────
export const chatAgent = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1).max(40),
    userName: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const system = `You are the Quietly AI — calm, sharp, genuinely helpful. Help users clarify thoughts, manage tasks, draft emails, plan projects.

If asked to create a task or event, respond naturally then append a code block tagged 'action':
\`\`\`action
{"create_task":{"title":"...","priority":"urgent"|"later"|"someday"}}
\`\`\`
or
\`\`\`action
{"create_event":{"title":"...","date":"YYYY-MM-DD","time":"HH:MM"}}
\`\`\`

Otherwise respond in clear markdown.${data.userName ? `\nUser's name: ${data.userName}` : ""}`;

    const output = await callOpenRouter(apiKey, [
      { role: "system", content: system },
      ...data.messages,
    ]);
    return { output };
  });

// ── Help AI ────────────────────────────────────────────────────────────────
const QUIETLY_KNOWLEDGE = `You are the Quietly Help Assistant. You know everything about the Quietly app.

NAVIGATION: Sidebar (desktop) / bottom nav (mobile): Dashboard, Workspace, Thoughts, Planner, Calendar, Team, Spaces, Settings, Help.

DASHBOARD: AI daily brief card, recent thoughts, urgent task alerts, quick-action shortcuts.
WORKSPACE: AI chatbot interface. Type, pick format + tone, get structured output. Voice input available. Creates tasks/events from chat.
THOUGHTS: Searchable archive of all AI outputs.
PLANNER: Kanban board — Urgent/Later/Someday columns. AI suggests tasks from thoughts.
CALENDAR: Monthly calendar, click day to add events.
TEAM: Real-time team chat. Messages trigger email notifications.
SPACES: Collaborative spaces with member presence, channels, shared tasks.
SETTINGS → Account: name, email, theme toggle.
SETTINGS → Notifications: toggle email alerts per event type.
SETTINGS → Security: change password (OTP-gated), delete account (OTP-gated).
SETTINGS → Secrets Vault: store passwords/API keys with private or team scope.
SETTINGS → Invite: send token-based invite email that survives domain changes.
HELP: This assistant. Ask anything about the app.

AUTH: Email signup with 6-digit OTP, Google sign-in, forgot password via OTP.`;

export const helpChat = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1).max(20),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");
    const output = await callOpenRouter(apiKey, [
      { role: "system", content: QUIETLY_KNOWLEDGE },
      ...data.messages,
    ]);
    return { output };
  });
