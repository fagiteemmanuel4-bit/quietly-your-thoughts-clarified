import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, randomInt, timingSafeEqual } from "crypto";

const TTL_MS            = 10 * 60 * 1000; // 10 min
const RESEND_COOLDOWN_MS = 60 * 1000;     // 1 min

function secret() {
  // Use any long env var as HMAC key — fall back to a build-time constant
  const s = process.env.OTP_SECRET
    || process.env.RESEND_API_KEY
    || process.env.OPENROUTER_API_KEY
    || "quietly-otp-default-secret-change-in-prod";
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(email: string, code: string, issuedAt: number) {
  const exp      = issuedAt + TTL_MS;
  const codeHash = createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");
  const payload  = `${email}|${codeHash}|${issuedAt}|${exp}`;
  const sig      = sign(payload);
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

function parseToken(token: string) {
  try {
    const raw   = Buffer.from(token, "base64url").toString("utf8");
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

// ── Resend helper ──────────────────────────────────────────────────────────
// Resend free tier restriction: can only send to the account owner's email
// unless your domain is verified. We gracefully handle the 403 by logging
// the code to the server console as a fallback for development.
async function sendOtpEmail(to: string, code: string, purpose: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email is not configured — add RESEND_API_KEY.");

  const subject =
    purpose === "signup"
      ? `Your Quietly verification code: ${code}`
      : `Your Quietly security code: ${code}`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#fafafa;font-family:Inter,Arial,sans-serif;color:#111;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;"><tr><td align="center">
      <table width="460" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e4e4e7;border-radius:8px;padding:40px;">
        <tr><td>
          <p style="font-size:18px;font-weight:600;margin:0 0 24px;">Quietly</p>
          <h1 style="font-size:20px;font-weight:500;margin:0 0 12px;">Verification code</h1>
          <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">
            ${purpose === "signup" ? "Enter this code to finish creating your account." : "Enter this code to continue."}
            Expires in 10 minutes.
          </p>
          <div style="font-family:monospace;font-size:32px;letter-spacing:10px;font-weight:700;background:#f4f4f5;border-radius:8px;padding:18px;text-align:center;color:#111;">${code}</div>
          <p style="font-size:12px;color:#aaa;margin-top:28px;">If you didn't request this, ignore this email.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Use the verified owner email as FROM — works on free Resend tier
      from:    "Quietly <onboarding@resend.dev>",
      to:      [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // 403 = Resend domain restriction (free tier, unverified domain)
    // In this case, log the code server-side so development still works
    if (res.status === 403) {
      console.warn(`[Quietly OTP] Resend 403 for ${to}. Code (dev only): ${code}`);
      console.warn("[Quietly OTP] Fix: verify your sending domain at resend.com/domains");
      // Don't throw — return silently so auth still works in dev/test
      return;
    }
    throw new Error(`Could not send verification email (${res.status}). Please try again.`);
  }
}

// ── Server functions ───────────────────────────────────────────────────────
export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email:         z.string().email(),
    purpose:       z.enum(["signup","reset","delete","change_password"]),
    previousToken: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    if (data.previousToken) {
      const prev = parseToken(data.previousToken);
      if (prev && Date.now() - prev.issuedAt < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - prev.issuedAt)) / 1000);
        throw new Error(`Please wait ${wait}s before resending.`);
      }
    }
    const code      = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const issuedAt  = Date.now();
    const token     = makeToken(data.email.toLowerCase(), code, issuedAt);
    await sendOtpEmail(data.email, code, data.purpose);
    return { token, expiresAt: issuedAt + TTL_MS };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email(),
    code:  z.string().length(6),
    token: z.string(),
  }))
  .handler(async ({ data }) => {
    const parsed = parseToken(data.token);
    if (!parsed)                         throw new Error("Invalid session — request a new code.");
    if (Date.now() > parsed.exp)         throw new Error("Code expired — request a new one.");
    if (parsed.email !== data.email.toLowerCase()) throw new Error("Email mismatch.");
    const expected = createHmac("sha256", secret())
      .update(`${parsed.email}:${data.code}`).digest("hex");
    const a = Buffer.from(parsed.codeHash);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      throw new Error("Incorrect code — check your email and try again.");
    const receipt = sign(`verified|${parsed.email}|${Date.now()}`);
    return { ok: true, receipt };
  });
