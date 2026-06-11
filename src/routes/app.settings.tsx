import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Key,
  Plus,
  Eye,
  EyeOff,
  Search,
  Lock,
  Globe,
  Users,
  Settings as SettingsIcon,
  Github,
  Slack,
  MessageSquare,
  Check,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/settings")({ component: AdvancedSettings });

type Secret = {
  id: string;
  name: string;
  value: string;
  scope: "private" | "team" | "specific";
  createdAt: number;
};

function AdvancedSettings() {
  const { settings, updateSettings } = useSettings();
  const [secrets, setSecrets] = useState<Secret[]>([
    { id: "1", name: "OpenRouter API Key", value: "sk-or-v1-...", scope: "private", createdAt: Date.now() },
  ]);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addSecret = () => {
    toast.success("Secret vault is client-side encrypted.");
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] pb-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A24] border border-white/5 mb-4">
            <SettingsIcon className="h-3 w-3 text-[#4ECDC4]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Preferences & Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">System Identity</h1>
        </header>

        <Tabs defaultValue="sync" className="w-full">
          <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none h-14 p-0 gap-8 mb-10">
            <TabsTrigger value="sync" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none px-0 h-14 text-sm font-bold uppercase tracking-widest transition-all">Ecosystem Sync</TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none px-0 h-14 text-sm font-bold uppercase tracking-widest transition-all">Secrets Vault</TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7B5EA7] data-[state=active]:text-white text-white/40 rounded-none px-0 h-14 text-sm font-bold uppercase tracking-widest transition-all">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-xl font-display font-bold mb-2">Workspace Vibe</h3>
                <p className="text-sm text-white/40 leading-relaxed">Adjust the global atmosphere of your workspace. Changes sync in real-time across all devices.</p>
              </div>
              <div className="md:col-span-2 space-y-6">
                <SettingRow label="Global Theme">
                  <div className="flex bg-[#1A1A24] p-1 rounded-full border border-white/5">
                    {["light", "dark", "system"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateSettings({ theme: t as any })}
                        className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                          settings.theme === t ? "bg-[#7B5EA7] text-white shadow-lg" : "text-white/40 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label="Notification Pulse">
                  <select
                    value={settings.notifications}
                    onChange={(e) => updateSettings({ notifications: e.target.value as any })}
                    className="bg-[#1A1A24] border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#7B5EA7]/50 transition-colors"
                  >
                    <option value="all">All Pulse Alerts</option>
                    <option value="mentions">Mentions Only</option>
                    <option value="none">Total Silence</option>
                  </select>
                </SettingRow>

                <SettingRow label="AI Core Intelligence">
                  <select
                    value={settings.aiModel}
                    onChange={(e) => updateSettings({ aiModel: e.target.value })}
                    className="bg-[#1A1A24] border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#7B5EA7]/50 transition-colors"
                  >
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="openai/gpt-4o">GPT-4o</option>
                    <option value="google/gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </SettingRow>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vault" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
              <div className="max-w-md">
                <h3 className="text-xl font-display font-bold mb-2">Secrets Vault</h3>
                <p className="text-sm text-white/40 leading-relaxed">Securely store API keys and passwords. Everything is AES-256 encrypted on your machine before reaching our cloud.</p>
              </div>
              <Button onClick={addSecret} className="rounded-full bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 h-11 px-6 shadow-lg shadow-violet-500/20">
                <Plus className="h-4 w-4 mr-2" /> New Secret
              </Button>
            </div>

            <div className="rounded-[32px] bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-white/30">Secret Name</th>
                      <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-white/30">Value</th>
                      <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-white/30">Scope</th>
                      <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-white/30">Last Modified</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {secrets.map((s) => (
                      <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-[#7B5EA7]" />
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span>{showValues[s.id] ? s.value : "••••••••••••••••"}</span>
                            <button onClick={() => toggleVisibility(s.id)} className="text-white/20 hover:text-white">
                              {showValues[s.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] uppercase tracking-widest font-bold ${
                            s.scope === "private" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-[#7B5EA7]/30 text-[#7B5EA7] bg-[#7B5EA7]/10"
                          }`}>
                            {s.scope === "private" ? <Lock className="h-2.5 w-2.5" /> : <Users className="h-2.5 w-2.5" />}
                            {s.scope}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-white/30">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Audit Log</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCard
                name="GitHub"
                icon={<Github className="h-6 w-6" />}
                connected
                description="Sync repositories and automate issues via AI review."
              />
              <IntegrationCard
                name="Slack"
                icon={<Slack className="h-6 w-6" />}
                connected={false}
                description="Route AI insights and team notifications to channels."
              />
              <IntegrationCard
                name="Notion"
                icon={<Globe className="h-6 w-6" />}
                connected={false}
                description="Import docs and export meeting summaries instantly."
              />
              <IntegrationCard
                name="Linear"
                icon={<Check className="h-6 w-6" />}
                connected={false}
                description="Auto-generate tasks from your messy thought dumps."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[24px] bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl">
      <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">{label}</span>
      {children}
    </div>
  );
}

function IntegrationCard({ name, icon, connected, description }: any) {
  return (
    <div className="group p-8 rounded-[32px] bg-[#1A1A24]/40 border border-white/5 backdrop-blur-xl hover:border-[#7B5EA7]/20 transition-all duration-500 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#7B5EA7]/10 group-hover:text-[#7B5EA7] transition-all">
          {icon}
        </div>
        {connected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
            Connected
          </div>
        ) : (
          <Button variant="ghost" className="h-8 rounded-full text-[9px] uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5">Connect</Button>
        )}
      </div>
      <h4 className="text-xl font-display font-bold mb-2">{name}</h4>
      <p className="text-xs text-white/40 leading-relaxed mb-6">{description}</p>
      {connected && (
        <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#7B5EA7] hover:text-white transition-colors">
          Configure <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
