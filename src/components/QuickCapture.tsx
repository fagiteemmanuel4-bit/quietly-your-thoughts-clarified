import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export function QuickCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50);
    if (!open) setText("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, text]);

  const save = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "thoughts"), {
        text: text.trim(),
        type: "capture",
        createdAt: serverTimestamp(),
      });
      toast.success("Saved");
      onClose();
    } catch {
      toast.error("Could not save. Check Firestore rules.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm p-4 pt-[15vh] fade-in" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-lg border border-border bg-card shadow-lift scale-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Quick capture</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Drop a thought before it slips away…"
          className="w-full bg-transparent outline-none px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/60 resize-none"
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground">⌘+Enter to save · Esc to cancel</span>
          <Button onClick={save} disabled={!text.trim() || saving} size="sm">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving…" : "Save thought"}
          </Button>
        </div>
      </div>
    </div>
  );
}
