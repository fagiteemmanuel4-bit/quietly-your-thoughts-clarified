import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users, Circle } from "lucide-react";

export const Route = createFileRoute("/app/team")({ component: Team });

type Message = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: Timestamp;
};

function Team() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "team_messages"), orderBy("createdAt", "asc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "team_messages"), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5 flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Team Chat</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Circle className="h-2 w-2 fill-sage text-sage" /> 4 online
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full">
          <Users className="h-3.5 w-3.5 mr-2" /> Team Settings
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.userId === user?.uid;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.userPhoto} />
                <AvatarFallback>{msg.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {msg.userName}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {msg.createdAt
                      ?.toDate()
                      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-md ${
                    isMe
                      ? "bg-foreground text-background rounded-tr-none"
                      : "bg-subtle border border-border/40 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 md:p-10 border-t border-border/60 bg-background/50 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Drop a thought into the stream..."
            className="rounded-full h-12 pl-6 pr-14 bg-card border-border/60 shadow-soft"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
