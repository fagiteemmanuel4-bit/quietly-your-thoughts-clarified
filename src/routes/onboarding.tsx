import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Briefcase,
  Lightbulb,
  Palette,
  CheckCircle2,
  Users,
  User,
  Building,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const STEPS = [
  { id: "welcome", title: "Welcome to Quietly", icon: Sparkles },
  { id: "goals", title: "What's your goal?", icon: Target },
  { id: "environment", title: "Your environment", icon: Briefcase },
  { id: "use-case", title: "Primary use case", icon: Lightbulb },
  { id: "theme", title: "Choose your vibe", icon: Palette },
  { id: "final", title: "You're all set!", icon: CheckCircle2 },
];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    goal: "",
    environment: "",
    useCase: "",
    theme: "light",
  });
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const finish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        onboarded: true,
        preferences: data,
      });
      toast.success("Welcome aboard!");
      navigate({ to: "/app" });
    } catch (error) {
      toast.error("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const updateData = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-violet/20">
      <div className="max-w-xl w-full">
        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= currentStep ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="space-y-8 fade-up">
          <div className="flex items-center gap-3 text-muted-foreground">
            {(() => {
              const Icon = STEPS[currentStep].icon;
              return <Icon className="h-5 w-5" />;
            })()}
            <span className="text-xs uppercase tracking-widest font-medium">
              Step {currentStep + 1} of 6
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {STEPS[currentStep].title}
          </h1>

          <div className="min-h-[200px]">
            {currentStep === 0 && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Quietly is designed to help you clear the mental clutter. Let's personalize your
                experience to make sure you get the most out of your quiet time.
              </p>
            )}

            {currentStep === 1 && (
              <div className="grid gap-3">
                {[
                  "Clarity of thought",
                  "Better planning",
                  "Team collaboration",
                  "Self-reflection",
                ].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateData("goal", g)}
                    className={`p-4 rounded-xl border text-left transition ${
                      data.goal === g
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "solo", label: "Solo", icon: User },
                  { id: "team", label: "Team", icon: Users },
                  { id: "corp", label: "Corporate", icon: Building },
                ].map((e) => {
                  const Icon = e.icon;
                  return (
                    <button
                      key={e.id}
                      onClick={() => updateData("environment", e.id)}
                      className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition ${
                        data.environment === e.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{e.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-3">
                {[
                  "Meeting Notes",
                  "Daily Journaling",
                  "Task Management",
                  "Creative Brainstorming",
                ].map((u) => (
                  <button
                    key={u}
                    onClick={() => updateData("useCase", u)}
                    className={`p-4 rounded-xl border text-left transition ${
                      data.useCase === u
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => updateData("theme", "light")}
                  className={`group flex flex-col items-center gap-3 transition ${data.theme === "light" ? "scale-105" : "opacity-50"}`}
                >
                  <div className="h-24 w-32 rounded-xl bg-[#F9F7F4] border-4 border-white shadow-lift" />
                  <span className="text-xs font-bold tracking-widest uppercase">Light Paper</span>
                </button>
                <button
                  onClick={() => updateData("theme", "dark")}
                  className={`group flex flex-col items-center gap-3 transition ${data.theme === "dark" ? "scale-105" : "opacity-50"}`}
                >
                  <div className="h-24 w-32 rounded-xl bg-[#0E0E0E] border-4 border-zinc-800 shadow-lift" />
                  <span className="text-xs font-bold tracking-widest uppercase">Deep Ink</span>
                </button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center space-y-4">
                <div className="h-20 w-20 bg-sage/20 text-sage rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <p className="text-lg text-muted-foreground">
                  Your workspace is ready. We've tailored everything based on your preferences.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-8">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={currentStep === 0}
              className="rounded-full px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              onClick={next}
              disabled={
                loading ||
                (currentStep === 1 && !data.goal) ||
                (currentStep === 2 && !data.environment) ||
                (currentStep === 3 && !data.useCase)
              }
              className="rounded-full px-8 h-12 shadow-lift"
            >
              {currentStep === STEPS.length - 1 ? "Enter Workspace" : "Continue"}{" "}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
