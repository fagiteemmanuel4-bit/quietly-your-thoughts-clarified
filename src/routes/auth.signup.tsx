import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brand, OwlLogo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/OtpInput";
import { useAuth } from "@/lib/auth-context";
import { sendWelcomeEmail } from "@/lib/email/send.functions";
import { requestOtp, verifyOtp } from "@/lib/auth/otp.functions";
import { toast } from "sonner";
import { Loader2, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Quietly" },
      { name: "description", content: "Create your Quietly account." },
    ],
  }),
  component: SignupPage,
});

// ── Confetti celebration dots ────────────────────────────────────────────────
function Confetti() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ["#16a34a","#22c55e","#4ade80","#86efac","#fbbf24","#34d399"][i % 6],
    size: Math.random() * 8 + 5,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 3,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {dots.map(d => (
        <div key={d.id} className="confetti-dot"
          style={{
            left: `${d.left}%`,
            width: d.size, height: d.size,
            background: d.color,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            top: "-10px",
          }} />
      ))}
    </div>
  );
}

// ── Success overlay ──────────────────────────────────────────────────────────
function SuccessOverlay({ name }: { name: string }) {
  return (
    <div className="success-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      <Confetti />
      <div className="success-ring absolute h-64 w-64 rounded-full border-2 border-green-300/40 dark:border-green-700/40" />
      <div className="success-ring-2 absolute h-40 w-40 rounded-full border-2 border-green-400/30 dark:border-green-600/30" />
      <div className="success-icon mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-950 shadow-glow relative z-10">
        <OwlLogo size={52} className="text-foreground celebrate" />
      </div>
      <div className="success-text text-center space-y-2 relative z-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}! 🎉
        </h2>
        <p className="text-muted-foreground text-base">Your quiet space is ready.</p>
      </div>
      <div className="success-sparkles absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="sparkle-dot absolute h-2 w-2 rounded-full"
            style={{
              background: ["#16a34a","#22c55e","#fbbf24","#4ade80"][i % 4],
              top: `${30 + Math.sin((i * Math.PI * 2) / 10) * 25}%`,
              left: `${50 + Math.cos((i * Math.PI * 2) / 10) * 20}%`,
              animationDelay: `${i * 0.07}s`,
            }} />
        ))}
      </div>
      <div className="success-bar absolute bottom-0 left-0 h-1 bg-border w-full">
        <div className="success-bar-fill h-full bg-green-500" />
      </div>
    </div>
  );
}

function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const welcome = useServerFn(sendWelcomeEmail);
  const askOtp  = useServerFn(requestOtp);
  const checkOtp = useServerFn(verifyOtp);
  const nav = useNavigate();

  const [step, setStep]       = useState<"details" | "verify" | "success">("details");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otp, setOtp]         = useState("");
  const [token, setToken]     = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow]         = useState(Date.now());
  const [cooldownUntil, setCooldownUntil] = useState(0);

  useEffect(() => {
    if (step !== "verify") return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [step]);

  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => nav({ to: "/onboarding" }), 2600);
    return () => clearTimeout(t);
  }, [step, nav]);

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const res = await askOtp({ data: { email, purpose: "signup" } });
      setToken(res.token); setExpiresAt(res.expiresAt);
      setCooldownUntil(Date.now() + 60_000);
      setStep("verify");
      toast.success("Verification code sent!");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not send code"); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (Date.now() < cooldownUntil) return;
    setLoading(true);
    try {
      const res = await askOtp({ data: { email, purpose: "signup", previousToken: token } });
      setToken(res.token); setExpiresAt(res.expiresAt);
      setCooldownUntil(Date.now() + 60_000); setOtp("");
      toast.success("New code sent.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not resend"); }
    finally { setLoading(false); }
  };

  const verifyAndCreate = async (code?: string) => {
    const c = (code ?? otp).trim();
    if (c.length !== 6) return;
    setLoading(true);
    try {
      await checkOtp({ data: { email, code: c, token } });
      await signUpEmail(email, password, name);
      welcome({ data: { email, name } }).catch(() => {});
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setOtp(""); setLoading(false);
    }
  };

  const google = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      welcome({ data: { email: "", name: "" } }).catch(() => {});
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const expiresIn   = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  return (
    <>
      {step === "success" && <SuccessOverlay name={name} />}

      {/* Celebration confetti always visible on auth page */}
      <Confetti />

      <div className="relative min-h-screen flex">
        {/* Left panel – green brand side */}
        <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
          style={{ background: "var(--green)" }}>
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <OwlLogo size={32} className="text-white" />
              <span className="font-display font-bold text-white text-xl">Quietly</span>
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <OwlLogo size={36} className="text-white" />
            </div>
            <p className="font-display text-3xl font-bold text-white leading-snug">
              "Think clearly.<br />Move quickly."
            </p>
            <p className="text-green-100 text-sm">— The Quietly promise</p>
            <div className="flex gap-2 flex-wrap pt-2">
              {["AI workspace","Team chat","Smart planner","Secrets vault"].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">{f}</span>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-green-100 text-xs">A Kryonara product</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
          <div className="w-full max-w-sm">
            <Link to="/" className="lg:hidden mb-8 inline-block"><Brand /></Link>

            {/* ── STEP 1: Details ── */}
            {step === "details" && (
              <div className="fade-up space-y-6">
                <div>
                  <h1 className="font-display text-4xl font-bold">Create account 🎉</h1>
                  <p className="text-muted-foreground mt-2 text-sm">Start turning noise into clarity. It's free.</p>
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

                <form onSubmit={submitDetails} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl" required autoComplete="name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email}
                      onChange={e => setEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl" autoComplete="email" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password}
                      onChange={e => setPassword(e.target.value)} className="mt-1.5 h-11 rounded-xl" autoComplete="new-password" />
                    <p className="text-xs text-muted-foreground mt-1.5">At least 8 characters.</p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold"
                    style={{ background: "var(--green)", color: "white" }}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending code…</> : "Continue →"}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up you agree to our{" "}
                  <Link to="/terms" className="underline">Terms</Link> and{" "}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="font-medium hover:underline" style={{ color: "var(--green)" }}>Sign in</Link>
                </p>
              </div>
            )}

            {/* ── STEP 2: Verify OTP ── */}
            {step === "verify" && (
              <div className="verify-fade-in space-y-6">
                <button onClick={() => !loading && setStep("details")}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
                  <ChevronLeft className="h-3 w-3 mr-1" /> Back
                </button>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-soft">
                  <Sparkles className="h-7 w-7" style={{ color: "var(--green)" }} />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold">Check your inbox 📬</h1>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-foreground">{email}</span>.{" "}
                    {expiresIn > 0 && (
                      <>Expires in <span className="tabular-nums font-medium text-foreground">
                        {Math.floor(expiresIn/60)}:{String(expiresIn%60).padStart(2,"0")}
                      </span>.</>
                    )}
                    {expiresIn === 0 && expiresAt > 0 && <span className="text-destructive"> Code expired.</span>}
                  </p>
                </div>
                <OtpInput value={otp} onChange={setOtp} onComplete={verifyAndCreate} disabled={loading} />
                <Button onClick={() => verifyAndCreate()} disabled={loading || otp.length !== 6}
                  className="w-full h-11 rounded-xl font-semibold"
                  style={{ background: "var(--green)", color: "white" }}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying…</> : "Verify & create account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Didn't get it?{" "}
                  <button onClick={resend} disabled={loading || cooldownLeft > 0}
                    className="font-medium disabled:opacity-40 transition-opacity hover:underline"
                    style={{ color: cooldownLeft > 0 ? undefined : "var(--green)" }}>
                    {cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
