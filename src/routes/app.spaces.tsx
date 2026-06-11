import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  query,
  limit,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Plus, LayoutGrid, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/spaces")({ component: Spaces });

type Presence = {
  uid: string;
  name: string;
  photo?: string;
  lastActive: Timestamp | FieldValue;
};

type Space = {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: string;
};

function Spaces() {
  const { user } = useAuth();
  const [presence, setPresence] = useState<Presence[]>([]);
  const [spaces] = useState<Space[]>([
    { id: "1", name: "Strategic Planning", memberCount: 12, lastActivity: "2m ago" },
    { id: "2", name: "Product Roadmap", memberCount: 5, lastActivity: "15m ago" },
    { id: "3", name: "User Research", memberCount: 8, lastActivity: "1h ago" },
  ]);

  useEffect(() => {
    if (!user) return;

    const presenceRef = doc(db, "presence", user.uid);

    // Set user as active
    setDoc(presenceRef, {
      uid: user.uid,
      name: user.displayName || user.email,
      photo: user.photoURL,
      lastActive: serverTimestamp(),
    });

    const q = query(collection(db, "presence"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeUsers = snapshot.docs.map((d) => d.data() as Presence);
      setPresence(activeUsers);
    });

    // Cleanup: remove presence on unmount
    return () => {
      deleteDoc(presenceRef);
      unsubscribe();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 px-4 md:px-10 py-5 flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Shared Spaces</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            Co-create in silence.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex -space-x-2 mr-4">
            {presence.map((p) => (
              <Avatar
                key={p.uid}
                className="h-8 w-8 border-2 border-background ring-2 ring-sage/20"
              >
                <AvatarImage src={p.photo} />
                <AvatarFallback>{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button className="rounded-full shadow-lift">
            <Plus className="h-4 w-4 mr-2" /> New Space
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-10 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="group p-8 rounded-3xl border border-border/60 bg-card hover:bg-subtle/50 transition-all cursor-pointer shadow-soft hover:shadow-lift"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center shadow-sm">
                  <LayoutGrid className="h-6 w-6 text-foreground/70" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-display text-2xl mb-2">{space.name}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="h-3.5 w-3.5" /> {space.memberCount} members
                </span>
                <span>•</span>
                <span>{space.lastActivity}</span>
              </div>
              <div className="mt-8 flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background bg-subtle"
                  />
                ))}
                <div className="h-7 w-7 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[9px] font-bold">
                  +{space.memberCount - 4}
                </div>
              </div>
            </div>
          ))}

          <div className="p-8 rounded-3xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center gap-4 hover:border-foreground/20 transition-colors cursor-pointer min-h-[240px]">
            <div className="h-12 w-12 rounded-full bg-subtle flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium">Create a new canvas</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Start a private or team workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
