import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { transformText, type Format } from "@/lib/ai/transform.functions";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  StickyNote, FileText, ListChecks, MessageSquare, Mail, FileBarChart, Target,
  Wand2, Copy, RefreshCcw, Save, Sparkles, History, X, ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/workspace")({
  component: Workspace,
});

const FORMATS: { id: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "todo", label: "To-do", icon: ListChecks },
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "report", label: "Report", icon: FileBarChart },
  { id: "action_plan", label: "Action plan", icon: Target },
];

const TONES = ["neutral", "warm", "concise", "formal", "casual"] as const;
type Tone = typeof TONES[number];

const PLACEHOLDERS = [
  "What's on your mind?",
  "Drop a meeting note…",
  "Describe your idea…",
  "Brain dump in progress…",
  "Paste anything. We'll sort it out.",
];

type Version = { output: string; format: Format; tone: Tone; at: number };

function Workspace() {
  const transform = useServerFn(transformText);
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("notes");
  const [tone, setTone] = useState<Tone>("neutral");
  const [contextChip, setContextChip] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[i]);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { if (animRef.current) clearInterval(animRef.current); }, []);

  const animateOutput = (full: string) => {
    if (animRef.current) clearInterval(animRef.current);
    setOutput("");
    let i = 0;
    animRef.current = setInterval(() => {
      i += Math.max(2, Math.floor(full.length / 100));
      setOutput(full.slice(0, i));
      if (i >= full.length) { setOutput(full); if (animRef.current) clearInterval(animRef.current); }
    }, 14);
  };

  const run = async () => {
    if (!input.trim()) return toast.error("Add some text first.");
    setLoading(true);
    setOutput("");
    try {
      const res = await transform({ data: { input, format, tone, context: contextChip || undefined } });
      animateOutput(res.output);
      setVersions((prev) => [{ output: res.output, format, tone, at: Date.now() }, ...prev].slice(0, 12));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied");
  };

  const save = async () => {
    if (!output || !user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "thoughts"), {
        input, output, format, tone, type: "transform",
        createdAt: serverTimestamp(),
      });
      toast.success("Saved to thoughts");
    } catch {
      toast.error("Could not save. Check Firestore rules.");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="border-b border-border/60 px-4 md:px-10 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Workspace</h1>
          <p className="text-xs text-muted-foreground mt-1">Paste, choose a format, transform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="rounded-md">
            <History className="h-4 w-4 mr-1.5" /> Versions ({versions.length})
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-6 md:py-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* INPUT */}
          <div className="rounded-md border border-border bg-card paper-lift glow-input p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your thoughts</label>
              <span className="text-[11px] text-muted-foreground">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              autoFocus
              placeholder={placeholder}
              className="w-full resize-none bg-transparent outline-none text-[15px] leading-relaxed placeholder:text-muted-foreground/60"
            />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                const active = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent border border-border"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {f.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="text-xs bg-transparent border border-border rounded-md px-2 py-1 outline-none"
              >
                {TONES.map((t) => <option key={t} value={t}>Tone: {t}</option>)}
              </select>
              <input
                value={contextChip}
                onChange={(e) => setContextChip(e.target.value)}
                placeholder="+ Add deadline, collaborator, or context"
                className="flex-1 min-w-[180px] text-xs bg-transparent border border-border rounded-md px-2 py-1 outline-none focus:border-ring placeholder:text-muted-foreground/60"
              />
              <Button onClick={run} disabled={loading} className="rounded-md">
                <Wand2 className="h-4 w-4 mr-1.5" />
                {loading ? "Transforming…" : "Transform"}
              </Button>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-violet" /> Powered by Claude 3.5 Sonnet via OpenRouter
            </div>
          </div>

          {/* OUTPUT */}
          <div className="rounded-md border border-border bg-card paper-lift p-5 min-h-[28rem] relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Output</label>
                {output && (
                  <span className="chip-violet rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    {FORMATS.find(f => f.id === format)?.label}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button onClick={run} disabled={loading || !input} variant="ghost" size="sm">
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Regenerate
                </Button>
                <Button onClick={copy} disabled={!output} variant="ghost" size="sm">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
                <Button onClick={save} disabled={!output} variant="ghost" size="sm">
                  <Save className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>
            {loading && !output && (
              <div className="flex items-center gap-2 py-12 justify-center">
                <span className="pulse-dot h-2 w-2 rounded-full bg-violet"></span>
                <span className="pulse-dot h-2 w-2 rounded-full bg-violet"></span>
                <span className="pulse-dot h-2 w-2 rounded-full bg-violet"></span>
                <span className="ml-2 text-xs text-muted-foreground">Thinking quietly…</span>
              </div>
            )}
            <pre className="whitespace-pre-wrap text-[14px] leading-relaxed font-sans text-foreground/90 min-h-[20rem] fade-in">
              {output || (!loading && "Your clean output will appear here.")}
            </pre>
          </div>
        </div>
      </div>

      {/* Version history slideout */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex justify-end bg-foreground/30 backdrop-blur-sm fade-in" onClick={() => setShowHistory(false)}>
          <aside className="w-full max-w-md h-full bg-card border-l border-border slide-in-right overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-display text-xl">Version history</h3>
              <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            {versions.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No versions yet. Transform something to start a history.</p>
            ) : (
              <ul className="p-4 space-y-3">
                {versions.map((v, i) => (
                  <li key={v.at} className="rounded-md border border-border/60 p-3 hover:bg-accent/40 transition cursor-pointer" onClick={() => { setOutput(v.output); setFormat(v.format); setTone(v.tone); setShowHistory(false); }}>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>v{versions.length - i} · {v.format}</span>
                      <span>{new Date(v.at).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-2 text-xs line-clamp-4 text-foreground/80 whitespace-pre-wrap">{v.output}</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}

      <div className="px-4 md:px-10 pb-10">
        <Link to="/app" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3 w-3 mr-1" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
