import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { dailyBrief } from "@/lib/ai/transform.functions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, ListChecks, Calendar, Sparkles, MessageSquare, CheckCircle2, Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

type Thought = { id: string; input?: string; output?: string; text?: string; format?: string; type?: string };
type Task = { id: string; title: string; priority: string; done?: boolean };

function Dashboard() {
  const { user } = useAuth();
  const brief = useServerFn(dailyBrief);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [briefText, setBriefText] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const tSnap = await getDocs(query(collection(db, "users", user.uid, "thoughts"), orderBy("createdAt", "desc"), limit(6)));
        setThoughts(tSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Thought, "id">) })));

        const taskSnap = await getDocs(query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc"), limit(5)));
        setTasks(taskSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Task, "id">) })));
      } catch {
        /* silent */
      }
    })();
  }, [user]);

  // Auto-generate brief on first visit of the day
  useEffect(() => {
    if (!user || briefGenerated) return;
    const todayKey = `brief_${new Date().toDateString()}_${user.uid}`;
    const cached = localStorage.getItem(todayKey);
    if (cached) { setBriefText(cached); setBriefGenerated(true); return; }

    setBriefGenerated(true);
    (async () => {
      setBriefLoading(true);
      try {
        const res = await brief({
          data: {
            name: user.displayName?.split(" ")[0],
            thoughts: thoughts.slice(0, 5).map(t => t.output || t.text || t.input || ""),
            tasks: tasks.filter(t => !t.done).slice(0, 5).map(t => t.title),
          },
        });
        setBriefText(res.brief);
        localStorage.setItem(todayKey, res.brief);
      } catch { /* silent */ }
      finally { setBriefLoading(false); }
    })();
  }, [user, thoughts, tasks, brief, briefGenerated]);

  const firstName = user?.displayName?.split(" ")[0] || "";
  const pendingTasks = tasks.filter(t => !t.done);
  const urgentTasks = pendingTasks.filter(t => t.priority === "urgent");

  const quickActions = [
    { to: "/app/workspace", icon: Pencil, label: "Open Workspace", color: "bg-violet-soft text-violet" },
    { to: "/app/planner", icon: ListChecks, label: "View Tasks", color: "bg-sage-soft text-sage" },
    { to: "/app/calendar", icon: Calendar, label: "Calendar", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
    { to: "/app/team", icon: MessageSquare, label: "Team Chat", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="fade-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{greeting()}</p>
          <h1 className="font-display text-3xl md:text-4xl">
            {firstName ? `${greeting()}, ${firstName}.` : `${greeting()}.`}
          </h1>
        </div>

        {/* Stats row */}
        {(pendingTasks.length > 0 || thoughts.length > 0) && (
          <div className="grid grid-cols-3 gap-3 fade-up" style={{ animationDelay: "0.05s" }}>
            <StatCard value={pendingTasks.length} label="open tasks" warn={urgentTasks.length > 0} />
            <StatCard value={urgentTasks.length} label="urgent" warn={urgentTasks.length > 0} />
            <StatCard value={thoughts.length} label="thoughts saved" />
          </div>
        )}

        {/* AI Brief */}
        <div className="rounded-xl border border-border bg-card p-5 fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-violet" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Daily brief</span>
          </div>
          {briefLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating your brief…
            </div>
          ) : briefText ? (
            <p className="text-sm leading-relaxed">{briefText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Your brief will appear here. Add some thoughts or tasks and come back tomorrow.</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(a => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-foreground/30 hover:shadow-lift transition paper-lift">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${a.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Urgent tasks */}
        {urgentTasks.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10 p-5 fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Urgent — {urgentTasks.length} task{urgentTasks.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="space-y-2">
              {urgentTasks.slice(0, 3).map(t => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> {t.title}
                </li>
              ))}
            </ul>
            <Link to="/app/planner">
              <Button size="sm" variant="outline" className="mt-3">
                View all tasks <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Recent thoughts */}
        {thoughts.length > 0 && (
          <div className="fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent thoughts</p>
              <Link to="/app/thoughts" className="text-xs text-muted-foreground hover:text-foreground transition">
                See all <ArrowRight className="h-3 w-3 inline ml-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {thoughts.slice(0, 4).map(t => (
                <div key={t.id} className="rounded-xl border border-border bg-card p-4 paper-lift cursor-pointer">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t.format || t.type || "note"}</p>
                  <p className="text-sm line-clamp-3 leading-relaxed">{t.output || t.text || t.input}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, warn }: { value: number; label: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${warn && value > 0 ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10" : "border-border bg-card"}`}>
      <p className={`text-2xl font-display font-semibold ${warn && value > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}
