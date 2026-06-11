import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { sendInviteEmail } from "@/lib/email/send.functions";
import { requestOtp, verifyOtp } from "@/lib/auth/otp.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OtpInput } from "@/components/OtpInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Mail, UserPlus, Lock, Trash2, Eye, EyeOff, Shield,
  Plus, Key, User, Bell, Loader2, ChevronRight, X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: Settings });

type Secret = { id: string; label: string; value: string; scope: "private" | "team" };

function Settings() {
  const { user, logout } = useAuth();
  const invite = useServerFn(sendInviteEmail);
  const askOtp = useServerFn(requestOtp);
  const checkOtp = useServerFn(verifyOtp);
  const nav = useNavigate();

  const [tab, setTab] = useState<"account" | "notifications" | "security" | "vault" | "invite">("account");
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // Password change state
  const [pwStep, setPwStep] = useState<"idle" | "otp" | "change">("idle");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwOtp, setPwOtp] = useState("");
  const [pwToken, setPwToken] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account state
  const [delOtp, setDelOtp] = useState("");
  const [delToken, setDelToken] = useState("");
  const [delStep, setDelStep] = useState<"idle" | "otp">("idle");
  const [delLoading, setDelLoading] = useState(false);

  // Secrets vault
  const [secrets, setSecrets] = useState<Secret[]>(() => {
    try { return JSON.parse(localStorage.getItem("qv_secrets") || "[]"); } catch { return []; }
  });
  const [showVaultAdd, setShowVaultAdd] = useState(false);
  const [vaultLabel, setVaultLabel] = useState("");
  const [vaultValue, setVaultValue] = useState("");
  const [vaultScope, setVaultScope] = useState<"private" | "team">("private");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const saveSecrets = (next: Secret[]) => {
    setSecrets(next);
    localStorage.setItem("qv_secrets", JSON.stringify(next));
  };

  const addSecret = () => {
    if (!vaultLabel || !vaultValue) return;
    const s: Secret = { id: Date.now().toString(), label: vaultLabel, value: vaultValue, scope: vaultScope };
    saveSecrets([...secrets, s]);
    setVaultLabel(""); setVaultValue(""); setShowVaultAdd(false);
    toast.success("Secret saved.");
  };

  const deleteSecret = (id: string) => {
    saveSecrets(secrets.filter(s => s.id !== id));
    toast.success("Secret deleted.");
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setBusy(true);
    try {
      const token = btoa(`${Date.now()}_${inviteEmail}_${Math.random()}`);
      await invite({
        data: {
          email: inviteEmail,
          inviterName: user?.displayName || undefined,
          workspaceName: "your Quietly team",
          inviteToken: token,
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

  const startPasswordChange = async () => {
    if (!user?.email) return;
    setPwLoading(true);
    try {
      const res = await askOtp({ data: { email: user.email, purpose: "change_password" } });
      setPwToken(res.token);
      setPwStep("otp");
      toast.success("Verification code sent to your email.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setPwLoading(false);
    }
  };

  const confirmPasswordOtp = async (code?: string) => {
    const c = (code ?? pwOtp).trim();
    if (c.length !== 6 || !user?.email) return;
    setPwLoading(true);
    try {
      await checkOtp({ data: { email: user.email, code: c, token: pwToken } });
      setPwStep("change");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
      setPwOtp("");
    } finally {
      setPwLoading(false);
    }
  };

  const submitPasswordChange = async () => {
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters.");
    if (newPw !== newPw2) return toast.error("Passwords don't match.");
    setPwLoading(true);
    try {
      const { updatePassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPw);
        toast.success("Password updated successfully.");
        setPwStep("idle"); setNewPw(""); setNewPw2(""); setPwOtp("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  const startDeleteAccount = async () => {
    if (!user?.email) return;
    setDelLoading(true);
    try {
      const res = await askOtp({ data: { email: user.email, purpose: "delete" } });
      setDelToken(res.token);
      setDelStep("otp");
      toast.success("Verification code sent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setDelLoading(false);
    }
  };

  const confirmDelete = async (code?: string) => {
    const c = (code ?? delOtp).trim();
    if (c.length !== 6 || !user?.email) return;
    setDelLoading(true);
    try {
      await checkOtp({ data: { email: user.email, code: c, token: delToken } });
      const { deleteUser } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        toast.success("Account deleted.");
        nav({ to: "/" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete account");
      setDelOtp("");
    } finally {
      setDelLoading(false);
    }
  };

  const TABS = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "vault", label: "Secrets Vault", icon: Key },
    { id: "invite", label: "Invite", icon: UserPlus },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-10 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition whitespace-nowrap ${
                    tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}>
                  <Icon className="h-4 w-4 shrink-0" /> {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* ── Account ── */}
          {tab === "account" && (
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-medium">Account info</h2>
              <div className="space-y-3 text-sm">
                <Row label="Name" value={user?.displayName || "—"} />
                <Row label="Email" value={user?.email || "—"} />
                <Row label="User ID" value={user?.uid || "—"} mono />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </section>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-medium">Notification preferences</h2>
              {[
                { label: "Team messages", sub: "Email when a teammate sends a message", key: "notif_team" },
                { label: "Task assignments", sub: "Email when a task is assigned to you", key: "notif_task" },
                { label: "Weekly digest", sub: "Summary of your activity every Monday", key: "notif_digest" },
              ].map(n => {
                const val = localStorage.getItem(n.key) !== "0";
                return (
                  <div key={n.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.sub}</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem(n.key, val ? "0" : "1");
                        toast.success(`${n.label} notifications ${val ? "disabled" : "enabled"}.`);
                      }}
                      className={`relative h-6 w-11 rounded-full transition-colors ${val ? "bg-foreground" : "bg-muted"}`}>
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-background transition-all ${val ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                );
              })}
            </section>
          )}

          {/* ── Security ── */}
          {tab === "security" && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-medium">Change password</h2>
                </div>
                {pwStep === "idle" && (
                  <Button onClick={startPasswordChange} disabled={pwLoading} variant="outline" className="w-full sm:w-auto">
                    {pwLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending code…</> : "Change password"}
                  </Button>
                )}
                {pwStep === "otp" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Enter the code sent to <strong>{user?.email}</strong>.</p>
                    <OtpInput value={pwOtp} onChange={setPwOtp} onComplete={confirmPasswordOtp} disabled={pwLoading} />
                    <Button onClick={() => confirmPasswordOtp()} disabled={pwLoading || pwOtp.length !== 6}>
                      {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Verify
                    </Button>
                  </div>
                )}
                {pwStep === "change" && (
                  <div className="space-y-3">
                    <div>
                      <Label>New password</Label>
                      <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Confirm new password</Label>
                      <Input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} className="mt-1.5" />
                    </div>
                    <Button onClick={submitPasswordChange} disabled={pwLoading}>
                      {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Update password
                    </Button>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <h2 className="font-medium text-destructive">Delete account</h2>
                </div>
                <p className="text-sm text-muted-foreground">Permanently deletes your account and all data. This cannot be undone.</p>
                {delStep === "idle" && (
                  <ConfirmDialog
                    title="Delete your account?"
                    description="This permanently deletes all your thoughts, tasks, and settings. A verification code will be sent to confirm."
                    confirmLabel="Yes, send verification code"
                    variant="destructive"
                    onConfirm={startDeleteAccount}
                    trigger={(open) => (
                      <Button variant="destructive" onClick={open} disabled={delLoading}>
                        {delLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete account
                      </Button>
                    )}
                  />
                )}
                {delStep === "otp" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Enter the code sent to <strong>{user?.email}</strong> to confirm deletion.</p>
                    <OtpInput value={delOtp} onChange={setDelOtp} onComplete={confirmDelete} disabled={delLoading} />
                    <Button variant="destructive" onClick={() => confirmDelete()} disabled={delLoading || delOtp.length !== 6}>
                      {delLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Permanently delete
                    </Button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Secrets Vault ── */}
          {tab === "vault" && (
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-medium">Secrets Vault</h2>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowVaultAdd(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add secret
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Store passwords, API keys, and sensitive info. Saved locally on this device.</p>

              {showVaultAdd && (
                <div className="rounded-lg border border-border p-4 space-y-3 bg-subtle/40">
                  <div><Label>Label</Label><Input value={vaultLabel} onChange={e => setVaultLabel(e.target.value)} className="mt-1" placeholder="e.g. OpenAI API Key" /></div>
                  <div><Label>Value</Label><Input value={vaultValue} onChange={e => setVaultValue(e.target.value)} className="mt-1" placeholder="sk-..." type="password" /></div>
                  <div className="flex items-center gap-2">
                    <Label>Scope:</Label>
                    {(["private", "team"] as const).map(s => (
                      <button key={s} onClick={() => setVaultScope(s)}
                        className={`px-3 py-1 rounded-full text-xs border transition ${vaultScope === s ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40"}`}>
                        {s === "private" ? "Private" : "Team visible"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addSecret}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowVaultAdd(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {secrets.length === 0 && !showVaultAdd && (
                <div className="text-center py-8 text-sm text-muted-foreground">No secrets stored yet.</div>
              )}

              <div className="space-y-2">
                {secrets.map(s => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                    <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.label}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {revealedIds.has(s.id) ? s.value : "••••••••••••"}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.scope === "team" ? "chip-violet" : "chip-sage"}`}>
                      {s.scope}
                    </span>
                    <button onClick={() => toggleReveal(s.id)} className="text-muted-foreground hover:text-foreground transition">
                      {revealedIds.has(s.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteSecret(s.id)} className="text-muted-foreground hover:text-destructive transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Invite ── */}
          {tab === "invite" && (
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-medium">Invite a teammate</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="teammate@company.com"
                />
                <Button onClick={sendInvite} disabled={!inviteEmail || busy}>
                  {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
                  {busy ? "Sending…" : "Send invite"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Invites are sent via email and contain a secure link that doesn't break if the domain changes.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right truncate max-w-[200px] ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
