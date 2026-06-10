import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { Search, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/thoughts")({
  component: ThoughtsArchive,
});

type Thought = {
  id: string;
  input?: string;
  output?: string;
  text?: string;
  format?: string;
  type?: string;
  createdAt?: { toDate?: () => Date };
};

const TYPES = [
  "all",
  "notes",
  "summary",
  "todo",
  "message",
  "email",
  "report",
  "action_plan",
  "capture",
] as const;

function ThoughtsArchive() {
  const { user } = useAuth();
  const [items, setItems] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("all");
  const [active, setActive] = useState<Thought | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "users", user.uid, "thoughts"), orderBy("createdAt", "desc")),
        );
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Thought, "id">) })));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const visible = useMemo(() => {
    return items.filter((it) => {
      if (filter !== "all") {
        const k = it.format || it.type || "";
        if (k !== filter) return false;
      }
      if (q) {
        const hay = `${it.input ?? ""} ${it.output ?? ""} ${it.text ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, filter]);

  const remove = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "thoughts", id));
    setItems((p) => p.filter((x) => x.id !== id));
    setActive(null);
    toast.success("Deleted");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <h1 className="font-display text-3xl md:text-4xl">Thoughts</h1>
        <p className="text-xs text-muted-foreground mt-1">Every saved output, searchable.</p>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search thoughts…"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-card outline-none focus:border-ring text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs rounded-full px-3 py-1.5 transition ${
                  filter === t
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "action_plan" ? "action plan" : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
            Nothing here yet. Transform a thought in the Workspace to start.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
            {visible.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="block w-full text-left break-inside-avoid rounded-md border border-border bg-card paper-lift p-4 hover:border-foreground/30 transition"
              >
                <span className="text-[10px] uppercase tracking-wider chip-sage rounded-full px-2 py-0.5">
                  {t.format || t.type || "note"}
                </span>
                <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/80 line-clamp-12">
                  {t.output || t.text || t.input}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 fade-in"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card rounded-md border border-border scale-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider chip-violet rounded-full px-2 py-0.5">
                {active.format || active.type || "note"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      active.output || active.text || active.input || "",
                    );
                    toast.success("Copied");
                  }}
                  className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void remove(active.id)}
                  className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActive(null)}
                  className="text-muted-foreground hover:text-foreground ml-2 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-5">
              {active.input && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Input
                  </p>
                  <pre className="whitespace-pre-wrap text-sm text-foreground/70 mb-5 font-sans">
                    {active.input}
                  </pre>
                </>
              )}
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Output
              </p>
              <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95 font-sans">
                {active.output || active.text}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
