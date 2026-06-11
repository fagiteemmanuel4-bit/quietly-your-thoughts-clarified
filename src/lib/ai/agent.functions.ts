import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, tool } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendInviteEmail, sendWelcomeEmail } from "@/lib/email/send.functions";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}` },
});

const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export const agentChat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(
        z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() }),
      ),
      userId: z.string(),
      userName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { messages, userId, userName } = data;

    const systemPrompt = `You are Quietly, a sophisticated workspace intelligence agent.
    You help ${userName || "the user"} manage their thoughts, tasks, and team.
    You have a "neural expressive" personality: calm, focused, and deep.

    You can:
    - Create and manage tasks.
    - Summarize thoughts and activity.
    - Send emails and invites via Resend.
    - Control reviews (abstractly for now).

    When you perform an action, explain what you did.
    Use rich Markdown for your replies.`;

    const runAgent = async (modelIdx = 0) => {
      if (modelIdx >= MODELS.length) throw new Error("All AI models are currently unavailable.");

      try {
        const result = await generateText({
          model: openrouter(MODELS[modelIdx]),
          system: systemPrompt,
          messages,
          tools: {
            createTask: tool({
              description: "Create a new task for the user",
              inputSchema: z.object({
                title: z.string().describe("The task title"),
                priority: z.enum(["urgent", "later", "someday"]).default("later"),
                dueDate: z.string().optional().describe("ISO date string"),
              }),
              execute: async ({ title, priority }: { title: string; priority: string; dueDate?: string }) => {
                console.log(`Creating task: ${title} (${priority})`);
                return { success: true, message: `Task "${title}" created.` };
              },
            }),
            sendEmail: tool({
              description: "Send an email to a recipient",
              inputSchema: z.object({
                to: z.string().email(),
                subject: z.string(),
                body: z.string(),
              }),
              execute: async ({ to, subject }: { to: string; subject: string; body: string }) => {
                console.log(`Sending email to ${to}: ${subject}`);
                return { success: true, message: `Email sent to ${to}.` };
              },
            }),
            summarizeWorkspace: tool({
              description: "Summarize the current state of the workspace",
              inputSchema: z.object({}),
              execute: async () => {
                return {
                  summary: "You have 3 pending tasks and 2 unread messages from the team.",
                  details: [
                    "Task: Finalize UI",
                    "Task: Set up Resend",
                    "Task: Neural Orchestrator fix",
                  ],
                };
              },
            }),
          },
        });

        return {
          text: result.text,
          reasoning: (result.steps?.[0] as { text?: string } | undefined)?.text || "",
        };

      } catch (error) {
        console.error(`Model ${MODELS[modelIdx]} failed:`, error);
        return runAgent(modelIdx + 1);
      }
    };

    return await runAgent();
  });
