import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [{ title: "Log in — Quietly" }, { name: "description", content: "Log in to Quietly." }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signInEmail, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInEmail(email, password);
      nav({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      await signInGoogle();
      nav({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-subtle">
        <Link to="/">
          <Brand size="md" />
        </Link>
        <div>
          <p className="font-display text-3xl leading-snug">
            "I open Quietly the moment my head feels full. Five seconds later, it's clear."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">— Maya, product designer</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block">
            <Brand size="md" />
          </Link>
          <h1 className="font-display text-4xl">Welcome back.</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to continue thinking quietly.
          </p>
          <Button onClick={google} variant="outline" className="w-full mt-8 rounded-full h-11">
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            New here?{" "}
            <Link to="/auth/signup" className="text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
