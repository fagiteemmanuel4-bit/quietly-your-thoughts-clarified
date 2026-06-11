import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brand } from "@/components/Brand";
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

// ─── Success overlay shown after OTP passes ───────────────────────────────────
function SuccessOverlay({ name }: { name: string }) {
  return (
    <div className="success-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      {/* Expanding ring */}
      <div className="success-ring absolute h-64 w-64 rounded-full border border-foreground/10" />
      <div className="success-ring-2 absolute h-40 w-40 rounded-full border border-foreground/20" />

      {/* Icon */}
      <div className="success-icon mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage-soft">
        <CheckCircle2 className="h-10 w-10 text-sage" />
      </div>

      {/* Text */}
      <div className="success-text text-center space-y-2">
        <h2 className="font-display text-3xl md:text-4xl">
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}.
        </h2>
        <p className="text-muted-foreground text-sm">Your quiet space is ready.</p>
      </div>

      {/* Sparkle dots */}
      <div className="success-sparkles absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="sparkle-dot absolute h-1.5 w-1.5 rounded-full bg-violet"
            style={{
              top: `${20 + Math.sin((i * Math.PI * 2) / 8) * 30}%`,
              left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 20}%`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Loading bar at bottom */}
      <div className="success-bar absolute bottom-0 left-0 h-0.5 bg-foreground/20 w-full">
        <div className="success-bar-fill h-full bg-foreground" />
      </div>
    </div>
  );
}

function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const welcome = useServerFn(sendWelcomeEmail);
  const askOtp = useServerFn(requestOtp);
  const checkOtp = useServerFn(verifyOtp);
  const nav = useNavigate();

  const [step, setStep] = useState<"details" | "verify" | "success">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [cooldownUntil, setCooldownUntil] = useState(0);

  // Tick the clock while on verify step
  useEffect(() => {
    if (step !== "verify") return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [step]);

  // After success overlay plays (~2.4s), redirect to onboarding
  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => nav({ to: "/onboarding" }), 2400);
    return () => clearTimeout(t);
  }, [step, nav]);

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return toast.error("Use at least one uppercase letter and one number.");
    setLoading(true);
    try {
      const res = await askOtp({ data: { email, purpose: "signup" } });
      setToken(res.token);
      setExpiresAt(res.expiresAt);
      setCooldownUntil(Date.now() + 60_000);
      setStep("verify");
      toast.success("Verification code sent to your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (Date.now() < cooldownUntil) return;
    setLoading(true);
    try {
      const res = await askOtp({ data: { email, purpose: "signup", previousToken: token } });
      setToken(res.token);
      setExpiresAt(res.expiresAt);
      setCooldownUntil(Date.now() + 60_000);
      setOtp("");
      toast.success("New code sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndCreate = async (code?: string) => {
    const c = (code ?? otp).trim();
    if (c.length !== 6) return;
    setLoading(true);
    try {
      // 1. Verify OTP first
      await checkOtp({ data: { email, code: c, token } });

      // 2. Create Firebase account
      await signUpEmail(email, password, name);

      // 3. Fire welcome email (non-blocking)
      welcome({ data: { email, name } }).catch(() => {});

      // 4. Show success overlay — redirect happens inside the useEffect above
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setOtp("");
      setLoading(false);
    }
    // Note: don't setLoading(false) on success — keep button frozen during overlay
  };

  const google = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      welcome({ data: { email: "", name: "" } }).catch(() => {});
      // Google users skip email verify — go straight to success overlay
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const expiresIn = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  return (
    <>
      {/* Success overlay — renders on top of everything */}
      {step === "success" && <SuccessOverlay name={name} />}

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-subtle">
          <Link to="/">
            <Brand size="md" />
          </Link>
          <div>
            <p className="font-display text-3xl leading-snug">
              "Cleaner thinking in two clicks. It's the calmest tool on my dock."
            </p>
            <p className="mt-3 text-sm text-muted-foreground">— Theo, founder</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-sm fade-up">
            <Link to="/" className="lg:hidden mb-8 inline-block">
              <Brand size="md" />
            </Link>

            {/* ── STEP 1: Details ── */}
            {step === "details" && (
              <>
                <h1 className="font-display text-4xl">Create your account.</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Start turning noise into clarity. It's free.
                </p>
                <Button
                  onClick={google}
                  variant="outline"
                  disabled={googleLoading}
                  className="w-full mt-8 rounded-full h-11"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {googleLoading ? "Signing in…" : "Continue with Google"}
                </Button>
                <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> or{" "}
                  <div className="h-px flex-1 bg-border" />
                </div>
                <form onSubmit={submitDetails} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5"
                      autoComplete="email"
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
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      At least 8 characters, with a number and a capital letter.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full h-11"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {loading ? "Sending code…" : "Continue"}
                  </Button>
                </form>
              </>
            )}

            {/* ── STEP 2: Verify OTP ── */}
            {step === "verify" && (
              <div className="verify-fade-in">
                <button
                  onClick={() => !loading && setStep("details")}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" /> Back
                </button>

                {/* Envelope icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft">
                  <Sparkles className="h-6 w-6 text-violet" />
                </div>

                <h1 className="font-display text-4xl">Check your inbox.</h1>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium">{email}</span>.{" "}
                  {expiresIn > 0 && (
                    <>
                      Expires in{" "}
                      <span className="text-foreground tabular-nums font-medium">
                        {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}
                      </span>
                      .
                    </>
                  )}
                  {expiresIn === 0 && expiresAt > 0 && (
                    <span className="text-destructive"> Code expired.</span>
                  )}
                </p>

                {/* OTP boxes */}
                <div className="mt-8">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={verifyAndCreate}
                    disabled={loading}
                  />
                </div>

                {/* Verify button */}
                <Button
                  onClick={() => verifyAndCreate()}
                  disabled={loading || otp.length !== 6}
                  className="w-full mt-6 rounded-full h-11 relative overflow-hidden"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & create account"
                  )}
                </Button>

                {/* Resend */}
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Didn't get it?{" "}
                  <button
                    onClick={resend}
                    disabled={loading || cooldownLeft > 0}
                    className="text-foreground hover:underline disabled:opacity-40 disabled:no-underline transition-opacity"
                  >
                    {cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {/* Legal + sign-in link */}
            {step !== "success" && (
              <>
                <p className="text-xs text-muted-foreground text-center mt-6">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="underline">Terms</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-foreground hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
