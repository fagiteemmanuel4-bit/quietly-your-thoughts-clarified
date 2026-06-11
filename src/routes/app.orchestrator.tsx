import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Zap,
  ArrowRight,
  Sparkles,
  Command,
  Layers,
  Settings2,
  Trash2,
  Play,
  Loader2,
  Diamond,
} from "lucide-react";
import { toast } from "sonner";
import { transformText } from "@/lib/ai/transform.functions";

export const Route = createFileRoute("/app/orchestrator")({ component: Orchestrator });

type ModelStep = {
  id: string;
  model: string;
  prompt: string;
  output?: string;
};

function Orchestrator() {
  const [steps, setSteps] = useState<ModelStep[]>([
    {
      id: "1",
      model: "gpt-4o-mini",
      prompt: "Summarize the core concepts of the user input into 3 themes.",
    },
    {
      id: "2",
      model: "claude-3.5-sonnet",
      prompt: "Take the themes and expand them into a structured action plan for a technical lead.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const addStep = () => {
    setSteps([...steps, { id: crypto.randomUUID(), model: "gpt-4o-mini", prompt: "" }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<ModelStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const runChain = async () => {
    if (!userInput) {
      toast.error("Please provide initial input");
      return;
    }
    setIsProcessing(true);
    let currentInput = userInput;
    const newSteps = [...steps];

    try {
      for (let i = 0; i < newSteps.length; i++) {
        setCurrentStepIndex(i);
        const step = newSteps[i];

        // Map UI model names to OpenRouter specific IDs
        const modelMap: Record<string, string> = {
          "gpt-4o-mini": "openai/gpt-4o-mini",
          "claude-3-haiku": "anthropic/claude-3-haiku",
          "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
          "gpt-4o": "openai/gpt-4o",
        };

        // Use transformText server function
        const res = await transformText({
          data: {
            input: currentInput,
            format: "notes", // Fallback format
            context: step.prompt,
            model: modelMap[step.model] || step.model,
          },
        });

        step.output = res.output;
        currentInput = res.output; // Pass to next model
        setSteps([...newSteps]);
      }
      toast.success("Chain completed successfully");
    } catch (e) {
      toast.error("Chain interrupted: " + (e instanceof Error ? e.message : "Error"));
    } finally {
      setIsProcessing(false);
      setCurrentStepIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background/30 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-[20px] bg-indigo-500/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-indigo-500" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tight">
                Neural Orchestrator
              </h1>
            </div>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-[11px] font-bold">
              Sequence multiple models to synthesize deep intelligence.
            </p>
          </div>
          <Button
            onClick={runChain}
            disabled={isProcessing}
            size="lg"
            className="h-14 px-8 rounded-2xl bg-foreground text-background shadow-lift group"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Play className="h-5 w-5 mr-2 fill-background" />
            )}
            Run Intelligence Chain
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-[40px] bg-card border border-border/60 shadow-soft">
              <div className="flex items-center gap-2 mb-6">
                <Command className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Initial Context</h2>
              </div>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Paste your raw thoughts or project brief here..."
                className="min-h-[300px] rounded-3xl bg-background/50 border-border/40 focus:border-indigo-500/50 transition-colors p-6 text-base leading-relaxed"
              />
            </div>

            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
              <Zap className="h-5 w-5 text-indigo-500 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-indigo-900">Chain Logic</h4>
                <p className="text-xs text-indigo-900/60 leading-relaxed mt-1">
                  Each step passes its output to the next model. You can override the prompt for
                  each stage to sculpt the thinking process.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4 px-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Execution Steps
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={addStep}
                className="h-8 rounded-full text-[10px] uppercase font-bold tracking-widest"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Add Layer
              </Button>
            </div>

            <div className="space-y-4 relative">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative group p-8 rounded-[32px] border-2 transition-all ${
                    currentStepIndex === index
                      ? "border-indigo-500 bg-indigo-50/10 shadow-lift scale-[1.02]"
                      : "border-border/40 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-subtle border border-border/40 flex items-center justify-center font-display text-xs font-bold">
                        {index + 1}
                      </div>
                      <select
                        value={step.model}
                        onChange={(e) => updateStep(step.id, { model: e.target.value })}
                        className="bg-transparent border-none text-sm font-display outline-none cursor-pointer hover:text-indigo-500 transition-colors"
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                        <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Pro)</option>
                        <option value="gpt-4o">GPT-4o (Pro)</option>
                      </select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(step.id)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      value={step.prompt}
                      onChange={(e) => updateStep(step.id, { prompt: e.target.value })}
                      placeholder="Enter transformation prompt..."
                      className="min-h-[100px] bg-background/50 border-none focus:ring-0 rounded-2xl resize-none p-4 text-sm"
                    />

                    {step.output && (
                      <div className="p-4 rounded-2xl bg-subtle/30 border border-border/20 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            Output
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/80 line-clamp-4">
                          {step.output}
                        </p>
                      </div>
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10">
                      <div className="h-12 w-px bg-gradient-to-b from-indigo-500 to-transparent" />
                      <ArrowRight className="h-4 w-4 text-indigo-500 rotate-90 -translate-x-1.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
