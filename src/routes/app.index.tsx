import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { dailyBrief } from "@/lib/ai/transform.functions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, ListChecks, Calendar, Sparkles, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

type Thought = {
  id: string;
  input?: string;
  output?: string;
  text?: string;
  format?: string;
  type?: string;
};

function Dashboard() {
  const { user } = useAuth();
  const brief = useServerFn(dailyBrief);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [briefText, setBriefText] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", user.uid, "thoughts"),
            orderBy("createdAt", "desc"),
            limit(8),
          ),
        );
        setThoughts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Thought, "id">) })));
      } catch {
        setThoughts([]);
      }
    })();
  }, [user]);

  const generateBrief = async () => {
    if (!user) return;
    setBriefLoading(true);
    try {
      const recent = thoughts
        .slice(0, 5)
        .map((t) => t.output || t.text || t.input || "")
        .filter(Boolean);
      const res = await brief({
        data: { name: user.displayName?.split(" ")[0] || undefined, thoughts: recent },
      });
      setBriefText(res.brief);
    } catch (e) {
      setBriefText(e instanceof Error ? e.message : "Could not generate brief.");
    } finally {
      setBriefLoading(false);
    }
  };

  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">
          {greeting()}, {firstName}.
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-6 md:py-8 grid gap-6 lg:grid-cols-3">
        {/* Daily Brief */}
        <div className="lg:col-span-2 rounded-md border border-border bg-card paper-lift p-6 relative grain overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Daily brief
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={generateBrief} disabled={briefLoading}>
              {briefLoading ? "Composing…" : briefText ? "Refresh" : "Generate"}
            </Button>
          </div>
          {briefText ? (
            <p className="font-display text-xl md:text-2xl leading-relaxed text-foreground/90 fade-in">
              {briefText}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your quiet space is calm today. Generate a brief to see what matters now — pulled from
              your recent thoughts.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/app/workspace">
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Open workspace
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/planner">
                <ListChecks className="h-3.5 w-3.5 mr-1.5" /> Planner
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/calendar">
                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Calendar
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Stat label="Thoughts saved" value={thoughts.length.toString()} />
          <Stat label="Open tasks" value="—" hint="Add tasks in Planner" />
          <Stat label="Team activity" value="Quiet" hint="No unread messages" />
        </div>
      </div>

      {/* Recent outputs */}
      <div className="mx-auto max-w-6xl px-4 md:px-10 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Recent outputs</h2>
          <Link
            to="/app/thoughts"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            All thoughts <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        {thoughts.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card p-10 text-center">
            <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Nothing saved yet.</p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/app/workspace">Transform your first thought</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thoughts.map((t) => (
              <Link
                key={t.id}
                to="/app/thoughts"
                className="rounded-md border border-border bg-card paper-lift p-4 block"
              >
                <span className="text-[10px] uppercase tracking-wider chip-sage rounded-full px-2 py-0.5">
                  {t.format || t.type || "note"}
                </span>
                <p className="mt-3 text-sm line-clamp-5 text-foreground/80 whitespace-pre-wrap">
                  {t.output || t.text || t.input}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
