import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, Coffee, Focus } from "lucide-react";
import { toast } from "sonner";

export function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (interval) clearInterval(interval);
      const audio = new Audio(
        "https://assets.mixkit.co/sfx/preview/mixkit-simple-notification-alert-2630.mp3",
      );
      audio.play().catch(() => {});

      if (isBreak) {
        toast.success("Break over! Time to focus.");
        setTimeLeft(25 * 60);
        setIsBreak(false);
      } else {
        toast.success("Focus session complete! Take a breather.");
        setTimeLeft(5 * 60);
        setIsBreak(true);
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {isBreak ? (
            <Coffee className="h-4 w-4 text-sage" />
          ) : (
            <Focus className="h-4 w-4 text-violet" />
          )}
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            {isBreak ? "Break Time" : "Deep Focus"}
          </span>
        </div>
        <div className="h-2 w-2 rounded-full bg-sage pulse-dot" />
      </div>

      <div className="text-center mb-8">
        <div className="font-display text-5xl tabular-nums tracking-tighter">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={toggle}
          className="flex-1 rounded-full h-10 shadow-sm"
          variant={isActive ? "outline" : "default"}
        >
          {isActive ? (
            <>
              <Pause className="h-3.5 w-3.5 mr-2" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-2" /> Start
            </>
          )}
        </Button>
        <Button
          onClick={reset}
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
