import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection, deleteDoc, doc, onSnapshot, orderBy, query,
  type Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

type Item = {
  id: string;
  input: string;
  output: string;
  format: string;
  createdAt?: Timestamp;
};

function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "history"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Item[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, "id">) }));
      setItems(list);
      if (!selected && list.length) setSelected(list[0]);
    }, () => toast.error("Could not load history. Check Firestore rules."));
    return unsub;
  }, [user, selected]);

  const remove = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "history", id));
    if (selected?.id === id) setSelected(null);
    toast.success("Deleted");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-6 md:px-10 py-4">
        <h1 className="font-display text-2xl">History</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Everything you've saved.</p>
      </div>
      <div className="grid md:grid-cols-[320px_1fr] min-h-[calc(100vh-65px)]">
        <aside className="border-r border-border/60 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nothing saved yet. Transform something and hit Save.
            </div>
          ) : (
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => setSelected(it)}
                    className={`w-full text-left px-5 py-4 border-b border-border/60 transition ${
                      selected?.id === it.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.format}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {it.createdAt?.toDate ? it.createdAt.toDate().toLocaleDateString() : "just now"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2 text-foreground/80">{it.input}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <section className="p-6 md:p-10">
          {selected ? (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{selected.format}</span>
                  <h2 className="font-display text-2xl mt-1">Saved transformation</h2>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(selected.output); toast.success("Copied"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(selected.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-5 bg-subtle/40 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Input</div>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{selected.input}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-5 bg-card">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Output</div>
                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground/90">{selected.output}</pre>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select an item.</p>
          )}
        </section>
      </div>
    </div>
  );
}
