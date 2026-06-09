import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { transformText } from "@/lib/ai/transform.functions";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Sparkles,
  ListChecks,
  FileText,
  MessageSquare,
  StickyNote,
  Check,
  Zap,
  Focus,
  Moon,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quietly — Turn messy thoughts into clarity" },
      { name: "description", content: "Paste anything. Get structure instantly. Quietly transforms raw thoughts into clean notes, summaries, to-dos, and polished messages." },
      { property: "og:title", content: "Quietly — Turn messy thoughts into clarity" },
      { property: "og:description", content: "Paste anything. Get structure instantly." },
    ],
  }),
  component: Landing,
});

const DEMO_LINES = [
  "ok so tomorrow i need to email sarah about the launch,",
  " also pick up groceries — milk, bread, eggs.",
  " think about the pricing page redesign.",
  " maybe call mom in the evening.",
];

function HeroTypewriter() {
  const [text, setText] = useState("");
  useEffect(() => {
    const full = DEMO_LINES.join("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) {
        setTimeout(() => { i = 0; setText(""); }, 2200);
      }
    }, 35);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-12 mx-auto max-w-2xl float-slow">
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur shadow-glow p-6 text-left">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="h-2 w-2 rounded-full bg-foreground/30" />
          New thought
        </div>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90 caret min-h-[6rem]">
          {text}
        </p>
      </div>
    </div>
  );
}

type Format = "notes" | "summary" | "todo" | "message";

const FORMATS: { id: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "todo", label: "To-do", icon: ListChecks },
  { id: "message", label: "Message", icon: MessageSquare },
];

function LiveDemo() {
  const transform = useServerFn(transformText);
  const [input, setInput] = useState(
    "had a great call with the team today. need to follow up with james about the proposal, send the deck to lisa by friday, and book the venue for the offsite. also remember to update the website footer.",
  );
  const [format, setFormat] = useState<Format>("todo");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await transform({ data: { input, format } });
      // typing effect
      const full = res.output;
      let i = 0;
      const id = setInterval(() => {
        i += Math.max(1, Math.floor(full.length / 120));
        setOutput(full.slice(0, i));
        if (i >= full.length) { setOutput(full); clearInterval(id); }
      }, 16);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="mx-auto max-w-5xl px-6 pt-24">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Try it now</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">See it work, instantly.</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          No signup. Type a messy thought, pick a format, watch it become clear.
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card shadow-glow overflow-hidden">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="p-6">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Your thoughts</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="mt-2 w-full resize-none bg-transparent outline-none text-base leading-relaxed placeholder:text-muted-foreground/60"
              placeholder="Paste anything on your mind…"
            />
          </div>
          <div className="p-6 bg-subtle/40 min-h-[20rem]">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Output</label>
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground/90">
              {output || (loading ? "Thinking…" : "Output will appear here.")}
            </pre>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-4 bg-background/40">
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {f.label}
                </button>
              );
            })}
          </div>
          <Button onClick={run} disabled={loading} className="rounded-full">
            <Wand2 className="h-4 w-4 mr-1.5" />
            {loading ? "Transforming…" : "Transform"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Zap, title: "Instant transformation", body: "Paste, choose, and your thought is restructured in under a second." },
    { icon: Sparkles, title: "Clean, calm outputs", body: "No noise. Just the words you need, formatted exactly right." },
    { icon: ListChecks, title: "Four useful formats", body: "Notes, bullet summaries, to-do lists, and polished messages." },
    { icon: Focus, title: "Built for focus", body: "A quiet UI that disappears so your thinking can take center stage." },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pt-32">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Why Quietly</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Everything you need. Nothing you don't.</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="rounded-2xl border border-border/60 p-6 bg-card transition hover:shadow-glow hover:-translate-y-0.5">
              <Icon className="h-5 w-5 text-foreground/70" />
              <h3 className="mt-4 font-medium">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Screenshots() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-32">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">A peek inside</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Designed to disappear.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <MockEditor />
        <MockOutput />
        <MockHistory />
      </div>
    </section>
  );
}

