import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const FROM = "Quietly Auth <auth@resend.dev>";

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

export const sendOTP = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { email } = data;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with expiration (10 mins)
    // Note: In real app, use a dedicated auth-codes collection with TTL
    await setDoc(doc(db, "temp_auth", email), {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        createdAt: serverTimestamp(),
    });

    await sendEmail(
      email,
      `${otp} is your Quietly verification code`,
      `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px; text-align: center; border: 1px solid #eee; border-radius: 20px;">
        <h2 style="color: #7B5EA7; font-size: 24px; margin-bottom: 20px;">Verify your identity</h2>
        <p style="color: #666; margin-bottom: 30px;">Enter this code to complete your signup or secure action.</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #0D0D12; background: #f9f9f9; padding: 20px; border-radius: 10px;">${otp}</div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore it.</p>
      </div>
      `
    );

    return { success: true };
  });

export const verifyOTP = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), otp: z.string().length(6) }))
  .handler(async ({ data }) => {
    const { email, otp } = data;
    const snap = await getDoc(doc(db, "temp_auth", email));

    if (!snap.exists()) return { success: false, message: "Code not found." };
    const stored = snap.data();

    if (Date.now() > stored.expiresAt) return { success: false, message: "Code expired." };
    if (stored.otp !== otp) return { success: false, message: "Invalid code." };

    return { success: true };
  });
