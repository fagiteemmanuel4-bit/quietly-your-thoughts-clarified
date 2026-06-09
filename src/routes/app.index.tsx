import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { transformText } from "@/lib/ai/transform.functions";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  StickyNote, FileText, ListChecks, MessageSquare,
  Wand2, Copy, RefreshCcw, Focus, Save, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: Workspace,
});

type Format = "notes" | "summary" | "todo" | "message";

const FORMATS: { id: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "todo", label: "To-do", icon: ListChecks },
  { id: "message", label: "Message", icon: MessageSquare },
];

const SUGGESTIONS: Record<Format, string[]> = {
  notes: ["Use H2 headings", "Group by topic"],
  summary: ["3–5 bullets", "Keep each tight"],
  todo: ["Start each with a verb", "Add who/when"],
  message: ["Set the tone", "Open with context"],
};

function Workspace() {
  const transform = useServerFn(transformText);
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("notes");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      const res = await transform({ data: { input, format } });
      animateOutput(res.output);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const save = async () => {
    if (!output || !user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "history"), {
        input, output, format, createdAt: serverTimestamp(),
      });
      toast.success("Saved to history");
    } catch {
      toast.error("Could not save. Check Firestore rules.");
    }
  };

  return (
    <div className={`min-h-screen ${focus ? "bg-background" : ""}`}>
      <div className="border-b border-border/60 px-6 md:px-10 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Workspace</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Paste, choose a format, transform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={focus ? "default" : "ghost"} size="sm"
            onClick={() => setFocus(!focus)} className="rounded-full"
          >
            <Focus className="h-3.5 w-3.5 mr-1.5" /> Focus mode
          </Button>
        </div>
      </div>

      <div className={`mx-auto ${focus ? "max-w-3xl" : "max-w-6xl"} px-6 md:px-10 py-8`}>
        <div className={`grid gap-6 ${focus ? "grid-cols-1" : "lg:grid-cols-2"}`}>
          <div className="rounded-2xl border border-border/60 bg-card p-5 glow-input transition">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Your thoughts</label>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={focus ? 16 : 14}
              autoFocus
              placeholder="Dump whatever's on your mind. Quietly will sort it out."
              className="w-full resize-none bg-transparent outline-none text-base leading-relaxed placeholder:text-muted-foreground/60"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  const active = format === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS[format].map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
                  <Sparkles className="h-3 w-3" /> {s}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-subtle/40 p-5 min-h-[28rem]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Output</label>
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
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground/90 min-h-[20rem]">
              {output || (loading ? "Thinking quietly…" : "Your clean output will appear here.")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
