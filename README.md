<div align="center">
  <h1>Quietly</h1>
  <p><strong>Your thoughts, clarified.</strong></p>
  <p>An AI-powered workspace for turning messy thoughts into structured action — notes, summaries, tasks, emails, reports, and more. Built for thinkers, teams, and anyone who wants their brain to work better.</p>

  <p>
    <a href="https://quietly.app">Live app</a> ·
    <a href="#quick-start">Quick start</a> ·
    <a href="#features">Features</a> ·
    <a href="#tech-stack">Stack</a> ·
    <a href="#deploy">Deploy</a>
  </p>

  <img src="https://img.shields.io/badge/status-beta-orange?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/built%20with-TanStack%20Start-violet?style=flat-square" alt="TanStack" />
</div>

---

## What is Quietly?

Quietly is a calm, intentional AI workspace. Paste any raw thought — a voice memo transcript, a brain dump, meeting notes — and the AI instantly structures it into whatever format you need. It also works as a full team collaboration platform with chat, shared spaces, task management, and a secure secrets vault.

No bloat. No noise. Just clarity.

---

## Features

### ✦ AI Workspace (Chat Interface)
- Full chatbot interface with conversation history
- Supports 7 output formats: Notes, Summary, To-do, Message, Email, Report, Action Plan
- 5 tone options: Neutral, Warm, Concise, Formal, Casual
- Voice input via Web Speech API
- Agentic actions: create tasks and calendar events directly from chat
- Chain-of-thought display, rate/regenerate/copy on every response
- Auto-saves outputs to Thoughts archive

### ✦ Dashboard
- AI-generated daily brief on login (cached per day)
- Urgent task alerts
- Recent thoughts feed
- Quick-action shortcuts

### ✦ Thoughts Archive
- Searchable and filterable history of all AI outputs
- Per-user, stored in Firestore

### ✦ Planner
- Kanban board: Urgent / Later / Someday
- AI task suggestions from your thoughts
- List and board view toggle

### ✦ Calendar
- Monthly calendar with per-day event creation
- Events synced from AI chat actions

### ✦ Team Chat
- Real-time messaging via Firestore
- Email notification on new message (Resend)
- Reply-to link routes back to the thread

### ✦ Shared Spaces
- Collaborative workspaces with member presence
- Invite by email or shareable link

### ✦ Settings
- **Secrets Vault** — store passwords, API keys, sensitive info with scope control (private / team)
- **Change password** — OTP-verified via email
- **Delete account** — OTP-verified, permanent
- **Notification preferences** — toggle per-event email notifications
- **Invite teammates** — token-based invite links that survive domain changes

### ✦ Help Centre
- AI assistant that knows every feature of the app
- Free OpenRouter models with automatic fallback
- FAQ quick-links

### ✦ Landing Page
- Hero, social proof, features grid, how-it-works, live demo, testimonials, pricing, FAQ, contact form
- Floating AI chat bubble for visitor questions
- Full SEO (title, description, OG, Twitter Card, sitemap.xml, robots.txt)

