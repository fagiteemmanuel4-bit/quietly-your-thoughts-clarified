import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Brand, BetaPill } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { QuickCapture } from "@/components/QuickCapture";
import {
  Home, Pencil, Archive, ListChecks, Calendar, Users, Share2,
  Settings, Shield, LogOut, ChevronsLeft, ChevronsRight, Plus,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth/login" });
  }, [loading, user, nav]);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  const isAdmin = user.email === "admin@quietly.app" || user.email?.endsWith("@quietly.admin");
  const accountType = (typeof window !== "undefined" && localStorage.getItem("accountType")) || "Personal";

  const navItems = [
    { to: "/app", label: "Dashboard", icon: Home, exact: true },
    { to: "/app/workspace", label: "Workspace", icon: Pencil },
    { to: "/app/thoughts", label: "Thoughts", icon: Archive },
    { to: "/app/planner", label: "Planner", icon: ListChecks },
    { to: "/app/calendar", label: "Calendar", icon: Calendar },
    { to: "/app/team", label: "Team", icon: Users },
    { to: "/app/spaces", label: "Shared Spaces", icon: Share2 },
    { to: "/app/settings", label: "Settings", icon: Settings },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const mobileItems = [
    { to: "/app", label: "Home", icon: Home, exact: true },
    { to: "/app/workspace", label: "Write", icon: Pencil },
    { to: "/app/planner", label: "Tasks", icon: ListChecks },
    { to: "/app/team", label: "Team", icon: Users },
    { to: "/app/settings", label: "More", icon: Settings },
  ];

  const initial = (user.displayName || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex sticky top-0 h-screen shrink-0 flex-col border-r border-border/60 bg-subtle/40 transition-[width] duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-4`}>
          {!collapsed && <Brand size="md" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="mt-2 flex-1 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition ${
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-3 ${collapsed ? "space-y-2" : "space-y-3"}`}>
          {!collapsed ? (
            <div className="rounded-md border border-border/60 bg-card p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-medium">{initial}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate font-medium">{user.displayName || user.email}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{accountType}</p>
                </div>
                <BetaPill />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ThemeToggle />
                <Button onClick={() => logout()} variant="ghost" size="sm" className="text-muted-foreground h-7 px-2">
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-medium">{initial}</div>
              <ThemeToggle />
              <button onClick={() => logout()} className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 border-b border-border/60 bg-background/90 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><Brand size="sm" /><BetaPill /></div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => logout()} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Quick Capture FAB */}
      <button
        onClick={() => setQuickOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 h-12 w-12 rounded-full bg-foreground text-background grid place-items-center shadow-lift hover:scale-105 transition"
        aria-label="Quick capture"
        title="Quick capture (drop a thought)"
      >
        <Plus className="h-5 w-5" />
      </button>
      <QuickCapture open={quickOpen} onClose={() => setQuickOpen(false)} />

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-border/60 bg-background/95 backdrop-blur flex">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] transition ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
