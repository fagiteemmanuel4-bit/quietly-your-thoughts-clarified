import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Users, Zap, CreditCard, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

const ADMIN_EMAILS = ["admin@quietly.app"];

function AdminPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [demo] = useState({
    users: 1284,
    transformations: 18432,
    proUsers: 312,
    dailyActive: 487,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) nav({ to: "/auth/login" });
      else if (
        !ADMIN_EMAILS.includes(user.email ?? "") &&
        !user.email?.endsWith("@quietly.admin")
      ) {
        nav({ to: "/app" });
      }
    }
  }, [user, loading, nav]);

  if (loading || !user) return null;

  const stats = [
    { label: "Total users", value: demo.users.toLocaleString(), icon: Users },
    { label: "Transformations", value: demo.transformations.toLocaleString(), icon: Zap },
    { label: "Pro users", value: demo.proUsers.toLocaleString(), icon: CreditCard },
    { label: "Daily active", value: demo.dailyActive.toLocaleString(), icon: BarChart3 },
  ];

  const recentUsers = [
    { name: "Ava Chen", email: "ava@example.com", plan: "Pro", joined: "2h ago" },
    { name: "Noah Patel", email: "noah@example.com", plan: "Free", joined: "5h ago" },
    { name: "Sofia Park", email: "sofia@example.com", plan: "Pro", joined: "1d ago" },
    { name: "Liam Garcia", email: "liam@example.com", plan: "Free", joined: "1d ago" },
    { name: "Emma Wright", email: "emma@example.com", plan: "Free", joined: "2d ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 px-6 md:px-10 py-6">
        <h1 className="font-display text-3xl">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor users, usage, and plans.</p>
      </div>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="font-display text-3xl mt-3">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <h2 className="font-medium">Recent users</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-subtle/40">
              <tr>
                <th className="text-left px-5 py-3 font-normal">Name</th>
                <th className="text-left px-5 py-3 font-normal">Email</th>
                <th className="text-left px-5 py-3 font-normal">Plan</th>
                <th className="text-left px-5 py-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.email} className="border-t border-border/60">
                  <td className="px-5 py-3">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${u.plan === "Pro" ? "bg-foreground text-background" : "bg-accent text-muted-foreground"}`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Stats and users shown are seed data. Wire to Firestore aggregations and Firebase Auth
          admin SDK to populate live.
        </p>
      </div>
    </div>
  );
}