function MockEditor() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Editor</div>
      <div className="space-y-2 text-xs leading-relaxed">
        <div className="h-2 w-3/4 rounded bg-foreground/10" />
        <div className="h-2 w-full rounded bg-foreground/10" />
        <div className="h-2 w-5/6 rounded bg-foreground/10" />
        <div className="h-2 w-2/3 rounded bg-foreground/10" />
        <div className="h-2 w-1/2 rounded bg-foreground/10" />
      </div>
      <div className="mt-4 flex gap-1.5">
        <span className="text-[10px] px-2 py-1 rounded-full bg-foreground text-background">Notes</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-accent text-muted-foreground">To-do</span>
      </div>
    </div>
  );
}
function MockOutput() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Output</div>
      <ul className="text-xs space-y-1.5">
        <li className="flex items-start gap-2"><span className="h-3 w-3 rounded border border-foreground/40 mt-0.5" /> Email Sarah re: launch</li>
        <li className="flex items-start gap-2"><span className="h-3 w-3 rounded border border-foreground/40 mt-0.5" /> Pick up groceries</li>
        <li className="flex items-start gap-2"><span className="h-3 w-3 rounded border border-foreground/40 mt-0.5" /> Sketch pricing redesign</li>
        <li className="flex items-start gap-2"><span className="h-3 w-3 rounded border border-foreground/40 mt-0.5 bg-foreground" /> Call mom</li>
      </ul>
    </div>
  );
}
function MockHistory() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">History</div>
      <div className="space-y-2">
        {["Launch checklist", "Standup notes", "Reply to Tom", "Idea — onboarding"].map((t) => (
          <div key={t} className="flex justify-between items-center text-xs">
            <span>{t}</span><span className="text-muted-foreground">2d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Paste your thoughts", body: "Dump anything — voice memo transcript, scribbles, half-formed ideas." },
    { n: "02", title: "Choose a format", body: "Notes, summary, to-do list, or polished message. One click." },
    { n: "03", title: "Get clarity", body: "Quietly returns clean, structured text in seconds." },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 pt-32">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Three steps. That's it.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border/60 p-8 bg-card">
            <div className="font-display text-5xl text-muted-foreground/40">{s.n}</div>
            <h3 className="mt-4 font-medium text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["20 transformations / day", "All 4 formats", "7-day history", "Light & dark mode"],
      cta: "Start free",
      to: "/auth/signup",
      featured: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/ month",
      features: ["Unlimited transformations", "Unlimited history", "Focus mode", "Priority AI speed", "Early access to new formats"],
      cta: "Go Pro",
      to: "/auth/signup",
      featured: true,
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-4xl px-6 pt-32">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Pricing</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Simple, like everything else.</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-8 transition ${
              p.featured
                ? "border-foreground bg-foreground text-background shadow-glow"
                : "border-border/60 bg-card"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{p.name}</h3>
              <div>
                <span className="font-display text-4xl">{p.price}</span>
                <span className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}> {p.period}</span>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 opacity-70" /> {f}
                </li>
              ))}
            </ul>
            <Link to={p.to} className="block mt-8">
              <Button
                className={`w-full rounded-full ${p.featured ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                variant={p.featured ? "default" : "outline"}
              >
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden hero-gradient">
          <div className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" /> AI-powered clarity
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] tracking-tight">
              Turn messy thoughts
              <br />
              into <em className="font-display italic text-muted-foreground">clarity.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Paste anything. Get structure instantly. <Brand size="sm" /> is a calm space for thinking.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="rounded-full h-12 px-6">
                  Try it free <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="ghost" className="rounded-full h-12 px-6">
                  See demo
                </Button>
              </a>
            </div>
            <HeroTypewriter />
          </div>
        </section>

        <LiveDemo />
        <Features />
        <Screenshots />
        <HowItWorks />
        <Pricing />

        <section className="mx-auto max-w-3xl px-6 pt-32 text-center">
          <Moon className="h-6 w-6 mx-auto text-muted-foreground" />
          <h2 className="font-display text-4xl md:text-5xl mt-4">A quieter way to think.</h2>
          <p className="mt-4 text-muted-foreground">Join thousands using Quietly to turn noise into clarity.</p>
          <Link to="/auth/signup">
            <Button size="lg" className="rounded-full h-12 px-6 mt-6">
              Get started — it's free
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