### ✦ Auth
- Email signup with 6-digit OTP email verification
- Google sign-in
- Success animation overlay on signup
- Forgot password / change password via OTP
- Invite accept page (token-based, domain-agnostic)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite) |
| Styling | TailwindCSS v4 + tw-animate-css |
| UI components | shadcn/ui |
| Auth + DB | Firebase (Auth + Firestore) |
| AI | [OpenRouter](https://openrouter.ai) — free models (Llama 3.1, Mistral 7B, Gemma 2) with auto-fallback |
| Email | [Resend](https://resend.com) |
| Routing | TanStack Router (file-based) |
| Deployment | Vercel (recommended) |
| Package manager | Bun |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/fagiteemmanuel4-bit/quietly-your-thoughts-clarified.git
cd quietly-your-thoughts-clarified
bun install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
# App URL (used in email links and invite tokens — change this when you change domain)
VITE_APP_URL=http://localhost:3000

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenRouter (get a free key at openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-...

# Resend (get a free key at resend.com)
RESEND_API_KEY=re_...
```

### 3. Run locally

```bash
bun run dev
```

App runs at `http://localhost:3000`.

---

## Project Structure

```
src/
├── routes/
│   ├── index.tsx              # Landing page
│   ├── app.tsx                # App shell (sidebar + mobile nav)
│   ├── app.index.tsx          # Dashboard
│   ├── app.workspace.tsx      # AI chat workspace
│   ├── app.thoughts.tsx       # Thoughts archive
│   ├── app.planner.tsx        # Kanban planner
│   ├── app.calendar.tsx       # Calendar
│   ├── app.team.tsx           # Team chat
│   ├── app.spaces.tsx         # Shared spaces
│   ├── app.settings.tsx       # Settings + Vault
│   ├── app.help.tsx           # Help centre
│   ├── auth.signup.tsx        # Signup + OTP verify
│   ├── auth.login.tsx         # Login
│   ├── invite.accept.tsx      # Invite acceptance
│   ├── onboarding.tsx         # Onboarding flow
│   ├── $.tsx                  # 404
│   └── ...legal pages
├── components/
│   ├── ConfirmDialog.tsx      # Reusable confirm modal
│   ├── OtpInput.tsx           # 6-digit OTP input
│   ├── Brand.tsx              # Logo
│   ├── ThemeToggle.tsx        # Light/dark toggle
│   ├── QuickCapture.tsx       # Floating thought capture
│   ├── FocusTimer.tsx         # Pomodoro timer
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── ai/
│   │   └── transform.functions.ts  # All AI server functions
│   ├── auth/
│   │   └── otp.functions.ts        # OTP generation and verify
│   ├── email/
│   │   └── send.functions.ts       # All Resend email functions
│   ├── auth-context.tsx            # Firebase auth context
│   └── firebase.ts                 # Firebase init
└── styles.css                      # Global styles + animations
```

---

## AI Models

Quietly uses free-tier models from OpenRouter in a waterfall:

1. `meta-llama/llama-3.1-8b-instruct:free`
2. `mistralai/mistral-7b-instruct:free`
3. `google/gemma-2-9b-it:free`

If one returns a rate-limit (429) or server error (502/503), the next model is tried automatically with no visible failure to the user.

---

## Email System

All emails go through Resend. Templates include:
- **Welcome** — sent on signup
- **OTP verification** — sent on signup, password change, and account deletion
- **Team message notification** — sent when a teammate sends a message
- **Invite** — token-based, domain-agnostic invite link

To use a custom `FROM` address (instead of `onboarding@resend.dev`), [verify your domain on Resend](https://resend.com/domains) and update `FROM` in `src/lib/email/send.functions.ts`.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "ready to deploy"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects the Vite framework

### 3. Set environment variables

In your Vercel project → **Settings → Environment Variables**, add every key from the `.env` section above.

> **Important:** Set `VITE_APP_URL` to your production URL (e.g. `https://quietly.app`). This is used in all email links and invite tokens — changing it later will not break existing invite links because they use tokens, not hardcoded paths.

### 4. Build settings (Vercel "Other" preset)

| Setting | Value |
|---|---|
| **Framework Preset** | **Other** |
| **Build command** | `bun run build` |
| **Output directory** | *(leave blank — Nitro writes to `.vercel/output` automatically)* |
| **Install command** | `bun install --frozen-lockfile` |
| **Node.js version** | 20.x |

> **Why "Other"?** This app uses TanStack Start with Nitro SSR. The Nitro vercel preset writes directly to `.vercel/output/` which Vercel reads automatically — no output directory override needed.

### 5. Environment variables

Go to your Vercel project → **Settings → Environment Variables** and add every key from the `.env` section above. The minimum required for the app to boot:

```
VITE_APP_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
OPENROUTER_API_KEY
RESEND_API_KEY
```

### 6. Deploy

Click **Deploy**. Vercel builds and deploys in ~60 seconds.

### 6. Custom domain

In Vercel → **Settings → Domains**, add your domain and follow the DNS instructions. Update `VITE_APP_URL` to match.

**Domain changes:** Because invite links use tokens (not hardcoded domains), existing invite emails still work after a domain change — as long as you update `VITE_APP_URL` in Vercel environment variables and redeploy.

---

## Changing Domain (Zero Downtime)

1. Add new domain in Vercel
2. Update `VITE_APP_URL` in Vercel env vars to new domain
3. Trigger a redeploy (or push a commit)
4. Point DNS to Vercel
5. Done — all invite links, email links, and auth flows use the new domain automatically

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database** → Start in production mode
4. Add these Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /team/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Copy your config values into `.env`

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a PR

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with care by <strong>Mercury | Web & AI Solutions</strong></p>
  <p>A <a href="#">Kryonara</a> product</p>
</div>
