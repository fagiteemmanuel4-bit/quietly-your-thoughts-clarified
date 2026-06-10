import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Brand, BetaPill } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { QuickCapture } from "@/components/QuickCapture";
import { FocusTimer } from "@/components/FocusTimer";
import {
  Home,
  Pencil,
  Archive,
  ListChecks,
  Calendar,
  Users,
  Share2,
  Settings,
  Shield,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Timer,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const accountType =
    (typeof window !== "undefined" && localStorage.getItem("accountType")) || "Personal";

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
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-4`}
        >
          {!collapsed && <Brand size="md" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
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
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
                <div className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-medium">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate font-medium">{user.displayName || user.email}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {accountType}
                  </p>
                </div>
                <BetaPill />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ThemeToggle />
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-7 px-2"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-medium">
                {initial}
              </div>
              <ThemeToggle />
              <button
                onClick={() => logout()}
                className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-16 glass flex items-center justify-between px-6 border-none rounded-b-3xl mx-2 mt-2 shadow-soft">
        <div className="flex items-center gap-2">
          <Brand size="sm" />
          <BetaPill />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:bg-accent haptic-touch"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Action Buttons Container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 flex flex-col gap-3">
        {/* Focus Timer Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="h-12 w-12 rounded-full bg-subtle border border-border/60 text-foreground grid place-items-center shadow-lift hover:scale-105 transition"
              aria-label="Focus timer"
            >
              <Timer className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            className="w-80 p-0 bg-transparent border-none shadow-none mb-4"
          >
            <FocusTimer />
          </PopoverContent>
        </Popover>

        {/* Quick Capture FAB */}
        <button
          onClick={() => setQuickOpen(true)}
          className="h-12 w-12 rounded-full bg-foreground text-background grid place-items-center shadow-lift hover:scale-105 transition"
          aria-label="Quick capture"
          title="Quick capture (drop a thought)"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <QuickCapture open={quickOpen} onClose={() => setQuickOpen(false)} />

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-6 inset-x-6 z-30 h-16 glass rounded-full flex items-center px-2 shadow-lift border-none">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] transition haptic-touch ${
                active ? "text-foreground scale-110" : "text-muted-foreground"
              }`}
            >
              <div
                className={`p-2 rounded-full transition-colors ${active ? "bg-foreground/5" : ""}`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
