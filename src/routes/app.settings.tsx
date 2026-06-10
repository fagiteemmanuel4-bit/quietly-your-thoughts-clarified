import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { sendInviteEmail } from "@/lib/email/send.functions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Mail,
  UserPlus,
  CreditCard,
  User,
  Cpu,
  Sparkles,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Diamond,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const { user, updateName, deleteAccount, logout } = useAuth();
  const invite = useServerFn(sendInviteEmail);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-3.5-sonnet");
  const [isPaidUser] = useState(true); // Simulation for UI demo

  useEffect(() => {
    if (user?.displayName) setNewName(user.displayName);
  }, [user]);

  const handleUpdateName = async () => {
    if (!newName || newName === user?.displayName) return;
    if (newName.length > 50) {
      toast.error("Name too long (max 50 characters)");
      return;
    }
    setIsUpdatingName(true);
    try {
      await updateName(newName);
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSuspend = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        status: "suspended",
        suspendedAt: new Date().toISOString(),
      });
      toast.success("Account suspended. Logging out...");
      setTimeout(logout, 2000);
    } catch (e) {
      toast.error("Failed to suspend account");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted");
    } catch (e) {
      toast.error("Critical: Use recent login to delete account");
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setBusy(true);
    try {
      await invite({
        data: {
          email: inviteEmail,
          inviterName: user?.displayName || undefined,
          workspaceName: "your Quietly team",
        },
      });
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send invite");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-5xl mx-auto px-4 md:px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl md:text-5xl tracking-tight">System</h1>
              {isPaidUser && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                  <Diamond className="h-3 w-3 fill-accent" /> Premium
                </div>
              )}
            </div>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-[11px] font-medium">
              Manage your environment and core agent.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-12 p-0 gap-8 mb-8">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 h-12 text-sm font-medium transition-none"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="agent"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 h-12 text-sm font-medium transition-none"
            >
              Agent Configuration
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 h-12 text-sm font-medium transition-none"
            >
              AI Models
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 h-12 text-sm font-medium transition-none"
            >
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="profile"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="font-display text-xl mb-2">Personal Identity</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  How you are perceived within the workspace and by your AI agents.
                </p>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Your name"
                      className="max-w-md h-11 rounded-xl bg-card border-border/60"
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={isUpdatingName || newName === user?.displayName}
                      className="h-11 px-6 rounded-xl shadow-lift"
                    >
                      {isUpdatingName ? "Saving..." : "Update"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Email Address
                  </label>
                  <p className="text-sm font-medium px-4 py-3 bg-subtle/30 border border-border/40 rounded-xl max-w-md text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/40 my-8" />

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="font-display text-xl mb-2 text-destructive/80">Danger Zone</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Irreversible actions concerning your presence and data.
                </p>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-xl border-orange-200/50 hover:bg-orange-50 text-orange-600 h-11"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" /> Suspend Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-border/60 shadow-lift">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-2xl">
                        Pause your journey?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        Suspending your account will hide your profile from teammates and pause all
                        active agents. You can return at any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSuspend}
                        className="rounded-full bg-orange-600 hover:bg-orange-700"
                      >
                        Confirm Suspension
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-xl border-red-200/50 hover:bg-red-50 text-red-600 h-11"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-border/60 shadow-lift">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-2xl">
                        Eternal silence?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        This will permanently delete your account and all associated data. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-full bg-red-600 hover:bg-red-700"
                      >
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="agent"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="font-display text-xl mb-2">The Silent Partner</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configure how your primary agent observes and interacts with your thoughts.
                </p>
              </div>
              <div className="md:col-span-2 space-y-8">
                <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-violet/10 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-violet" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Agent Awareness</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Level of proactive intervention
                        </p>
                      </div>
                    </div>
                    <div className="flex bg-subtle p-1 rounded-full">
                      {["Quiet", "Balanced", "Active"].map((level) => (
                        <button
                          key={level}
                          className={`px-4 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                            level === "Balanced" ? "bg-white shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/40">
                      <span className="text-sm">Real-time Task Extraction</span>
                      <div className="h-6 w-11 rounded-full bg-sage relative cursor-pointer">
                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/40">
                      <span className="text-sm">Semantic Connection (Graph)</span>
                      <div className="h-6 w-11 rounded-full bg-border relative cursor-pointer">
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="models"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="font-display text-xl mb-2">Neural Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select the underlying intelligence for your workspace. Powered by OpenRouter.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      id: "gpt-4o-mini",
                      name: "GPT-4o Mini",
                      provider: "OpenAI",
                      type: "free",
                      speed: "Instant",
                    },
                    {
                      id: "claude-3-haiku",
                      name: "Claude 3 Haiku",
                      provider: "Anthropic",
                      type: "free",
                      speed: "Instant",
                    },
                    {
                      id: "claude-3.5-sonnet",
                      name: "Claude 3.5 Sonnet",
                      provider: "Anthropic",
                      type: "paid",
                      speed: "Balanced",
                    },
                    {
                      id: "gpt-4o",
                      name: "GPT-4o",
                      provider: "OpenAI",
                      type: "paid",
                      speed: "Balanced",
                    },
                    {
                      id: "llama-3.1-405b",
                      name: "Llama 3.1 405B",
                      provider: "Meta",
                      type: "paid",
                      speed: "Measured",
                    },
                  ].map((model) => (
                    <div
                      key={model.id}
                      onClick={() =>
                        (model.type === "free" || isPaidUser) && setSelectedModel(model.id)
                      }
                      className={`group p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        selectedModel === model.id
                          ? "border-foreground bg-card shadow-lift"
                          : "border-border/40 bg-card/40 hover:border-border"
                      } ${model.type === "paid" && !isPaidUser ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    >
                      {selectedModel === model.id && (
                        <div className="absolute top-4 right-4 h-5 w-5 bg-foreground text-background rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          {model.provider}
                        </span>
                        {model.type === "paid" && (
                          <Diamond className="h-3 w-3 text-accent fill-accent/20" />
                        )}
                      </div>

                      <h4 className="font-display text-lg mb-1">{model.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                        <Zap className="h-3 w-3" /> {model.speed}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-3xl bg-accent/5 border border-accent/20">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-accent-foreground">
                        Custom Model Endpoint
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Bring your own keys or connect to a local LLM via tunneling.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://api.your-model.com/v1"
                          className="h-10 rounded-xl bg-white/50 border-accent/20"
                        />
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-accent/20 text-accent"
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="billing"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="font-display text-xl mb-2">Sponsorship</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Support the calm, focused future of work.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="p-8 rounded-[40px] bg-gradient-to-br from-card to-subtle border border-border/60 shadow-lift relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Diamond className="h-24 w-24 text-accent/5 -rotate-12" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
                        Active Plan
                      </span>
                    </div>

                    <h3 className="font-display text-4xl mb-4">Deep Thinker</h3>
                    <div className="text-3xl font-display mb-8">
                      $24{" "}
                      <span className="text-sm font-sans text-muted-foreground font-normal">
                        / month
                      </span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {[
                        "Unlimited AI Transformations",
                        "High-Intelligence Models (Claude 3.5, GPT-4o)",
                        "Infinite Workspace History",
                        "Priority Agent Awareness",
                        "Custom Model Endpoints",
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Check className="h-3 w-3" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full h-14 rounded-2xl bg-foreground text-background text-lg font-medium hover:opacity-90 transition-opacity">
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-24 pt-12 border-t border-border/40 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold">
            Quietly — Built for the focused mind.
          </p>
        </div>
      </div>
    </div>
  );
}
