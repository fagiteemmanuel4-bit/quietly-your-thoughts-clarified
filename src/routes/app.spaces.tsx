import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  limit,
  Timestamp,
  FieldValue,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  Users as UsersIcon,
  MessageSquare,
  Settings,
  Share2,
  Calendar,
  ListChecks,
  Shield,
  Paperclip,
  Mic,
  Smile,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  BarChart2,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/spaces")({ component: AdvancedSpaces });

type Presence = {
  uid: string;
  name: string;
  photo?: string;
  lastActive: Timestamp | FieldValue;
};

function AdvancedSpaces() {
  const { user } = useAuth();
  const [presence, setPresence] = useState<Presence[]>([]);
  const [activeSpace, setActiveSpace] = useState<string>("1");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const spaces = [
    { id: "1", name: "Strategic Planning", visibility: "Private", role: "Owner" },
    { id: "2", name: "Neural Engine v2", visibility: "Secret", role: "Admin" },
    { id: "3", name: "Design System", visibility: "Public", role: "Member" },
  ];

  useEffect(() => {
    if (!user) return;

    // Presence Listener
    const presQ = query(collection(db, "presence"), limit(20));
    const unsubPres = onSnapshot(presQ, (snap) => {
      setPresence(snap.docs.map((d) => d.data() as Presence));
    });

    // Chat Message Listener
    const msgQ = query(
        collection(db, "spaces", activeSpace, "messages"),
        orderBy("createdAt", "asc"),
        limit(50)
    );
    const unsubMsg = onSnapshot(msgQ, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
        unsubPres();
        unsubMsg();
    };
  }, [user, activeSpace]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    await addDoc(collection(db, "spaces", activeSpace, "messages"), {
        text: input,
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div className="h-screen bg-[#0D0D12] flex overflow-hidden">
      {/* Space Navigator */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0D0D12]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Shared Spaces</h2>
          <button className="text-white/20 hover:text-white transition-colors"><Plus className="h-4 w-4" /></button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {spaces.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSpace(s.id)}
                className={`w-full flex flex-col items-start gap-1 p-4 rounded-2xl transition-all ${activeSpace === s.id ? "bg-[#1A1A24] border border-white/10" : "hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-bold ${activeSpace === s.id ? "text-white" : "text-white/40"}`}>{s.name}</span>
                  {s.visibility === "Secret" && <Lock className="h-2.5 w-2.5 text-[#7B5EA7]" />}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/20">{s.role}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-6 border-t border-white/5">
            <div className="flex -space-x-2">
                {presence.map(p => (
                    <Avatar key={p.uid} className="h-6 w-6 border-2 border-[#0D0D12]">
                        <AvatarImage src={p.photo} />
                        <AvatarFallback className="text-[8px] bg-[#1A1A24]">{p.name[0]}</AvatarFallback>
                    </Avatar>
                ))}
                <div className="h-6 w-6 rounded-full bg-[#1A1A24] border-2 border-[#0D0D12] flex items-center justify-center text-[8px] text-white/40 font-bold">+5</div>
            </div>
        </div>
      </aside>

      {/* Space Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0D0D12]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#1A1A24] flex items-center justify-center border border-white/5">
                <LayoutGrid className="h-5 w-5 text-[#4ECDC4]" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-display font-bold">Strategic Planning</h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-widest border border-emerald-500/20">Active</span>
                </div>
                <p className="text-xs text-white/30 mt-0.5">Core vision and execution roadmap for Q3.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Settings className="h-4 w-4" /></Button>
            <Button className="rounded-full bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 h-10 px-6 font-bold text-xs uppercase tracking-widest">Invite Team</Button>
          </div>
        </header>

        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <div className="px-8 border-b border-white/5">
            <TabsList className="bg-transparent h-14 p-0 gap-8 justify-start">
              <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none h-14 text-[10px] uppercase tracking-widest font-bold transition-all">
                <MessageSquare className="h-3.5 w-3.5 mr-2" /> Discussions
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none h-14 text-[10px] uppercase tracking-widest font-bold transition-all">
                <ListChecks className="h-3.5 w-3.5 mr-2" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none h-14 text-[10px] uppercase tracking-widest font-bold transition-all">
                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Wiki
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none h-14 text-[10px] uppercase tracking-widest font-bold transition-all">
                <BarChart2 className="h-3.5 w-3.5 mr-2" /> Synthesis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 relative m-0">
             <ScrollArea className="flex-1 px-8 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center py-10 opacity-20">
                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Beginning of Strategic Planning session</span>
                    </div>
                    {/* Real-time Messages */}
                    {messages.map((m) => (
                        <div key={m.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <Avatar className="h-9 w-9 rounded-xl border border-white/10">
                                <AvatarFallback className="bg-white/5 text-[10px] font-bold">
                                    {m.userName?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{m.userName || "Thinker"}</span>
                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">
                                        {m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#1A1A24]/40 border border-white/5 text-sm leading-relaxed max-w-xl">
                                    {m.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4 group">
                        <Avatar className="h-9 w-9 rounded-xl border border-white/10">
                            <AvatarFallback className="bg-white/5 text-[10px] font-bold">AL</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">Alex Rivera</span>
                                <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">10:42 AM</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#1A1A24]/40 border border-white/5 text-sm leading-relaxed max-w-xl">
                                I've uploaded the Q3 synthesis. We should focus on the Neural Engine scalability first.
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] hover:bg-white/10 transition-colors">👍 2</button>
                                <button className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] hover:bg-white/10 transition-colors">🔥 1</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0 border border-white/10">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#7B5EA7]">Quietly AI</span>
                                <span className="text-[9px] text-[#7B5EA7]/40 uppercase font-bold tracking-widest">System</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#7B5EA7]/10 border border-[#7B5EA7]/20 text-sm leading-relaxed max-w-xl text-white/80 italic">
                                Based on the discussion, I recommend creating three subtasks for the infra team. Should I proceed?
                            </div>
                        </div>
                    </div>
                </div>
             </ScrollArea>

             {/* Message Input */}
             <div className="p-8 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12] to-transparent">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[#1A1A24] rounded-2xl border border-white/5 p-2 px-4 shadow-2xl">
                    <button className="text-white/20 hover:text-white transition-colors"><Plus className="h-4 w-4" /></button>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Discuss or @mention..."
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm"
                    />
                    <div className="flex items-center gap-2">
                        <button className="text-white/20 hover:text-white transition-colors"><Mic className="h-4 w-4" /></button>
                        <button className="text-white/20 hover:text-white transition-colors"><Smile className="h-4 w-4" /></button>
                        <Button onClick={sendMessage} size="icon" className="h-8 w-8 rounded-xl bg-[#7B5EA7] hover:bg-[#7B5EA7]/80">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 p-8 m-0 overflow-x-auto">
             <div className="flex gap-6 h-full min-w-[1000px]">
                <TaskColumn label="To Do" count={4} />
                <TaskColumn label="In Progress" count={2} />
                <TaskColumn label="In Review" count={1} />
                <TaskColumn label="Completed" count={12} />
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Space Sidebar (Right) */}
      <aside className="w-80 border-l border-white/5 hidden xl:flex flex-col bg-[#0D0D12]">
         <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-6">Space Intelligence</h3>
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#7B5EA7]/20 to-[#4ECDC4]/20 border border-white/10 shadow-xl relative overflow-hidden group">
                <Sparkles className="absolute top-[-10px] right-[-10px] h-16 w-16 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                <h4 className="text-sm font-bold mb-2">Weekly Synthesis</h4>
                <p className="text-xs text-white/50 leading-relaxed mb-4">You resolved 12 tasks this week. Productivity is up 15%.</p>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#4ECDC4] hover:text-white transition-colors">
                    View Report <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>
         </div>

         <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-4">Pinned Items</h3>
                <div className="space-y-2">
                    <PinnedItem icon={<Calendar className="h-3.5 w-3.5" />} label="Q3 Strategy Meeting" date="Tomorrow, 2:00 PM" />
                    <PinnedItem icon={<ListChecks className="h-3.5 w-3.5" />} label="Finalize Brand Assets" date="Friday, Oct 12" />
                </div>
            </div>

            <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-4">Member Status</h3>
                <div className="space-y-4">
                    {presence.slice(0, 5).map(p => (
                        <div key={p.uid} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-8 w-8 rounded-xl border border-white/10">
                                        <AvatarImage src={p.photo} />
                                        <AvatarFallback className="bg-white/5 text-[10px] font-bold">{p.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-[-2px] right-[-2px] h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#0D0D12]" />
                                </div>
                                <span className="text-xs font-medium text-white/80">{p.name}</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/20">Online</span>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </aside>
    </div>
  );
}

function TaskColumn({ label, count }: any) {
    return (
        <div className="w-72 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">{label}</span>
                    <span className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/30">{count}</span>
                </div>
                <button className="text-white/20 hover:text-white"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3">
                <TaskCard title="Neural v2 Schema Design" priority="Urgent" />
                <TaskCard title="Resend API Integration" priority="Later" />
                {label === "To Do" && <TaskCard title="Finalize Pricing Model" priority="Someday" />}
            </div>
        </div>
    );
}

function TaskCard({ title, priority }: any) {
    return (
        <div className="p-5 rounded-2xl bg-[#1A1A24]/40 border border-white/5 hover:border-[#7B5EA7]/20 transition-all cursor-pointer group shadow-xl">
            <h4 className="text-xs font-bold mb-3 group-hover:text-white transition-colors">{title}</h4>
            <div className="flex items-center justify-between">
                <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
                    priority === "Urgent" ? "border-red-500/20 text-red-500 bg-red-500/10" : "border-white/10 text-white/30"
                }`}>
                    {priority}
                </span>
                <div className="flex -space-x-1">
                    <div className="h-5 w-5 rounded-full border border-[#1A1A24] bg-white/5" />
                    <div className="h-5 w-5 rounded-full border border-[#1A1A24] bg-white/5" />
                </div>
            </div>
        </div>
    );
}

function PinnedItem({ icon, label, date }: any) {
    return (
        <div className="p-4 rounded-2xl bg-[#1A1A24]/40 border border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">{icon}</div>
            <div className="min-w-0">
                <h4 className="text-[11px] font-bold truncate">{label}</h4>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">{date}</p>
            </div>
        </div>
    );
}
