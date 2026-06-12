import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatAgent } from "@/lib/ai/transform.functions";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Mic, MicOff, Send, Copy, RefreshCcw, ThumbsUp, ThumbsDown,
  Sparkles, ChevronDown, Bot, User, Plus, Loader2, Share2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/workspace")({ component: Workspace });

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  rating?: "up" | "down";
  thinking?: string;
};

function parseAction(content: string) {
  const match = content.match(/```action\s*([\s\S]*?)```/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

function cleanContent(content: string) {
  return content.replace(/```action[\s\S]*?```/g, "").trim();
}

// Simple markdown renderer
function Markdown({ text }: { text: string }) {
  const html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3 class='text-base font-semibold mt-4 mb-1'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-lg font-semibold mt-5 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-xl font-bold mt-6 mb-2'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm font-mono'>$1</code>")
    .replace(/^- \[ \] (.+)$/gm, "<div class='flex gap-2 items-start my-1'><span class='mt-0.5 h-4 w-4 rounded border border-border shrink-0'></span><span>$1</span></div>")
    .replace(/^- (.+)$/gm, "<div class='flex gap-2 my-1'><span class='mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0'></span><span>$1</span></div>")
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br/>");
  return (
    <div
      className="prose-quietly text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class='mb-2'>${html}</p>` }}
    />
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="thinking-dot h-2 w-2 rounded-full bg-muted-foreground/40"
          style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

export default function Workspace() {
  const agent = useServerFn(chatAgent);
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hey${user?.displayName ? ` ${user.displayName.split(" ")[0]}` : ""}! I'm your Quietly AI. I can help you clarify thoughts, draft emails, create tasks, plan projects, and more.\n\nTry typing something like:\n- *"Turn this meeting note into action items: …"*\n- *"Create a task: review the proposal"*\n- *"Draft a follow-up email to the client"*`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [msgs, scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input not supported in this browser.");
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e) => { setInput((prev) => prev + " " + e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.error("Voice recognition stopped."); };
    r.start();
    recognitionRef.current = r;
    setListening(true);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Msg = { id: Date.now().toString(), role: "user", content };
    setMsgs((p) => [...p, userMsg]);
    setLoading(true);

    const history = [...msgs.filter(m => m.id !== "welcome"), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await agent({ data: { messages: history, userName: user?.displayName || undefined } });
      const action = parseAction(res.output);
      const display = cleanContent(res.output);

      const assistantMsg: Msg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: display,
      };
      setMsgs((p) => [...p, assistantMsg]);

      // Handle agentic actions
      if (action && user) {
        if (action.create_task) {
          await addDoc(collection(db, "users", user.uid, "tasks"), {
            title: action.create_task.title,
            priority: action.create_task.priority || "later",
            done: false,
            createdAt: serverTimestamp(),
          });
          toast.success(`Task created: "${action.create_task.title}"`);
        }
        if (action.create_event) {
          await addDoc(collection(db, "users", user.uid, "events"), {
            title: action.create_event.title,
            date: action.create_event.date,
            time: action.create_event.time || "",
            createdAt: serverTimestamp(),
          });
          toast.success(`Event added: "${action.create_event.title}"`);
        }
      }

      // Save to thoughts archive
      if (user && display.length > 20) {
        addDoc(collection(db, "users", user.uid, "thoughts"), {
          input: content,
          output: display,
          type: "workspace_chat",
          format: "chat",
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI error");
    } finally {
      setLoading(false);
    }
  };

  const rate = (id: string, rating: "up" | "down") => {
    setMsgs((p) => p.map((m) => (m.id === id ? { ...m, rating } : m)));
    toast.success(rating === "up" ? "Thanks for the feedback!" : "Got it, I'll improve.");
  };

  const copyMsg = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard.");
  };

  const regenerate = async (id: string) => {
    const idx = msgs.findIndex((m) => m.id === id);
    if (idx < 1) return;
    const lastUser = msgs.slice(0, idx).reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMsgs((p) => p.filter((m) => m.id !== id));
    await send(lastUser.content);
  };

  const SUGGESTIONS = [
    "Summarise my last meeting notes",
    "Create a task to review the project",
    "Draft a professional follow-up email",
    "Help me plan my week",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 px-4 md:px-8 py-4 flex items-center gap-3 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--green-soft)" }}>
          <Sparkles className="h-4 w-4" style={{ color: "var(--green)" }} />
        </div>
        <div>
          <h1 className="font-medium text-sm">AI Workspace</h1>
          <p className="text-[11px] text-muted-foreground">Powered by Llama 3.1 · free</p>
        </div>
        <button
          onClick={() => setMsgs([{
            id: "welcome",
            role: "assistant",
            content: `Fresh start! What's on your mind?`,
          }])}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 relative">
        {msgs.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""} workspace-msg-in`}>
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium ${
              m.role === "assistant" ? "" : "bg-foreground text-background"
            }`}>
              {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={`group max-w-[85%] md:max-w-[70%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-foreground text-background rounded-tr-sm"
                  : "bg-card border border-border/60 rounded-tl-sm"
              }`}>
                {m.role === "assistant" ? (
                  <Markdown text={m.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>

              {/* Actions row for assistant */}
              {m.role === "assistant" && m.id !== "welcome" && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyMsg(m.content)} className="action-btn" title="Copy">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={() => regenerate(m.id)} className="action-btn" title="Regenerate">
                    <RefreshCcw className="h-3 w-3" />
                  </button>
                  <button onClick={() => rate(m.id, "up")}
                    className={`action-btn ${m.rating === "up" ? "text-sage" : ""}`} title="Good response">
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => rate(m.id, "down")}
                    className={`action-btn ${m.rating === "down" ? "text-destructive" : ""}`} title="Bad response">
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 workspace-msg-in">
            <div className="h-8 w-8 rounded-full bg-violet-soft flex items-center justify-center">
              <Bot className="h-4 w-4 text-violet" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button onClick={scrollToBottom}
          className="fixed bottom-32 md:bottom-24 right-6 h-8 w-8 rounded-full bg-card border border-border shadow-lift flex items-center justify-center z-20 transition hover:scale-105">
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Suggestions */}
      {msgs.length <= 1 && (
        <div className="px-4 md:px-8 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground transition">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 px-4 md:px-8 py-4 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={listening ? "🎙 Listening…" : "Ask anything or drop a thought…"}
              rows={1}
              className="w-full resize-none rounded-2xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm outline-none focus:border-foreground/40 transition max-h-40 overflow-y-auto"
              style={{ minHeight: "48px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
            />
          </div>
          <button onClick={toggleVoice}
            className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 transition ${
              listening ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
            title={listening ? "Stop" : "Voice input"}>
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <Button onClick={() => send()} disabled={!input.trim() || loading}
            className="h-12 w-12 rounded-full p-0 shrink-0" style={{ background: "var(--green)", color: "white" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Press Enter to send · Shift+Enter for new line · or use voice
        </p>
      </div>
    </div>
  );
}
