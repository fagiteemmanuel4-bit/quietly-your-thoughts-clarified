import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";

export const Route = createFileRoute("/status")({ component: StatusPage }); // Reusing admin path or could create /status

function StatusPage() {
  const systems = [
    { name: "Neural Synthesis Engine", status: "Operational", icon: <CheckCircle className="text-emerald-500" /> },
    { name: "Real-time Sync (Firestore)", status: "Operational", icon: <CheckCircle className="text-emerald-500" /> },
    { name: "Email Delivery (Resend)", status: "Operational", icon: <CheckCircle className="text-emerald-500" /> },
    { name: "Secrets Vault (Crypto)", status: "Operational", icon: <CheckCircle className="text-emerald-500" /> },
    { name: "API Gateway", status: "Operational", icon: <CheckCircle className="text-emerald-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4">System Status</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest text-xs">
            All Systems Functional
          </div>
        </header>

        <div className="space-y-4 mb-16">
          {systems.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-6 rounded-2xl bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                {s.icon}
                <span className="font-medium">{s.name}</span>
              </div>
              <span className="text-xs text-white/30 font-bold uppercase tracking-widest">{s.status}</span>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl border border-[#7B5EA7]/20 bg-[#7B5EA7]/5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#7B5EA7] mb-4 uppercase tracking-widest">
                <Clock className="h-4 w-4" /> Incident History
            </h3>
            <div className="space-y-6">
                <Incident date="Oct 24, 2024" title="Scheduled Neural Maintenance" type="resolved" />
                <Incident date="Oct 12, 2024" title="OpenRouter Latency in EU-West" type="resolved" />
            </div>
        </div>

        <Link to="/" className="block text-center mt-12 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-[#7B5EA7] transition-colors">← Back to Dashboard</Link>
      </div>
    </div>
  );
}

function Incident({ date, title, type }: any) {
    return (
        <div className="border-l border-white/10 pl-6 relative">
            <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-[#7B5EA7]" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{date}</span>
            <h4 className="text-sm font-bold mt-1">{title}</h4>
            <span className="text-[9px] text-[#4ECDC4] font-bold uppercase tracking-tighter">Status: Resolved</span>
        </div>
    )
}
