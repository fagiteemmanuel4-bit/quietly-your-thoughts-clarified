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
import { Loader2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Quietly" },
      { name: "description", content: "Create your Quietly account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const welcome = useServerFn(sendWelcomeEmail);
  const askOtp = useServerFn(requestOtp);
  const checkOtp = useServerFn(verifyOtp);
  const nav = useNavigate();

  const [step, setStep] = useState<"details" | "verify">("details");
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

  useEffect(() => {
    if (step !== "verify") return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [step]);

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
      await checkOtp({ data: { email, code: c, token } });
      await signUpEmail(email, password, name);
      welcome({ data: { email, name } }).catch(() => {});
      toast.success("Welcome to Quietly.");
      nav({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      welcome({ data: { email: "", name: "" } }).catch(() => {});
      nav({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const expiresIn = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block">
            <Brand size="md" />
          </Link>

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
                {googleLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue with Google
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

          {step === "verify" && (
            <>
              <button
                onClick={() => !loading && setStep("details")}
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-6"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Back
              </button>
              <h1 className="font-display text-4xl">Check your inbox.</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                We sent a 6-digit code to <span className="text-foreground">{email}</span>.
                {expiresIn > 0 && (
                  <>
                    {" "}It expires in{" "}
                    <span className="text-foreground tabular-nums">
                      {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}
                    </span>
                    .
                  </>
                )}
              </p>
              <div className="mt-8">
                <OtpInput value={otp} onChange={setOtp} onComplete={verifyAndCreate} disabled={loading} />
              </div>
              <Button
                onClick={() => verifyAndCreate()}
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 rounded-full h-11"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & create account
              </Button>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Didn't get it?{" "}
                <button
                  onClick={resend}
                  disabled={loading || cooldownLeft > 0}
                  className="text-foreground hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
