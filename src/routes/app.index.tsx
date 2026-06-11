import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { agentChat } from "@/lib/ai/agent.functions";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
  Brain,
  History,
  Settings,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: AdvancedDashboard,
});

function AdvancedDashboard() {
  const { user } = useAuth();
  const chatFn = useServerFn(agentChat);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "thoughts"),
          orderBy("createdAt", "desc"),
          limit(5),
        ),
      );
      setThoughts(snap.docs.map((d) => d.data()));
    };
    fetchActivity();
  }, [user]);

  const generateSummary = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await chatFn({
        data: {
          messages: [
            {
              role: "user",
              content:
                "Give me a concise, data-driven summary of what's happened in my workspace lately. Highlight new tasks and pending reviews.",
            },
          ],
          userId: user.uid,
          userName: user.displayName || undefined,
        },
      });
      setBrief(res.text);
    } catch (e) {
      setBrief("System synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.displayName?.split(" ")[0] || "Thinker";

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] pb-24">
      {/* Hero Section */}
      <div className="px-6 md:px-12 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#7B5EA7]/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A24] border border-[#7B5EA7]/20 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-1.5 w-1.5 rounded-full bg-[#7B5EA7]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#7B5EA7]">
              Neural Pulse Active
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B5EA7] to-[#4ECDC4]">
              {firstName}.
            </span>
          </h1>
          <p className="text-[#F5F5F7]/40 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-left-4 duration-1000">
            The workspace has been synthesized. Your intelligence engine is ready to organize the
            chaos.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-[32px] bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#7B5EA7]/20 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="h-32 w-32 text-[#7B5EA7]" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4ECDC4]" />
                  <h2 className="text-xs uppercase tracking-widest font-bold text-[#F5F5F7]/60">
                    Workspace Synthesis
                  </h2>
                </div>
                <Button
                  onClick={generateSummary}
                  disabled={loading}
                  variant="ghost"
                  className="text-[10px] uppercase tracking-widest font-bold hover:bg-white/5"
                >
                  {loading ? "Synthesizing..." : brief ? "Refresh" : "Generate Brief"}
                </Button>
              </div>

              {brief ? (
                <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed animate-in fade-in duration-500">
                  {brief}
                </div>
              ) : (
                <p className="text-[#F5F5F7]/40 text-lg leading-relaxed">
                  Your daily intelligence brief is ready to be composed. Pull insights from your
                  latest thoughts and tasks.
                </p>
              )}

              <div className="mt-8 flex gap-3">
                <Button
                  asChild
                  className="rounded-full bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 h-12 px-8"
                >
                  <Link to="/app/workspace">
                    <Zap className="h-4 w-4 mr-2" /> Enter Workspace
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <StatCard
                icon={<Target />}
                label="Active Tasks"
                value="3"
                trend="+1 since yesterday"
                color="#7B5EA7"
              />
              <StatCard
                icon={<MessageSquare />}
                label="Team Syncs"
                value="12"
                trend="Active now"
                color="#4ECDC4"
              />
              <StatCard
                icon={<History />}
                label="Brain Dumps"
                value={thoughts.length.toString()}
                trend="Captured this week"
                color="#F5F5F7"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction to="/app/planner" label="Planner" icon={<Plus />} />
        <QuickAction to="/app/team" label="Team" icon={<Plus />} />
        <QuickAction to="/app/settings" label="Settings" icon={<Settings />} />
        <QuickAction to="/app/thoughts" label="Archive" icon={<Plus />} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="rounded-[24px] bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-display font-bold leading-none" style={{ color }}>
          {value}
        </span>
        <span className="text-[9px] uppercase tracking-wider font-bold text-white/20">{trend}</span>
      </div>
    </div>
  );
}

function QuickAction({ to, label, icon }: any) {
  return (
    <Link
      to={to}
      className="group rounded-[20px] bg-[#1A1A24]/40 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 hover:bg-[#7B5EA7]/10 hover:border-[#7B5EA7]/30 transition-all duration-300 text-center"
    >
      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[#7B5EA7] group-hover:scale-110 transition-all">
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  );
}
