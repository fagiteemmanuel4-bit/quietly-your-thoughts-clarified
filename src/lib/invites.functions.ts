import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const FROM = "Quietly Teams <teams@resend.dev>";

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

export const createInvite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), inviterName: z.string(), spaceId: z.string().optional() }))
  .handler(async ({ data }) => {
    const { email, inviterName, spaceId } = data;
    const token = uuidv4();

    // Store invite token with metadata
    await setDoc(doc(db, "invites", token), {
        email,
        inviterName,
        spaceId,
        createdAt: serverTimestamp(),
        used: false,
    });

    const inviteLink = `https://quietly.app/auth/signup?invite=${token}`;

    await sendEmail(
      email,
      `${inviterName} invited you to join Quietly`,
      `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 24px; text-align: center;">
        <h2 style="color: #7B5EA7; font-size: 24px; margin-bottom: 16px;">Join the Workspace</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 32px;">${inviterName} has invited you to collaborate on Quietly — the calm workspace for messy thoughts.</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background: #7B5EA7; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; box-shadow: 0 10px 20px rgba(123,94,167,0.2);">Accept Invitation</a>
        <p style="color: #999; font-size: 11px; margin-top: 40px;">If the button above doesn't work, copy and paste this link:<br/>${inviteLink}</p>
      </div>
      `
    );

    return { success: true, token };
  });

export const validateInvite = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const { token } = data;
    const snap = await getDoc(doc(db, "invites", token));

    if (!snap.exists()) return { valid: false };
    const invite = snap.data();
    if (invite.used) return { valid: false, message: "Invite already used." };

    return { valid: true, invite };
  });
