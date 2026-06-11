import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Brain,
  Target,
  Zap,
  Users,
  ShieldCheck,
  Rocket
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

const STEPS = [
  {
    title: "Welcome to the Neural Era.",
    description: "Quietly is more than a workspace. It's an extension of your mind, designed to synthesize clarity from chaos.",
    icon: <Brain className="h-8 w-8 text-[#7B5EA7]" />,
    color: "#7B5EA7"
  },
  {
    title: "Messey Thoughts, Clean Output.",
    description: "Drop your raw brain dumps into the workspace. Our neural engine will organize them into actionable intelligence instantly.",
    icon: <Zap className="h-8 w-8 text-[#4ECDC4]" />,
    color: "#4ECDC4"
  },
  {
    title: "Collaborative Resonance.",
    description: "Shared Spaces allow you and your team to brainstorm in real-time. Everything is contextually synced via our AI core.",
    icon: <Users className="h-8 w-8 text-white/40" />,
    color: "#FFFFFF"
  },
  {
    title: "Security by Design.",
    description: "Your data is yours. Use our Secrets Vault for client-side encrypted storage of your most sensitive intelligence.",
    icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
    color: "#10b981"
  },
  {
    title: "Define Your Focus.",
    description: "What's your primary goal this week? We'll tailor the synthesis brief to highlight what matters most to you.",
    icon: <Target className="h-8 w-8 text-orange-400" />,
    color: "#fb923c"
  },
  {
    title: "Ready for Synthesis.",
    description: "You're all set. Your workspace is initialized and the neural engine is warming up.",
    icon: <Rocket className="h-8 w-8 text-indigo-400" />,
    color: "#818cf8"
  }
];

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const nav = useNavigate();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      nav({ to: "/app" });
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[160px] transition-colors duration-1000"
            style={{ backgroundColor: step.color }}
        />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
            <div className="h-20 w-20 rounded-[32px] bg-[#1A1A24]/60 border border-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl mb-8 animate-in zoom-in duration-700">
                {step.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {step.title}
            </h1>
            <p className="text-white/40 text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                {step.description}
            </p>
        </div>

        <div className="space-y-10">
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">Progress</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#7B5EA7]">{currentStep + 1} / {STEPS.length}</span>
                </div>
                <Progress value={progress} className="h-1 bg-white/5" />
            </div>

            <div className="flex gap-4">
                {currentStep > 0 && (
                    <Button
                        onClick={prev}
                        variant="ghost"
                        className="flex-1 h-14 rounded-2xl border border-white/5 text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                )}
                <Button
                    onClick={next}
                    className="flex-[2] h-14 rounded-2xl bg-white text-[#0D0D12] hover:bg-white/90 font-bold uppercase tracking-widest text-xs shadow-xl shadow-white/5 group"
                >
                    {currentStep === STEPS.length - 1 ? "Initialize Workspace" : "Continue"}
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
      </div>

      <div className="mt-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
        <Sparkles className="h-3 w-3 text-white/20" />
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/10">Neural Onboarding — v2.4</span>
      </div>
    </div>
  );
}
