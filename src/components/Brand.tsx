import { Link } from "@tanstack/react-router";

export function Brand({ size = "md", to = "/" }: { size?: "sm" | "md" | "lg"; to?: string }) {
  const sz = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      {/* Simple dot mark */}
      <span className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
        <span className="h-2 w-2 rounded-full bg-background" />
      </span>
      <span className={`font-display font-semibold tracking-tight text-foreground ${sz}`}>
        Quietly
      </span>
    </Link>
  );
}

export function BetaPill({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-violet-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet border border-violet/20 ${className}`}>
      Beta
    </span>
  );
}
