import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}` },
});

const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

export const helpAssistant = createServerFn({ method: "POST" })
  .inputValidator(z.object({ question: z.string() }))
  .handler(async ({ data }) => {
    const { question } = data;

    const knowledgeBase = `
    Quietly Product Guide:
    - Workspace: Advanced chat interface with Neural Intelligence. Supports Markdown, Voice input, and Chain-of-Thought.
    - Spaces: Collaborative areas for teams. Features: Kanban, Discussions, Member Status, Pinned Items.
    - Settings: Configure Theme, AI Model, Notifications. Includes a client-side encrypted Secrets Vault.
    - Dashboard: Synthesis of recent workspace activity.
    - Notifications: Real-time alerts in-app and via Resend email.

    Navigation Paths:
    - Change Theme: Settings -> Ecosystem Sync -> Global Theme.
    - Manage Secrets: Settings -> Secrets Vault.
    - Create Task: Spaces -> Kanban -> Plus icon OR ask AI in Workspace.
    - Invite Team: Spaces -> Header -> Invite Team button.
    `;

    const runAssistant = async (modelIdx = 0) => {
      if (modelIdx >= MODELS.length) throw new Error("Help Assistant is currently sleeping.");
      try {
        const result = await generateText({
          model: openrouter(MODELS[modelIdx]),
          system: `You are the Quietly Help Assistant. You know everything about the Quietly SaaS platform.
          Answer questions based on the provided knowledge base. Be precise and provide exact navigation paths.
          Knowledge Base: ${knowledgeBase}`,
          prompt: question,
        });
        return { text: result.text };
      } catch {
        return runAssistant(modelIdx + 1);
      }
    };

    return await runAssistant();
  });
