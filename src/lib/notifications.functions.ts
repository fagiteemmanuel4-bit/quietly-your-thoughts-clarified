import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const FROM = "Quietly Alerts <alerts@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email is not configured.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  return res.ok;
}

export const triggerNotification = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipientId: z.string(),
      recipientEmail: z.string().email().optional(),
      title: z.string(),
      message: z.string(),
      link: z.string().optional(),
      type: z.enum(["message", "task", "review", "system"]).default("system"),
    }),
  )
  .handler(async ({ data }) => {
    const { recipientId, recipientEmail, title, message, link, type } = data;

    // 1. In-app notification (Firestore)
    // Note: In real app, we use Admin SDK here. Simulation using direct write if rules allow.
    try {
        await addDoc(collection(db, "users", recipientId, "notifications"), {
            title,
            message,
            link,
            type,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Firestore notification failed:", e);
    }

    // 2. Email notification (Resend)
    if (recipientEmail) {
      await sendEmail(
        recipientEmail,
        `Quietly: ${title}`,
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7B5EA7;">${title}</h2>
          <p style="color: #333; line-height: 1.6;">${message}</p>
          ${link ? `<a href="https://quietly.app${link}" style="display: inline-block; padding: 10px 20px; background: #7B5EA7; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">View in Workspace</a>` : ""}
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">You can reply directly to this thread or manage notification settings in your profile.</p>
        </div>
        `
      );
    }

    return { success: true };
  });
