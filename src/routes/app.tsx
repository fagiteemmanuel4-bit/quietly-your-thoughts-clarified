import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0D0D12] flex items-center justify-center">
        <div className="text-white/20 text-xs uppercase tracking-[0.3em] animate-pulse">Initializing Synthesis…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D12] flex">
      <AppSidebar />
      <main className="flex-1 pl-20 md:pl-64 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
