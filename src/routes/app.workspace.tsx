import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { agentChat } from "@/lib/ai/agent.functions";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Mic,
  Sparkles,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share2,
  Brain,
  MessageSquare,
  LayoutGrid,
  Plus,
  Search,
  Hash,
  Copy,
  Check,
  History,
  MoreVertical,
  ArrowUpRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/app/workspace")({
  component: AdvancedWorkspace,
});

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  id: string;
  timestamp: number;
};

type Room = {
  id: string;
  name: string;
  type: "team" | "topic";
  lastMessage?: string;
};

function AdvancedWorkspace() {
  const { user } = useAuth();
  const chatFn = useServerFn(agentChat);
  const [input, setInput] = useState("");
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    general: [
      {
        role: "assistant",
        content: "Hello. I am Quietly. Your context is currently set to **General Workspace**. How can I help you synthesize clarity today?",
        id: "initial",
        timestamp: Date.now(),
      },
    ],
    strategy: [
        {
            role: "assistant",
            content: "Welcome to the **Strategic Room**. I have loaded the Q3 roadmap into my context.",
            id: "strat-initial",
            timestamp: Date.now(),
        }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rooms: Room[] = [
    { id: "general", name: "General Workspace", type: "team", lastMessage: "Synthesize clarity..." },
    { id: "strategy", name: "Q3 Strategy", type: "topic", lastMessage: "Roadmap loaded." },
    { id: "design", name: "Design System", type: "topic", lastMessage: "Aurora assets ready." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeRoom]);

  const onSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
        role: "user",
        content: input,
        id: Date.now().toString(),
        timestamp: Date.now()
    };

    setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), userMsg]
    }));

    setInput("");
    setLoading(true);

    try {
      const res = await chatFn({
        data: {
          messages: (messages[activeRoom] || []).concat(userMsg).map(m => ({ role: m.role, content: m.content })),
          userId: user?.uid || "anon",
          userName: user?.displayName || undefined,
        }
      });

      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), {
            role: "assistant",
            content: res.text,
            reasoning: res.reasoning,
            id: (Date.now() + 1).toString(),
            timestamp: Date.now()
        }]
      }));
    } catch (e) {
      toast.error("AI connection interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  };

  const currentMessages = messages[activeRoom] || [];

  return (
    <div className="h-screen bg-[#0D0D12] text-[#F5F5F7] flex overflow-hidden">
      {/* Thread Navigator */}
      <aside className="w-80 border-r border-white/5 flex flex-col bg-[#0D0D12] z-20">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Intelligence Rooms</h2>
            <button className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><Plus className="h-3 w-3" /></button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 group-focus-within:text-[#7B5EA7] transition-colors" />
            <Input className="h-9 pl-9 rounded-xl bg-white/[0.02] border-white/5 focus:border-[#7B5EA7]/50 text-xs" placeholder="Search threads..." />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all relative group ${activeRoom === room.id ? "bg-[#1A1A24] border border-white/10 shadow-xl shadow-[#7B5EA7]/5" : "hover:bg-white/[0.02]"}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-colors ${activeRoom === room.id ? "bg-[#7B5EA7]/10 border-[#7B5EA7]/30 text-[#7B5EA7]" : "bg-white/5 border-white/5 text-white/20"}`}>
                   <Hash className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className={`text-sm font-bold truncate ${activeRoom === room.id ? "text-white" : "text-white/40"}`}>{room.name}</h3>
                  <p className="text-[10px] text-white/20 truncate">{room.lastMessage}</p>
                </div>
                {activeRoom === room.id && <div className="h-1.5 w-1.5 rounded-full bg-[#7B5EA7]" />}
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7B5EA7]/10 to-transparent border border-[#7B5EA7]/10 relative overflow-hidden group">
                <Brain className="absolute bottom-[-10px] right-[-10px] h-12 w-12 text-[#7B5EA7]/10 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#7B5EA7] mb-1">Neural Quota</h4>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                    <div className="h-full w-2/3 bg-gradient-to-r from-[#7B5EA7] to-[#4ECDC4]" />
                </div>
                <p className="text-[9px] text-white/30 font-medium">850 / 1200 messages</p>
            </div>
        </div>
      </aside>

      {/* Chat Workspace */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Ambient Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7B5EA7] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#4ECDC4] blur-[120px]" />
        </div>

        <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#0D0D12]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#1A1A24] border border-white/10 flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-[#4ECDC4]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">{rooms.find(r => r.id === activeRoom)?.name}</h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-[#4ECDC4] font-bold">Neural Sync Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><History className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><Share2 className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </header>

        <ScrollArea className="flex-1 z-1" viewportRef={scrollRef}>
          <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
            {currentMessages.map((m) => (
              <div key={m.id} className={`flex gap-6 ${m.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`shrink-0 ${m.role === "user" ? "hidden" : "block"}`}>
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                        m.role === "assistant" ? "bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] border-white/20 text-white" : "bg-white/5 border-white/5 text-white/20"
                    }`}>
                        {m.role === "assistant" ? <Brain className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                </div>

                <div className={`max-w-[80%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            {m.role === "assistant" ? "Quietly Intelligence" : (user?.displayName || "Thinker")}
                        </span>
                        <span className="text-[9px] font-bold text-white/10">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`rounded-[28px] p-6 shadow-2xl ${
                      m.role === "user"
                        ? "bg-[#7B5EA7] text-white border border-white/10"
                        : "bg-[#1A1A24]/60 border border-white/5 backdrop-blur-xl"
                    }`}>
                        {m.reasoning && (
                            <details className="mb-6 group">
                                <summary className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#7B5EA7] cursor-pointer list-none flex items-center gap-2 opacity-60 hover:opacity-100 transition">
                                    <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                                    Analytical Reasoning
                                </summary>
                                <div className="mt-4 pl-4 border-l-2 border-[#7B5EA7]/20 text-[11px] text-white/40 leading-relaxed italic">
                                    {m.reasoning}
                                </div>
                            </details>
                        )}

                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#0D0D12] prose-pre:border prose-pre:border-white/5">
                            <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <div className="relative group">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" onClick={() => {
                                                navigator.clipboard.writeText(String(children));
                                                toast.success("Copied to clipboard");
                                            }}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className={`${className} bg-white/5 px-1.5 py-0.5 rounded text-[#4ECDC4]`} {...props}>
                                    {children}
                                    </code>
                                );
                                }
                            }}
                            >
                            {m.content}
                            </ReactMarkdown>
                        </div>

                        {m.role === "assistant" && m.id !== "initial" && (
                            <div className="mt-8 flex items-center gap-1 border-t border-white/5 pt-4">
                                <ResponseAction icon={<ThumbsUp />} label="Rate" />
                                <ResponseAction icon={<RotateCcw />} label="Regenerate" />
                                <ResponseAction icon={<Copy />} label="Copy" />
                                <ResponseAction icon={<Share2 />} label="Share to Room" />
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 text-[#7B5EA7] pl-16">
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Neural Input */}
        <footer className="p-8 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12] to-transparent z-10">
            <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#7B5EA7] to-[#4ECDC4] rounded-[32px] opacity-10 group-focus-within:opacity-25 blur-xl transition duration-700" />
                <div className="relative flex items-end gap-3 bg-[#1A1A24]/80 backdrop-blur-2xl rounded-[30px] border border-white/10 p-3 shadow-2xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={startListening}
                        className={`rounded-2xl h-12 w-12 transition-all ${isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-white/20 hover:text-white"}`}
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        rows={1}
                        placeholder="Drop messy thoughts here..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 py-3.5 text-base resize-none max-h-40"
                        style={{ height: 'auto' }}
                        onInput={(e: any) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <div className="flex items-center gap-2 pb-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-white">
                            <Plus className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={onSend}
                            disabled={loading || !input.trim()}
                            className="rounded-2xl h-12 w-12 bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 text-white shadow-xl shadow-[#7B5EA7]/20 group overflow-hidden"
                        >
                            {loading ? <Sparkles className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </Button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-6">
                    <div className="flex gap-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">⌘ + Enter to synthesize</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Shift + Enter for new line</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4ECDC4] shadow-[0_0_8px_rgba(78,205,196,0.5)]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4ECDC4]">Neural Engine v2.0 Online</span>
                    </div>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}

function ResponseAction({ icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 text-[9px] uppercase tracking-widest font-bold text-white/30 hover:text-white transition-all group">
            <span className="group-hover:scale-110 transition-transform">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
