import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Home, History, Shield, LogOut } from "lucide-react";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  const isAdmin = user.email === "admin@quietly.app" || user.email?.endsWith("@quietly.admin");

  const navItems = [
    { to: "/app", label: "Workspace", icon: Home, exact: true },
    { to: "/app/history", label: "History", icon: History },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-subtle/40 p-4">
        <Link to="/" className="px-2 py-2"><Brand size="md" /></Link>
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm truncate">{user.displayName || user.email}</p>
            <Button onClick={() => logout()} variant="ghost" size="sm" className="w-full mt-2 justify-start text-muted-foreground">
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
