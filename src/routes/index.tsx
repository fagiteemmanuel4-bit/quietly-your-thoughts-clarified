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
  Zap,
  Focus,
  Moon,
  Wand2,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quietly — Your thoughts, clarified" },
      {
        name: "description",
        content:
          "Turn messy thoughts into clarity with AI. A calm space for thinking, planning, and collaborating.",
      },
      { property: "og:title", content: "Quietly — Your thoughts, clarified" },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200",
      },
    ],
  }),
  component: Landing,
});

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 px-6">
      {/* Background Lifestyle Image with "Stitch" feel */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2000"
          alt="Peaceful workspace"
          className="w-full h-full object-cover opacity-20 dark:opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 backdrop-blur-md px-4 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-8">
          <Sparkles className="h-3 w-3 text-violet" /> Redefining focus
        </div>

        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight text-foreground">
          Your thoughts,
          <br />
          <span className="italic text-muted-foreground/80">clarified.</span>
        </h1>

        <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Quietly is the intentional space where messy ideas become structured action. AI-powered,
          human-centered.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/signup">
            <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lift group">
              Begin your journey{" "}
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#demo">
            <Button size="lg" variant="ghost" className="rounded-full h-14 px-8 text-base">
              Experience the clarity
            </Button>
          </a>
        </div>
      </div>

      {/* "Stitched" Floating Elements */}
      <div className="absolute bottom-10 left-10 hidden lg:block fade-in delay-500">
        <div className="paper p-4 rounded-xl max-w-[200px] rotate-[-2deg] shadow-lift">
          <Quote className="h-4 w-4 text-violet mb-2" />
          <p className="text-xs italic text-muted-foreground">
            "The best tool I've used for deep work and reflection."
          </p>
        </div>
      </div>
      <div className="absolute top-40 right-10 hidden lg:block fade-in delay-700">
        <div className="paper p-4 rounded-xl max-w-[180px] rotate-[3deg] shadow-lift">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-sage" />
            <span className="text-[10px] uppercase tracking-wider">Presence</span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LifestyleShowcase() {
  return (
    <section className="py-24 px-6 bg-subtle/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              A companion for your <br />
              most ambitious thinking.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're drafting a strategy, reflecting on your day, or coordinating with a
              team, Quietly provides the canvas that adapts to your mental model.
            </p>
            <div className="space-y-4">
              {[
                "Instant structure from raw voice or text",
                "Real-time collaboration with shared presence",
                "Deep focus modes with integrated timers",
                "A minimalist UI that respects your attention",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-sage" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-[1deg]">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1200"
                alt="Collaborative work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 aspect-square rounded-2xl overflow-hidden border-8 border-background shadow-lift rotate-[-2deg]">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"
                alt="Focused individual"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Format = "notes" | "summary" | "todo" | "message";

const FORMATS: { id: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
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
      const full = res.output;
      let i = 0;
      const id = setInterval(() => {
        i += Math.max(1, Math.floor(full.length / 120));
        setOutput(full.slice(0, i));
        if (i >= full.length) {
          setOutput(full);
          clearInterval(id);
        }
      }, 16);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="mx-auto max-w-5xl px-6 py-32">
      <div className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Interactive Demo
        </p>
        <h2 className="font-display text-5xl md:text-6xl">Watch thoughts take shape.</h2>
      </div>

      <div className="rounded-[2.5rem] border border-border/60 bg-card shadow-2xl overflow-hidden grain relative">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="p-10">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block mb-6">
              Input — Messy thoughts
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full resize-none bg-transparent outline-none text-xl leading-relaxed placeholder:text-muted-foreground/30 min-h-[300px]"
              placeholder="Paste anything on your mind…"
            />
          </div>
          <div className="p-10 bg-subtle/20">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block mb-6">
              Output — Clarified
            </label>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-foreground/80 italic">
                {output || (loading ? "Synthesizing..." : "Select a format and transform.")}
              </pre>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border/40 px-10 py-8 bg-background/60 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition ${
                    active
                      ? "bg-foreground text-background shadow-lift"
                      : "bg-subtle text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {f.label}
                </button>
              );
            })}
          </div>
          <Button onClick={run} disabled={loading} size="lg" className="rounded-full px-8 h-12">
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Clarifying..." : "Transform"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Zap,
      title: "Velocity",
      body: "Turn a 10-minute voice memo into a perfect summary in seconds.",
    },
    {
      icon: Focus,
      title: "Focus Timer",
      body: "Built-in Pomodoro tools to keep you in the flow state.",
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      body: "Real-time communication designed for asynchronous clarity.",
    },
    {
      icon: Moon,
      title: "Calm Design",
      body: "An interface that feels like high-quality paper. Zero distractions.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-t border-border/40">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.title}
              className="group p-8 rounded-3xl border border-border/40 bg-card hover:bg-subtle/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Icon className="h-6 w-6 text-foreground/70" />
              </div>
              <h3 className="font-display text-2xl mb-3">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto rounded-[3rem] bg-foreground text-background p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          alt=""
        />
        <div className="relative z-10">
          <h2 className="font-display text-5xl md:text-7xl mb-8">Ready for clarity?</h2>
          <p className="text-xl text-background/70 mb-12 max-w-xl mx-auto font-light">
            Join a community of thinkers, creators, and leaders who choose intention over noise.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="rounded-full h-16 px-10 text-lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background selection:bg-violet/20">
      <Navbar />
      <main>
        <HeroSection />
        <LifestyleShowcase />
        <LiveDemo />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
