import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/calendar")({ component: CalendarPage });

type EventDoc = { id: string; title: string; date: string; time?: string; description?: string };

function CalendarPage() {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "users", user.uid, "events"), orderBy("date", "asc")));
        setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) })));
      } catch { setEvents([]); }
    })();
  }, [user]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const eventsFor = (d: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === iso);
  };

  const create = async () => {
    if (!user || !open || !title.trim()) return;
    const ref = await addDoc(collection(db, "users", user.uid, "events"), {
      title: title.trim(), date: open, time: time || null, createdAt: serverTimestamp(),
    });
    setEvents((p) => [...p, { id: ref.id, title: title.trim(), date: open, time }]);
    setTitle(""); setTime(""); setOpen(null);
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "events", id));
    setEvents((p) => p.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Calendar</h1>
          <p className="text-xs text-muted-foreground mt-1">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor(new Date())} className="text-xs px-2 py-1 rounded-md hover:bg-accent text-muted-foreground">Today</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-6 md:py-8">
        <div className="grid grid-cols-7 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="aspect-square md:aspect-[5/4]" />;
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const todays = eventsFor(d);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            return (
              <button key={i} onClick={() => { setOpen(iso); setTitle(""); setTime(""); }} className={`aspect-square md:aspect-[5/4] rounded-md border bg-card paper-lift p-1.5 md:p-2 text-left flex flex-col gap-1 ${isToday ? "border-foreground" : "border-border"}`}>
                <span className={`text-xs ${isToday ? "font-bold" : "text-muted-foreground"}`}>{d}</span>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {todays.slice(0, 2).map((e) => (
                    <div key={e.id} className="text-[10px] truncate chip-sage rounded px-1 py-0.5">{e.time ? `${e.time} ` : ""}{e.title}</div>
                  ))}
                  {todays.length > 2 && <div className="text-[10px] text-muted-foreground">+{todays.length - 2} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={() => setOpen(null)}>
          <div className="w-full max-w-md bg-card rounded-md border border-border p-5 scale-fade-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{new Date(open).toDateString()}</p>
            <h3 className="font-display text-xl mb-4">Events</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {eventsFor(parseInt(open.split("-")[2], 10)).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs w-10">{e.time || "—"}</span>
                  <span className="flex-1">{e.title}</span>
                  <button onClick={() => void remove(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full px-3 py-2 rounded-md border border-border bg-transparent text-sm outline-none focus:border-ring" />
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time (e.g. 14:30)" className="w-full px-3 py-2 rounded-md border border-border bg-transparent text-sm outline-none focus:border-ring" />
              <div className="flex gap-2 pt-2">
                <Button onClick={create} disabled={!title.trim()} className="flex-1"><Plus className="h-4 w-4 mr-1.5" /> Add event</Button>
                <Button variant="ghost" onClick={() => setOpen(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
