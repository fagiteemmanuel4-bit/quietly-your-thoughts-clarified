# Quietly Deployment Guide (Vercel)

Follow these steps to deploy Quietly as a production-ready SaaS on Vercel.

## 1. Environment Variables
Configure the following keys in your Vercel Project Settings:

| Key | Value / Source |
|-----|----------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API Key (sk-or-v1-...) |
| `RESEND_API_KEY` | Your Resend API Key (re_...) |
| `VITE_FIREBASE_API_KEY` | Firebase Web Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Web Config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Web Config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Web Config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Web Config |
| `VITE_FIREBASE_APP_ID` | Firebase Web Config |

## 2. Build Configuration
- **Framework Preset:** Vite
- **Build Command:** `bun run build`
- **Output Directory:** `dist/client`
- **Install Command:** `bun install`

## 3. Vercel Configuration (`vercel.json`)
The project includes a `vercel.json` optimized for TanStack Start. It routes all `/api/server` requests to the Nitro server entry point.

## 4. Domain Agnostic Invites
Invite links use UUID tokens (e.g., `/auth/signup?invite=TOKEN`). To ensure they work across domain changes:
1. Vercel will automatically handle the `https` and domain mapping.
2. The `validateInvite` server function looks up the token in Firestore, independent of the current domain.

## 5. Firebase Rules
Ensure your Firestore rules allow:
- `users/{uid}/config/settings`: Read/Write for `{uid}`
- `users/{uid}/notifications`: Read/Write for `{uid}` (or server-only)
- `invites/{token}`: Read for anyone, Write for authenticated users
- `spaces/{id}/messages`: Read/Write for space members

## 6. Pro-Tips
- **Fallbacks:** The AI core automatically falls back from Gemini to Llama if models go offline.
- **Edge:** Nitro/TanStack Start runs on Vercel Functions (Node.js/Edge). No extra config needed.
- **Haptics:** The mobile UI uses `active:scale-95` and spring animations for a premium feel.
