import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, randomInt, timingSafeEqual } from "crypto";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;

function secret() {
  const s = process.env.OPENROUTER_API_KEY || process.env.RESEND_API_KEY;
  if (!s) throw new Error("Server secret not configured");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(email: string, code: string, issuedAt: number) {
  const exp = issuedAt + TTL_MS;
  const codeHash = createHmac("sha256", secret())
    .update(`${email}:${code}`)
    .digest("hex");
  const payload = `${email}|${codeHash}|${issuedAt}|${exp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

function parseToken(token: string) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split("|");
    if (parts.length !== 5) return null;
    const [email, codeHash, issuedAt, exp, sig] = parts;
    const expected = sign(`${email}|${codeHash}|${issuedAt}|${exp}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { email, codeHash, issuedAt: Number(issuedAt), exp: Number(exp) };
  } catch {
    return null;
  }
}

async function sendOtpEmail(to: string, code: string, purpose: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email is not configured.");
  const subject =
    purpose === "signup"
      ? `Your Quietly verification code: ${code}`
      : `Your Quietly security code: ${code}`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F9F7F4;font-family:Inter,Arial,sans-serif;color:#0E0E0E;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;"><tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E5E1DA;border-radius:6px;padding:40px;">
        <tr><td>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;margin-bottom:8px;">Quietly</div>
          <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:500;margin:24px 0 12px;">Your verification code</h1>
          <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">Enter this code to ${purpose === "signup" ? "verify your email and finish signing up" : "continue"}. It expires in 10 minutes.</p>
          <div style="font-family:'JetBrains Mono',monospace;font-size:36px;letter-spacing:12px;font-weight:600;background:#F9F7F4;border:1px solid #E5E1DA;border-radius:6px;padding:20px;text-align:center;">${code}</div>
          <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.6;">If you didn't request this, you can safely ignore the email.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Quietly <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Could not send code: ${res.status} — ${txt.slice(0, 140)}`);
  }
}

export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      purpose: z.enum(["signup", "reset", "delete", "change_password"]),
      previousToken: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    // Resend cooldown
    if (data.previousToken) {
      const prev = parseToken(data.previousToken);
      if (prev && Date.now() - prev.issuedAt < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil(
          (RESEND_COOLDOWN_MS - (Date.now() - prev.issuedAt)) / 1000,
        );
        throw new Error(`Please wait ${wait}s before resending.`);
      }
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const issuedAt = Date.now();
    const token = makeToken(data.email.toLowerCase(), code, issuedAt);
    await sendOtpEmail(data.email, code, data.purpose);
    return { token, expiresAt: issuedAt + TTL_MS };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
      token: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const parsed = parseToken(data.token);
    if (!parsed) throw new Error("Invalid verification session. Request a new code.");
    if (Date.now() > parsed.exp) throw new Error("Code expired. Request a new one.");
    if (parsed.email !== data.email.toLowerCase())
      throw new Error("Email mismatch. Request a new code.");
    const expected = createHmac("sha256", secret())
      .update(`${parsed.email}:${data.code}`)
      .digest("hex");
    const a = Buffer.from(parsed.codeHash);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      throw new Error("Incorrect code. Try again.");
    // Issue a short-lived "verified" receipt the client can pass to gated actions
    const receipt = sign(`verified|${parsed.email}|${Date.now()}`);
    return { ok: true, receipt };
  });
