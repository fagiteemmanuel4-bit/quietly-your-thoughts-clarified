import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brand, OwlLogo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Quietly" },
      { name: "description", content: "Sign in to Quietly." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signInEmail, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await signInEmail(email, password); nav({ to: "/app" }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  };

  const google = async () => {
    setGoogleLoading(true);
    try { await signInGoogle(); nav({ to: "/app" }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Google sign-in failed"); }
    finally { setGoogleLoading(false); }
  };

  const forgot = async () => {
    if (!email) return toast.error("Enter your email above first.");
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/auth/login` });
      toast.success("Password reset link sent — check your inbox.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not send reset email"); }
    finally { setForgotLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Left green panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: "var(--green)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />
        <div className="relative z-10 flex items-center gap-2">
          <OwlLogo size={32} className="text-white" />
          <span className="font-display font-bold text-white text-xl">Quietly</span>
        </div>
        <div className="relative z-10 space-y-5">
          <div className="h-20 w-20 rounded-2xl bg-white/15 flex items-center justify-center">
            <OwlLogo size={44} className="text-white" />
          </div>
          <blockquote className="font-display text-2xl font-bold text-white leading-snug">
            "I open Quietly the moment<br />my head feels full."
          </blockquote>
          <p className="text-green-100 text-sm">— Maya, product designer</p>
          {[
            { label: "Thoughts saved", val: "12,400+" },
            { label: "Users", val: "1,200+" },
            { label: "AI transforms", val: "48,000+" },
          ].map(s => (
            <div key={s.label} className="flex justify-between border-t border-white/20 pt-3">
              <span className="text-green-100 text-xs">{s.label}</span>
              <span className="text-white font-bold text-sm">{s.val}</span>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-green-100 text-xs">A Kryonara product</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm fade-up space-y-6">
          <Link to="/" className="lg:hidden inline-block mb-4"><Brand /></Link>

          <div>
            <h1 className="font-display text-4xl font-bold">Welcome back 👋</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to continue thinking quietly.</p>
          </div>

          <Button onClick={google} variant="outline" disabled={googleLoading}
            className="w-full h-11 rounded-xl font-medium">
            {googleLoading
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl" autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={forgot} disabled={forgotLoading}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
                  {forgotLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Forgot?
                </button>
              </div>
              <Input id="password" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} className="h-11 rounded-xl" autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold"
              style={{ background: "var(--green)", color: "white" }}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> : "Sign in →"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            New here?{" "}
            <Link to="/auth/signup" className="font-semibold hover:underline" style={{ color: "var(--green)" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
