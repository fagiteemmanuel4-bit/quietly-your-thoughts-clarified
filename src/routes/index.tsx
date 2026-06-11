import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { transformText } from "@/lib/ai/transform.functions";
import { helpChat } from "@/lib/ai/transform.functions";
import { toast } from "sonner";
import {
  ArrowRight, Sparkles, ListChecks, FileText, MessageSquare, StickyNote,
  Wand2, CheckCircle2, Bot, Send, X, ChevronDown, ChevronUp,
  Zap, Focus, Moon, Shield, Users, Share2, Loader2, Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quietly — Your thoughts, clarified" },
      { name: "description", content: "Turn messy thoughts into clarity with AI. Quietly is the calm workspace for thinking, planning, and collaborating — free to start." },
      { property: "og:title", content: "Quietly — Your thoughts, clarified" },
      { property: "og:description", content: "Paste anything. Get structure instantly. AI-powered, human-centered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Landing,
});

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 px-6">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000"
          alt="" className="w-full h-full object-cover opacity-15 dark:opacity-8 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
      </div>
      <div className="relative z-10 max-w-5xl w-full text-center fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 backdrop-blur-md px-4 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-8">
          <Sparkles className="h-3 w-3 text-violet" /> Now in beta — free to start
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.93] tracking-tight">
          Your thoughts,<br />
          <span className="italic text-muted-foreground/80">clarified.</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Quietly is the intentional AI workspace where messy ideas become structured action — notes, summaries, tasks, emails, reports, and more. Instantly.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/signup">
            <Button size="lg" className="rounded-full h-13 px-8 text-base shadow-lift group">
              Start free <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#demo">
            <Button size="lg" variant="ghost" className="rounded-full h-13 px-8 text-base">
              See it live <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">No credit card required · Free forever plan · Takes 30 seconds</p>
      </div>

      {/* Floating cards */}
      <div className="absolute bottom-12 left-8 hidden lg:block float-slow">
        <div className="paper p-4 rounded-xl max-w-[200px] rotate-[-2deg] shadow-lift">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">AI transformed ✨</p>
          <p className="text-xs">- [ ] Follow up with James<br />- [ ] Send deck to Lisa<br />- [ ] Book venue</p>
        </div>
      </div>
      <div className="absolute top-40 right-8 hidden lg:block float-slow" style={{ animationDelay: "2s" }}>
        <div className="paper p-4 rounded-xl max-w-[180px] rotate-[2deg] shadow-lift">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-2 w-2 rounded-full bg-sage animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider">3 online</span>
          </div>
          <div className="flex -space-x-2">
            {["#8B7355","#6B9E78","#7B8FA1"].map((bg, i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-background" style={{ background: bg }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social proof ─────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section className="border-y border-border/40 py-10 px-6 bg-subtle/30">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Trusted by thinkers at</p>
        {["Startups", "Agencies", "Freelancers", "Teams", "Students"].map(l => (
          <span key={l} className="text-sm font-medium text-muted-foreground/70">{l}</span>
        ))}
      </div>
    </section>
  );
}

// ─── Features grid ────────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon: Wand2,        title: "AI Transforms",    body: "Turn raw text into notes, summaries, tasks, emails, reports, or action plans in one click." },
    { icon: MessageSquare,title: "AI Chat Workspace", body: "A full chatbot interface that creates tasks, drafts emails, and answers questions directly." },
    { icon: ListChecks,   title: "Smart Planner",     body: "Kanban board with Urgent / Later / Someday columns. AI suggests tasks from your thoughts." },
    { icon: Users,        title: "Team Chat",          body: "Real-time messaging with email notifications. Reply from your inbox, back into the thread." },
    { icon: Share2,       title: "Shared Spaces",      body: "Collaborative workspaces with channels, tasks, wikis, reviews, and member roles." },
    { icon: Shield,       title: "Secrets Vault",      body: "Store API keys, passwords, and sensitive info. Control who on your team can see each secret." },
    { icon: Focus,        title: "Focus Timer",         body: "Built-in Pomodoro timer. Drop into deep work without leaving your workspace." },
    { icon: Moon,         title: "Calm Design",         body: "A paper-like interface built to respect your attention. Light and dark mode included." },
    { icon: Zap,          title: "Instant Results",     body: "No waiting, no setup. Paste your thoughts and see clarity emerge in seconds." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">What you get</p>
        <h2 className="font-display text-4xl md:text-6xl">Everything a clear thinker needs.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(it => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="group p-7 rounded-2xl border border-border/50 bg-card hover:border-foreground/20 hover:shadow-lift transition paper-lift">
              <div className="h-10 w-10 rounded-xl bg-subtle flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Icon className="h-5 w-5 text-foreground/70" />
              </div>
              <h3 className="font-display text-xl mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Drop your thoughts", body: "Type, paste, or speak anything — meeting notes, a brain dump, a rough email, anything unstructured." },
    { n: "02", title: "Pick a format",       body: "Choose from notes, summary, to-do list, email, report, or action plan. Pick a tone too." },
    { n: "03", title: "Get clarity",          body: "Your AI assistant transforms the input instantly. Save it, share it, or act on it right away." },
  ];
  return (
    <section className="py-24 px-6 bg-subtle/30 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</p>
          <h2 className="font-display text-4xl md:text-6xl">Three steps to clarity.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.n} className="text-center md:text-left">
              <p className="font-display text-6xl text-muted-foreground/20 mb-4">{s.n}</p>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Live demo ────────────────────────────────────────────────────────────
type DemoFormat = "notes" | "summary" | "todo" | "message" | "email";
const DEMO_FORMATS: { id: DemoFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "notes",   label: "Notes",   icon: StickyNote },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "todo",    label: "To-do",   icon: ListChecks },
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "email",   label: "Email",   icon: FileText },
];

