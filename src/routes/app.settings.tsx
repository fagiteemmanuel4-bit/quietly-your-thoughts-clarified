import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { sendInviteEmail } from "@/lib/email/send.functions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, UserPlus, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const { user } = useAuth();
  const invite = useServerFn(sendInviteEmail);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-10 py-8 space-y-6">
        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">Account</h2>
          <div className="space-y-2 text-sm">
            <Row label="Name" value={user?.displayName || "—"} />
            <Row label="Email" value={user?.email || "—"} />
            <Row label="User ID" value={user?.uid || "—"} mono />
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Invite a teammate</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
              placeholder="teammate@company.com"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-transparent text-sm outline-none focus:border-ring"
            />
            <Button onClick={sendInvite} disabled={!inviteEmail || busy}>
              <Mail className="h-4 w-4 mr-1.5" /> {busy ? "Sending…" : "Send invite"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Invites are sent via Resend.</p>
        </section>

        <section className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Billing & units</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You're on the Beta plan. Billing arrives soon.
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`truncate text-foreground/90 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}
