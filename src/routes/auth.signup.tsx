import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/email/send.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Sign up — Quietly" }, { name: "description", content: "Create your Quietly account." }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const welcome = useServerFn(sendWelcomeEmail);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signUpEmail(email, password, name);
      welcome({ data: { email, name } }).catch(() => {/* non-blocking */});
      nav({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally { setLoading(false); }
  };

  const google = async () => {
    try { await signInGoogle(); nav({ to: "/app" }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Google sign-in failed"); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-subtle">
        <Link to="/"><Brand size="md" /></Link>
        <div>
          <p className="font-display text-3xl leading-snug">
            "Cleaner thinking in two clicks. It's the calmest tool on my dock."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">— Theo, founder</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block"><Brand size="md" /></Link>
          <h1 className="font-display text-4xl">Create your account.</h1>
          <p className="text-muted-foreground mt-2 text-sm">Start turning noise into clarity. It's free.</p>
          <Button onClick={google} variant="outline" className="w-full mt-8 rounded-full h-11">
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1.5">At least 6 characters.</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="underline">Terms</Link> and{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account? <Link to="/auth/login" className="text-foreground hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
