import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  MessageSquare,
  ListChecks,
  Calendar,
  Settings,
  LogOut,
  Brain,
  Search,
  Bell,
  Home,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationCentre } from "./NotificationCentre";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "Thinker";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-[#0D0D12] border-r border-white/5 hidden md:flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] flex items-center justify-center shadow-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="hidden md:block font-display text-lg font-bold tracking-tight text-white">Quietly</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          <div>
            <h3 className="hidden md:block px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-4">Core</h3>
            <nav className="space-y-1">
              <SidebarLink to="/app" icon={<LayoutDashboard />} label="Dashboard" />
              <SidebarLink to="/app/workspace" icon={<Sparkles />} label="Workspace" />
              <SidebarLink to="/app/spaces" icon={<Layers />} label="Spaces" />
            </nav>
          </div>

          <div>
            <h3 className="hidden md:block px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-4">Intelligence</h3>
            <nav className="space-y-1">
              <SidebarLink to="/app/planner" icon={<ListChecks />} label="Planner" />
              <SidebarLink to="/app/calendar" icon={<Calendar />} label="Calendar" />
              <SidebarLink to="/app/thoughts" icon={<Search />} label="Archive" />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between px-2">
              <NotificationCentre />
              <Link to="/app/settings">
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                    <Settings className="h-5 w-5" />
                </Button>
              </Link>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
            <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback className="bg-[#1A1A24] text-white/60">{firstName[0]}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{firstName}</p>
              <p className="text-[10px] text-white/40 truncate uppercase tracking-widest">Deep Thinker</p>
            </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex text-white/20 hover:text-red-500 transition-colors">
                    <LogOut className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1A1A24] border-white/5 text-white rounded-[24px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>End Session?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/40">Are you sure you want to log out of your neural workspace?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/5 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} className="bg-red-500 hover:bg-red-600 text-white">Log Out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 inset-x-6 z-50 h-16 bg-[#1A1A24]/80 backdrop-blur-2xl rounded-full border border-white/5 flex items-center justify-around px-4 shadow-2xl">
          <MobileLink to="/app" icon={<Home />} />
          <MobileLink to="/app/workspace" icon={<Sparkles />} />
          <MobileLink to="/app/spaces" icon={<Layers />} />
          <MobileLink to="/app/thoughts" icon={<FileText />} />
          <MobileLink to="/app/settings" icon={<Settings />} />
      </nav>
    </>
  );
}

function SidebarLink({ to, icon, label }: { to: any, icon: any, label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group [&.active]:text-white [&.active]:bg-[#7B5EA7]/10 [&.active]:border [&.active]:border-[#7B5EA7]/20"
    >
      <div className="h-5 w-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="hidden md:block text-sm font-bold tracking-tight">{label}</span>
    </Link>
  );
}

function MobileLink({ to, icon }: { to: any, icon: any }) {
    return (
        <Link
            to={to}
            className="p-3 rounded-2xl text-white/20 transition-all [&.active]:text-[#7B5EA7] [&.active]:bg-[#7B5EA7]/10 [&.active]:scale-110"
        >
            <div className="h-5 w-5">
                {icon}
            </div>
        </Link>
    );
}
