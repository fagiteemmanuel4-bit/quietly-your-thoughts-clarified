import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { helpAssistant } from "@/lib/help.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  HelpCircle,
  ChevronRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/contact")({ component: HelpCentre });

function HelpCentre() {
  const ask = useServerFn(helpAssistant);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    try {
        const res = await ask({ data: { question } });
        setAnswer(res.text);
    } catch {
        setAnswer("Synthesis failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B5EA7]/10 border border-[#7B5EA7]/20 mb-6">
            <Sparkles className="h-3 w-3 text-[#7B5EA7]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#7B5EA7]">Neural Support v1.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">How can we help?</h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">Ask our AI anything about Quietly, or explore our documentation below.</p>
        </header>

        <div className="relative group max-w-2xl mx-auto mb-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#7B5EA7] to-[#4ECDC4] rounded-2xl opacity-20 blur-xl group-focus-within:opacity-40 transition duration-700" />
          <form onSubmit={handleAsk} className="relative flex items-center bg-[#1A1A24] rounded-2xl border border-white/10 p-2 shadow-2xl">
            <Search className="ml-4 h-5 w-5 text-white/20" />
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Where do I change my AI model?"
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/20 h-12"
            />
            <Button type="submit" disabled={loading} className="rounded-xl bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 h-10 px-6 font-bold text-xs uppercase tracking-widest">
              {loading ? "Synthesizing..." : "Ask Assistant"}
            </Button>
          </form>

          {answer && (
            <div className="mt-8 p-8 rounded-3xl bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-[#7B5EA7]/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-[#7B5EA7]" />
                 </div>
                 <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">Quietly Response</span>
               </div>
               <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/80">
                  <ReactMarkdown>{answer}</ReactMarkdown>
               </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <HelpCard
            icon={<BookOpen />}
            title="Documentation"
            description="Deep dive into every feature and neural workflow."
          />
          <HelpCard
            icon={<MessageCircle />}
            title="Community"
            description="Join fellow thinkers and share your synth setups."
          />
          <HelpCard
            icon={<HelpCircle />}
            title="Direct Support"
            description="Talk to a human if the AI loses its way."
          />
        </div>
      </div>
    </div>
  );
}

function HelpCard({ icon, title, description }: any) {
    return (
        <div className="p-8 rounded-[32px] bg-[#1A1A24]/40 border border-white/5 hover:border-[#7B5EA7]/20 transition-all duration-500 group cursor-pointer shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-6 group-hover:bg-[#7B5EA7]/10 group-hover:text-[#7B5EA7] transition-all">
                {icon}
            </div>
            <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
            <p className="text-xs text-white/30 leading-relaxed mb-6">{description}</p>
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#7B5EA7] opacity-0 group-hover:opacity-100 transition-all">
                Explore <ArrowRight className="h-3 w-3" />
            </span>
        </div>
    );
}
