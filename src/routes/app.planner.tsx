import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Trash2, LayoutGrid, List } from "lucide-react";
import { suggestTasks } from "@/lib/ai/transform.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/planner")({
  component: Planner,
});

type Priority = "urgent" | "later" | "someday";
type Task = { id: string; title: string; priority: Priority; deadline?: string; done?: boolean };

const COLUMNS: { id: Priority; label: string }[] = [
  { id: "urgent", label: "Urgent" },
  { id: "later", label: "Later" },
  { id: "someday", label: "Someday" },
];

function Planner() {
  const { user } = useAuth();
  const suggest = useServerFn(suggestTasks);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState<Priority | null>(null);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc")));
        setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) })));
      } catch { setTasks([]); }
    })();
  }, [user]);

  const add = async (priority: Priority, title: string) => {
    if (!user || !title.trim()) return;
    const ref = await addDoc(collection(db, "users", user.uid, "tasks"), {
      title: title.trim(), priority, done: false, createdAt: serverTimestamp(),
    });
    setTasks((p) => [{ id: ref.id, title: title.trim(), priority, done: false }, ...p]);
    setDraft(""); setAdding(null);
  };

  const toggleDone = async (t: Task) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "tasks", t.id), { done: !t.done });
    setTasks((p) => p.map((x) => x.id === t.id ? { ...x, done: !x.done } : x));
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    setTasks((p) => p.filter((x) => x.id !== id));
  };

  const suggestNow = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const thoughts = await getDocs(query(collection(db, "users", user.uid, "thoughts"), orderBy("createdAt", "desc")));
      const recent = thoughts.docs.slice(0, 8).map((d) => {
        const x = d.data() as { output?: string; input?: string; text?: string };
        return x.output || x.text || x.input || "";
      }).filter(Boolean);
      if (recent.length === 0) {
        toast.error("Save some thoughts first so AI has something to work with.");
        setBusy(false);
        return;
      }
      const res = await suggest({ data: { thoughts: recent } });
      for (const t of res.tasks) {
        await add(t.priority, t.title);
      }
      toast.success(`Added ${res.tasks.length} suggested tasks`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not suggest tasks");
    } finally { setBusy(false); }
  };

  const byCol = (p: Priority) => tasks.filter((t) => t.priority === p);

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Planner</h1>
          <p className="text-xs text-muted-foreground mt-1">Move things forward, one calm step at a time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("kanban")} className={`px-2.5 py-1.5 text-xs flex items-center gap-1 ${view === "kanban" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
              <LayoutGrid className="h-3 w-3" /> Kanban
            </button>
            <button onClick={() => setView("list")} className={`px-2.5 py-1.5 text-xs flex items-center gap-1 ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
              <List className="h-3 w-3" /> List
            </button>
          </div>
          <Button onClick={suggestNow} disabled={busy} size="sm" variant="outline" className="border-violet/40 text-violet hover:bg-violet-soft">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> {busy ? "Thinking…" : "AI suggest tasks"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-6 md:py-8">
        {view === "kanban" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {COLUMNS.map((c) => (
              <div key={c.id} className="rounded-md border border-border bg-card paper-lift">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                  <h2 className="text-sm font-medium">{c.label} <span className="text-muted-foreground">· {byCol(c.id).length}</span></h2>
                  <button onClick={() => { setAdding(c.id); setDraft(""); }} className="h-6 w-6 grid place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="p-3 space-y-2 min-h-[180px]">
                  {adding === c.id && (
                    <form onSubmit={(e) => { e.preventDefault(); void add(c.id, draft); }} className="rounded border border-ring bg-card p-2">
                      <input
                        value={draft}
                        autoFocus
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => { if (!draft.trim()) setAdding(null); }}
                        placeholder="New task…"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      />
                    </form>
                  )}
                  {byCol(c.id).map((t) => (
                    <div key={t.id} className="group rounded border border-border/60 p-2.5 hover:border-foreground/30 transition">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" checked={!!t.done} onChange={() => void toggleDone(t)} className="mt-1" />
                        <p className={`text-sm flex-1 ${t.done ? "line-through text-muted-foreground" : "text-foreground/90"}`}>{t.title}</p>
                        <button onClick={() => void remove(t.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {byCol(c.id).length === 0 && adding !== c.id && (
                    <p className="text-xs text-muted-foreground py-2">Nothing here.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card divide-y divide-border/60">
            {tasks.length === 0 && <p className="p-6 text-sm text-muted-foreground">No tasks yet.</p>}
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 group">
                <input type="checkbox" checked={!!t.done} onChange={() => void toggleDone(t)} />
                <p className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${t.priority === "urgent" ? "chip-violet" : "chip-sage"}`}>{t.priority}</span>
                <button onClick={() => void remove(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
