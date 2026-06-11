import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/invite/accept")({
  validateSearch: searchSchema,
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const { token } = useSearch({ from: "/invite/accept" });
  const { user, signUpEmail, signInEmail } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-3xl mb-3">Invalid invite link</h1>
          <p className="text-muted-foreground text-sm mb-6">This invite link is missing or has expired.</p>
          <Link to="/"><Button>Go home</Button></Link>
        </div>
      </div>
    );
  }

  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
      setDone(true);
      setTimeout(() => nav({ to: "/app" }), 1800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete sign in");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 fade-up">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-sage-soft flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-sage" />
          </div>
          <h1 className="font-display text-3xl">You're in!</h1>
          <p className="text-muted-foreground text-sm">Taking you to your workspace…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 fade-up">
        <div className="text-center space-y-4 max-w-sm">
          <Brand size="md" />
          <h1 className="font-display text-3xl">You've been invited!</h1>
          <p className="text-muted-foreground text-sm">You're already signed in as <strong>{user.email}</strong>. Click below to accept.</p>
          <Button className="w-full rounded-full h-11" onClick={() => { setDone(true); setTimeout(() => nav({ to: "/app" }), 1800); }}>
            Accept & open Quietly
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-subtle">
        <Link to="/"><Brand size="md" /></Link>
        <div>
          <p className="font-display text-3xl leading-snug">"Your thinking, finally quiet."</p>
          <p className="mt-3 text-sm text-muted-foreground">— the Quietly team</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block"><Brand size="md" /></Link>
          <h1 className="font-display text-4xl">You've been invited.</h1>
          <p className="text-muted-foreground mt-2 text-sm">Create an account or sign in to join your team on Quietly.</p>
          <div className="flex gap-2 mt-6 mb-6">
            {(["signup", "login"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-full text-sm border transition ${mode === m ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>
          <form onSubmit={accept} className="space-y-4">
            {mode === "signup" && (
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required className="mt-1.5" /></div>
            )}
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1.5" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1.5" /></div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Please wait…</> : "Accept invite & continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
