import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FROM = "Quietly <onboarding@resend.dev>";

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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Email send failed: ${res.status} — ${txt.slice(0, 160)}`);
  }
  return res.json();
}

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F9F7F4;font-family:Inter,Arial,sans-serif;color:#0E0E0E;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F7F4;padding:48px 16px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E5E1DA;border-radius:4px;padding:40px;">
          <tr><td>
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:600;letter-spacing:-0.5px;margin-bottom:8px;">Quietly</div>
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:500;margin:24px 0 16px;">${title}</h1>
            <div style="font-size:15px;line-height:1.7;color:#3a3a3a;">${body}</div>
            <p style="font-size:12px;color:#9a9a9a;margin-top:40px;border-top:1px solid #E5E1DA;padding-top:20px;">A Kryonara product. You're receiving this because you signed up for Quietly.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), name: z.string().optional() }))
  .handler(async ({ data }) => {
    const name = data.name || "there";
    const body = `
      <p>Welcome, ${name}.</p>
      <p>Your quiet space is ready. Quietly is a calm place to drop messy thoughts and watch them become clean notes, summaries, to-dos, polished messages, emails, reports, and action plans.</p>
      <p>Three things to try first:</p>
      <ul style="padding-left:18px;line-height:1.9;">
        <li>Paste a brain dump into the Workspace and pick a format.</li>
        <li>Use Quick Capture from anywhere to save a fleeting thought.</li>
        <li>Open your Dashboard for a calm daily brief.</li>
      </ul>
      <p style="margin-top:32px;">
        <a href="https://quietly.app/app" style="background:#0E0E0E;color:#F9F7F4;padding:12px 22px;text-decoration:none;border-radius:6px;font-size:14px;">Open Quietly</a>
      </p>
    `;
    await sendEmail(
      data.email,
      "Welcome to Quietly — your quiet space is ready",
      shell("Your thoughts deserve clarity.", body),
    );
    return { ok: true };
  });

export const sendInviteEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      inviterName: z.string().optional(),
      workspaceName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const who = data.inviterName || "Someone";
    const ws = data.workspaceName || "their team";
    const body = `
      <p>${who} invited you to join ${ws} on Quietly.</p>
      <p>Quietly is a calm AI workspace for turning messy thoughts into clarity — together.</p>
      <p style="margin-top:32px;">
        <a href="https://quietly.app/auth/signup?invite=${encodeURIComponent(data.email)}" style="background:#0E0E0E;color:#F9F7F4;padding:12px 22px;text-decoration:none;border-radius:6px;font-size:14px;">Accept invite</a>
      </p>
    `;
    await sendEmail(
      data.email,
      `${who} invited you to Quietly`,
      shell("You've been invited.", body),
    );
    return { ok: true };
  });
