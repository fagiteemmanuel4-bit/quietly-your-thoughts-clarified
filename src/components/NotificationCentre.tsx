import { useState, useEffect } from "react";
import { Bell, MessageSquare, ListChecks, Target, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@tanstack/react-router";

export function NotificationCentre() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="h-4 w-4 text-[#4ECDC4]" />;
      case "task": return <ListChecks className="h-4 w-4 text-[#7B5EA7]" />;
      case "review": return <Target className="h-4 w-4 text-orange-400" />;
      default: return <Sparkles className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#7B5EA7] border-2 border-[#0D0D12]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 bg-[#1A1A24] border-white/5 rounded-[24px] shadow-2xl backdrop-blur-xl" align="end">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-[#7B5EA7] bg-[#7B5EA7]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-20">
              <Bell className="h-10 w-10 mb-4" />
              <p className="text-sm font-medium">All quiet in the workspace.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 hover:bg-white/[0.02] transition-colors relative ${!n.read ? "bg-[#7B5EA7]/5" : ""}`} onClick={() => markRead(n.id)}>
                  <div className="flex gap-4">
                    <div className="mt-1 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white/80">{n.title}</h4>
                        <span className="text-[9px] text-white/20 uppercase font-bold tracking-wider">
                          {n.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">{n.message}</p>
                      {n.link && (
                        <Link to={n.link as any} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7B5EA7] mt-2 hover:text-white transition-colors">
                          View details <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-white/5 text-center">
            <button className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">Clear all notifications</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
