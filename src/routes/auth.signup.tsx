import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { sendOTP, verifyOTP } from "@/lib/auth.functions";
import { sendWelcomeEmail } from "@/lib/email/send.functions";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const welcome = useServerFn(sendWelcomeEmail);
  const triggerOTP = useServerFn(sendOTP);
  const checkOTP = useServerFn(verifyOTP);
  const nav = useNavigate();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await triggerOTP({ data: { email } });
      setStep("otp");
      setResendTimer(60);
      toast.success("Verification code sent.");
    } catch (err) {
      toast.error("Could not send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await checkOTP({ data: { email, otp } });
      if (!res.success) {
        toast.error(res.message || "Invalid code.");
        return;
      }

      await signUpEmail(email, password, name);
      welcome({ data: { email, name } }).catch(() => {});
      nav({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await triggerOTP({ data: { email } });
      setResendTimer(60);
      toast.success("New code sent.");
    } catch (err) {
      toast.error("Resend failed.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      await signInGoogle();
      nav({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-white/[0.02] border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[#7B5EA7] blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#4ECDC4] blur-[150px]" />
        </div>

        <Link to="/">
          <Brand size="md" />
        </Link>
        <div className="relative z-10">
          <p className="font-display text-4xl leading-snug tracking-tight">
            "Quietly is where my messiest brainstorms find their structure."
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">— Synthesis Engine v2.0</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link to="/" className="lg:hidden mb-12 inline-block">
            <Brand size="md" />
          </Link>

          {step === "details" ? (
            <>
              <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Create Account</h1>
              <p className="text-white/40 text-sm mb-10">Start turning noise into clarity. Free forever.</p>

              <Button onClick={google} disabled={loading} variant="outline" className="w-full rounded-2xl h-12 bg-white/[0.02] border-white/10 hover:bg-white/5 group relative overflow-hidden">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Google"}
              </Button>

              <div className="flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/20">or email</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <form onSubmit={handleStartSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-2xl h-12 bg-white/[0.02] border-white/10 focus:border-[#7B5EA7]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-2xl h-12 bg-white/[0.02] border-white/10 focus:border-[#7B5EA7]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-2xl h-12 bg-white/[0.02] border-white/10 focus:border-[#7B5EA7]/50"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 text-white shadow-lg shadow-violet-500/20 font-bold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Access"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight mb-4 text-center">Verify Identity</h1>
              <p className="text-white/40 text-sm mb-10 text-center">We sent a 6-digit code to <br/><span className="text-white font-medium">{email}</span></p>

              <div className="flex justify-center mb-10">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleVerifyOTP}>
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="w-12 h-14 rounded-xl bg-white/[0.02] border-white/10 text-xl font-bold focus:border-[#7B5EA7] text-[#7B5EA7]" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="w-full rounded-2xl h-12 bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 text-white shadow-lg shadow-violet-500/20 font-bold mb-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Create Account"}
              </Button>

              <button
                onClick={handleResend}
                disabled={loading || resendTimer > 0}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold ${resendTimer > 0 ? "text-white/20" : "text-[#7B5EA7] hover:text-white"} transition-colors`}
              >
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Verification Code"}
              </button>
            </div>
          )}

          <p className="text-[10px] text-white/20 text-center mt-12 uppercase tracking-widest font-bold">
            Quietly v2.0 — Secure Workspace Environment
          </p>
        </div>
      </div>
    </div>
  );
}