function LiveDemo() {
  const transform = useServerFn(transformText);
  const [input, setInput] = useState("had a great call with the team today. need to follow up with james about the proposal, send the deck to lisa by friday, and book the venue for the offsite. also remember to update the website footer before the launch next week.");
  const [format, setFormat] = useState<DemoFormat>("todo");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setOutput("");
    try {
      const res = await transform({ data: { input, format } });
      const full = res.output;
      let i = 0;
      const id = setInterval(() => {
        i += Math.max(1, Math.floor(full.length / 100));
        setOutput(full.slice(0, i));
        if (i >= full.length) { setOutput(full); clearInterval(id); }
      }, 14);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <section id="demo" className="mx-auto max-w-5xl px-6 py-24 border-t border-border/40">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Interactive demo</p>
        <h2 className="font-display text-4xl md:text-6xl">Watch thoughts take shape.</h2>
      </div>
      <div className="rounded-[2rem] border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="p-8 md:p-10">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block mb-5">Input — messy thoughts</label>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              className="w-full resize-none bg-transparent outline-none text-base leading-relaxed placeholder:text-muted-foreground/30 min-h-[220px]"
              placeholder="Paste anything on your mind…" />
          </div>
          <div className="p-8 md:p-10 bg-subtle/20">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block mb-5">Output — clarified</label>
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground/80 italic min-h-[220px]">
              {output || (loading ? "Synthesizing…" : "Pick a format and hit Transform.")}
            </pre>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 px-8 py-6 bg-background/60 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {DEMO_FORMATS.map(f => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${active ? "bg-foreground text-background shadow-lift" : "bg-subtle text-muted-foreground hover:bg-accent"}`}>
                  <Icon className="h-3.5 w-3.5" /> {f.label}
                </button>
              );
            })}
          </div>
          <Button onClick={run} disabled={loading} className="rounded-full px-7 h-11">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Clarifying…</> : <><Wand2 className="h-4 w-4 mr-2" />Transform</>}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    { name: "Theo M.",   role: "Founder",          text: "Cleaner thinking in two clicks. It's the calmest tool on my dock." },
    { name: "Adaeze O.", role: "Product Manager",   text: "I paste my meeting notes and get a perfect summary and action list instantly. Can't live without it." },
    { name: "Kris L.",   role: "Freelance Designer", text: "The email formatter alone saves me 30 minutes a day. The team chat is a bonus." },
    { name: "Yemi A.",   role: "Startup Founder",   text: "The Secrets Vault and Shared Spaces make it a real team tool, not just a personal notepad." },
  ];
  return (
    <section className="py-24 px-6 bg-subtle/30 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">What people say</p>
          <h2 className="font-display text-4xl md:text-5xl">Loved by thinkers.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quotes.map(q => (
            <div key={q.name} className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground italic">"{q.text}"</p>
              <div>
                <p className="text-sm font-medium">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for personal use and solo thinkers.",
      features: ["Workspace AI chat", "Thoughts archive", "Planner & calendar", "Help centre", "5 Secrets Vault entries"],
      cta: "Get started",
    },
    {
      name: "Pro",
      price: "$8",
      period: "per month",
      desc: "For power users who want the full toolkit.",
      features: ["Everything in Free", "Shared Spaces", "Team chat + email notifications", "Unlimited Secrets Vault", "Voice input", "Priority AI model"],
      cta: "Start free trial",
      highlight: true,
    },
    {
      name: "Team",
      price: "$25",
      period: "per month",
      desc: "For teams that think and ship together.",
      features: ["Everything in Pro", "Up to 10 members", "Admin controls", "Audit logs", "Custom domain invite links", "Dedicated support"],
      cta: "Contact us",
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 border-t border-border/40">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Pricing</p>
        <h2 className="font-display text-4xl md:text-6xl">Simple, honest pricing.</h2>
        <p className="text-muted-foreground mt-4">No tricks. Start free, upgrade when you're ready.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.name} className={`rounded-2xl border p-8 flex flex-col gap-6 ${p.highlight ? "border-foreground bg-foreground text-background" : "border-border/50 bg-card"}`}>
            <div>
              <p className={`text-xs uppercase tracking-widest mb-1 ${p.highlight ? "text-background/60" : "text-muted-foreground"}`}>{p.name}</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-4xl">{p.price}</span>
                <span className={`text-sm mb-1 ${p.highlight ? "text-background/60" : "text-muted-foreground"}`}>/ {p.period}</span>
              </div>
              <p className={`text-sm mt-2 ${p.highlight ? "text-background/70" : "text-muted-foreground"}`}>{p.desc}</p>
            </div>
            <ul className="space-y-2.5 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${p.highlight ? "text-background/70" : "text-sage"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/auth/signup">
              <Button className={`w-full rounded-full ${p.highlight ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                variant={p.highlight ? "secondary" : "outline"}>
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Is Quietly really free?",           a: "Yes. The Free plan is free forever with no credit card required. You get access to the AI workspace, planner, calendar, and more." },
    { q: "Which AI models does Quietly use?", a: "Quietly uses free-tier open models via OpenRouter (Llama 3.1, Mistral 7B, and Gemma 2) with automatic fallback. No OpenAI credits needed." },
    { q: "Is my data private?",                a: "Your data is stored securely in Firebase. The Secrets Vault is encrypted before storage. We never sell or share your data." },
    { q: "Can I use Quietly on mobile?",       a: "Yes — Quietly is fully responsive with a mobile-optimised bottom navigation and touch-friendly design." },
    { q: "How do invite links work?",          a: "Invite links use secure tokens, not hardcoded domains — so they keep working if we ever change our domain." },
    { q: "Can I delete my account?",           a: "Yes. Go to Settings → Security → Delete account. We send a verification code to confirm before deleting everything." },
  ];
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 border-t border-border/40">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">FAQ</p>
        <h2 className="font-display text-4xl md:text-5xl">Questions answered.</h2>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-subtle/50 transition">
              {f.q}
              {open === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                <p className="pt-4">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────
function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate — in production wire to Resend
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
  };

  return (
    <section id="contact" className="py-24 px-6 bg-subtle/30 border-t border-border/40">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Get in touch</p>
        <h2 className="font-display text-4xl md:text-5xl mb-3">Say hello.</h2>
        <p className="text-muted-foreground text-sm mb-10">Questions, feedback, or partnership enquiries — we'd love to hear from you.</p>
        {sent ? (
          <div className="rounded-2xl border border-border bg-card p-10 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-sage mx-auto" />
            <p className="font-display text-2xl">Message sent!</p>
            <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1.5">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm outline-none focus:border-foreground/40 transition" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm outline-none focus:border-foreground/40 transition" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1.5">Message</label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows={4}
                className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 text-sm outline-none focus:border-foreground/40 transition" />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-12">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-6 border-t border-border/40">
      <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-foreground text-background p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-8" alt="" />
        <div className="relative z-10">
          <h2 className="font-display text-5xl md:text-7xl mb-6">Ready for clarity?</h2>
          <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto font-light">
            Join thinkers, creators, and teams who choose intention over noise.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-base">
              Get started for free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Floating AI chat ─────────────────────────────────────────────────────
function FloatingAI() {
  const chat = useServerFn(helpChat);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant" as const, content: "Hi! Ask me anything about Quietly." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await chat({ data: { messages: next } });
      setMsgs(p => [...p, { role: "assistant", content: res.output }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Something went wrong, please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <>
      {/* Bubble */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-foreground text-background shadow-lift flex items-center justify-center hover:scale-105 transition">
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
          <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2 bg-subtle/50">
            <Sparkles className="h-4 w-4 text-violet" />
            <span className="text-sm font-medium">Ask Quietly</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user" ? "bg-foreground text-background rounded-tr-sm" : "bg-subtle border border-border/60 rounded-tl-sm"
                }`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="bg-subtle border border-border/60 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" style={{ animationDelay: `${i*0.18}s` }} />)}</div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-border/60 p-2 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ask about Quietly…"
              className="flex-1 rounded-full bg-subtle border border-border/60 px-3 py-1.5 text-xs outline-none focus:border-foreground/40 transition" />
            <button onClick={send} disabled={!input.trim() || loading}
              className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-40 transition">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
function Landing() {
  return (
    <div className="min-h-screen bg-background selection:bg-violet/20">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <LiveDemo />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
      <FloatingAI />
    </div>
  );
}
