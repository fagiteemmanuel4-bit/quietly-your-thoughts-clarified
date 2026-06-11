import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { helpChat } from "@/lib/ai/transform.functions";
import { Bot, Send, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/help")({ component: HelpPage });

type Msg = { role: "user" | "assistant"; content: string };

function HelpPage() {
  const chat = useServerFn(helpChat);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm the Quietly Help Assistant. Ask me anything about using the app — features, where to find things, how something works. I know it all! 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await chat({ data: { messages: next } });
      setMsgs(p => [...p, { role: "assistant", content: res.output }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const FAQS = [
    "How do I change my password?",
    "Where is the Secrets Vault?",
    "How do I invite a teammate?",
    "What can the AI do in Workspace?",
    "How do I create a Space?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 px-4 md:px-8 py-4 flex items-center gap-3 bg-background/80 backdrop-blur-sm">
        <div className="h-8 w-8 rounded-full bg-sage-soft flex items-center justify-center">
          <HelpCircle className="h-4 w-4 text-sage" />
        </div>
        <div>
          <h1 className="font-medium text-sm">Help Centre</h1>
          <p className="text-[11px] text-muted-foreground">Powered by AI · knows everything about Quietly</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {msgs.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Common questions</p>
            {FAQS.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                className="block w-full text-left text-sm px-4 py-2.5 rounded-xl border border-border/60 hover:border-foreground/30 hover:bg-subtle/60 transition">
                {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs ${m.role === "assistant" ? "bg-sage-soft text-sage" : "bg-foreground text-background"}`}>
              {m.role === "assistant" ? <Bot className="h-4 w-4" /> : "You"}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user" ? "bg-foreground text-background rounded-tr-sm" : "bg-card border border-border/60 rounded-tl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-sage-soft flex items-center justify-center">
              <Bot className="h-4 w-4 text-sage" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => <span key={i} className="thinking-dot h-2 w-2 rounded-full bg-muted-foreground/40" style={{ animationDelay: `${i * 0.18}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 px-4 md:px-8 py-4 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Ask anything about Quietly…"
            className="flex-1 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:border-foreground/40 transition"
          />
          <Button onClick={send} disabled={!input.trim() || loading} className="rounded-full h-10 w-10 p-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
