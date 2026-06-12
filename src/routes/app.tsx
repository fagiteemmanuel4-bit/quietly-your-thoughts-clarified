import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Brand, OwlLogo } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReviewPopup } from "@/components/ReviewPopup";
import { QuickCapture } from "@/components/QuickCapture";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, MessageSquareText, Archive, CheckSquare,
  Calendar, Users, Share2, Settings, HelpCircle, LogOut,
  PanelLeftClose, PanelLeftOpen, Plus, Menu, X,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app",           label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/app/workspace", label: "Workspace",  icon: MessageSquareText },
  { to: "/app/thoughts",  label: "Thoughts",   icon: Archive },
  { to: "/app/planner",   label: "Planner",    icon: CheckSquare },
  { to: "/app/calendar",  label: "Calendar",   icon: Calendar },
  { to: "/app/team",      label: "Team",       icon: Users },
  { to: "/app/spaces",    label: "Spaces",     icon: Share2 },
];
const NAV_BOTTOM = [
  { to: "/app/help",     label: "Help",     icon: HelpCircle },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const routerState = useRouterState();
  const path = routerState.location.pathname;

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen]   = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const handleLogout = async () => {
    await logout();
    nav({ to: "/" });
  };

  const NavItem = ({ to, label, icon: Icon, exact }: typeof NAV[0]) => {
    const active = isActive(to, exact);
    return (
      <Link to={to} onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
          active
            ? "nav-item-active shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}>
        <Icon className={`h-4 w-4 shrink-0 ${active ? "" : "group-hover:scale-110 transition-transform"}`} />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  // Sidebar content shared between desktop + mobile drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-14 px-4 border-b border-border shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {collapsed
          ? <OwlLogo size={26} className="text-foreground" />
          : <Brand size="sm" />}
        <button onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Quick capture */}
      <div className={`px-3 py-3 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        <button onClick={() => setQuickOpen(true)}
          className={`flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 text-white shadow-sm hover:opacity-90 ${
            collapsed ? "h-9 w-9 justify-center" : "w-full px-3 py-2.5"
          }`}
          style={{ background: "var(--green)" }}>
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && "Quick capture"}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-border space-y-0.5 shrink-0">
        {NAV_BOTTOM.map(item => <NavItem key={item.to} {...item} />)}

        {/* Theme + Logout */}
        <div className={`flex items-center mt-2 ${collapsed ? "justify-center" : "justify-between px-1"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "Q"}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user?.displayName ?? user?.email}</p>
            </div>
          )}
          <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
            <ThemeToggle />
            <ConfirmDialog
              title="Sign out?"
              description="You'll need to sign back in to access your workspace."
              confirmLabel="Sign out"
              onConfirm={handleLogout}
              trigger={open => (
                <button onClick={open}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 border-r border-border bg-subtle transition-[width] duration-200 ${
        collapsed ? "w-[60px]" : "w-56"
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border z-50 md:hidden flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between h-12 px-4 border-b border-border bg-background/90 backdrop-blur-sm shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <OwlLogo size={24} className="text-foreground" />
          <ThemeToggle />
        </div>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="flex md:hidden items-center border-t border-border bg-background/95 backdrop-blur-sm shrink-0 px-1">
          {[...NAV.slice(0,5)].map(item => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                }`}>
                <Icon className={`h-5 w-5 ${active ? "text-green-600 dark:text-green-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <QuickCapture open={quickOpen} onClose={() => setQuickOpen(false)} />
      <ReviewPopup />
    </div>
  );
}
